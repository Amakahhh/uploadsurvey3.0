import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { APIError, getErrorResponse, ErrorCode } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";
import { verifyWebhookSignature } from "@/lib/integrations/korapay";

interface KorapayWebhookPayload {
  event: string;
  data?: {
    reference: string;
    status: string;
    amount: number;
    metadata?: {
      surveyId: string;
      researcherId: string;
      reward: number;
      responseCap: number;
      platformFee: number;
    };
  };
}

const isIdempotent = (() => {
  const processedReferences = new Set<string>();
  return (reference: string) => {
    if (processedReferences.has(reference)) {
      return false;
    }
    processedReferences.add(reference);
    return true;
  };
})();

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const text = await request.text();
    const signature = request.headers.get("x-korapay-signature") || "";

    // Verify signature
    if (!verifyWebhookSignature(text, signature)) {
      logger.warn("Invalid webhook signature", { signature });
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload: KorapayWebhookPayload = JSON.parse(text);

    // Only handle successful payments
    if (payload.event !== "charge.success" || !payload.data) {
      return NextResponse.json({ success: true });
    }

    const { reference, status, amount, metadata } = payload.data;

    // Idempotency check
    if (!isIdempotent(reference)) {
      logger.info("Duplicate webhook - already processed", { reference });
      return NextResponse.json({ success: true });
    }

    if (!metadata?.surveyId || !metadata?.researcherId) {
      logger.warn("Missing metadata in webhook", { reference });
      return NextResponse.json(
        { success: false, error: "Missing metadata" },
        { status: 400 }
      );
    }

    // Check if payment already recorded
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("korapay_reference", reference)
      .single();

    if (existingPayment) {
      logger.info("Payment already recorded", { reference });
      return NextResponse.json({ success: true });
    }

    // Record payment
    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        researcher_id: metadata.researcherId,
        survey_id: metadata.surveyId,
        amount: metadata.reward * metadata.responseCap,
        platform_fee: metadata.platformFee,
        total_amount: amount,
        status: "completed",
        korapay_reference: reference,
        metadata: payload.data,
      });

    if (paymentError) {
      logger.error("Failed to record payment", paymentError);
      throw new APIError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Payment recording failed",
        500
      );
    }

    // Activate survey
    const { error: updateError } = await supabaseAdmin
      .from("surveys")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.surveyId);

    if (updateError) {
      logger.error("Failed to activate survey", updateError);
      throw new APIError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Survey activation failed",
        500
      );
    }

    // Optionally: Create escrow entry for researcher
    // This would hold the funds until survey completion

    logger.info(
      "Payment processed and survey activated",
      {
        reference,
        surveyId: metadata.surveyId,
        amount,
      },
      metadata.researcherId,
      metadata.surveyId
    );

    return NextResponse.json({ success: true, data: { reference } });
  } catch (error) {
    logger.error("Webhook processing error", error as Error);
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
