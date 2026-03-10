import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/utils/auth";
import { APIError, getErrorResponse, ErrorCode } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";
import { createCheckoutSession } from "@/lib/integrations/korapay";
import { validateSheetAccess } from "@/lib/integrations/google-sheets";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { surveyId } = body;

    if (!surveyId) {
      throw new APIError(
        ErrorCode.INVALID_REQUEST,
        "Survey ID is required",
        400
      );
    }

    // Get survey
    const { data: survey } = await supabaseAdmin
      .from("surveys")
      .select("*")
      .eq("id", surveyId)
      .eq("creator_id", user.id)
      .single();

    if (!survey) {
      throw new APIError(
        ErrorCode.SURVEY_NOT_FOUND,
        "Survey not found",
        404
      );
    }

    if (survey.status !== "draft") {
      throw new APIError(
        ErrorCode.INVALID_REQUEST,
        "Only draft surveys can be funded",
        400
      );
    }

    // Get profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    if (!profile) {
      throw new APIError(
        ErrorCode.UNAUTHORIZED,
        "User profile not found",
        401
      );
    }

    // Validate Google Sheet access
    const sheetAccessible = await validateSheetAccess(survey.google_sheet_url);
    if (!sheetAccessible) {
      throw new APIError(
        ErrorCode.SHEET_ERROR,
        "Cannot access Google Sheet. Ensure it's publicly shared.",
        400
      );
    }

    // Create checkout session
    const checkoutUrl = await createCheckoutSession(
      survey.title,
      survey.reward,
      survey.response_cap,
      profile.email,
      user.id,
      surveyId
    );

    logger.info(
      "Checkout session created",
      {
        surveyId,
        amount: survey.reward * survey.response_cap,
      },
      user.id,
      surveyId
    );

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl,
        surveyId,
        totalBudget: survey.reward * survey.response_cap,
        platformFee: ((survey.reward * survey.response_cap) * 5) / 100,
      },
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
