import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/utils/auth";
import { APIError, errorResponses, getErrorResponse, ErrorCode } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";
import { getWalletBalance, debitUserWallet } from "@/lib/utils/wallet";
import { processPayout } from "@/lib/integrations/korapay";

const MINIMUM_WITHDRAWAL = 500; // in naira

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { amount, bankName, accountNumber, accountHolderName } = body;

    // Validation
    if (!amount || !bankName || !accountNumber || !accountHolderName) {
      throw new APIError(
        ErrorCode.INVALID_REQUEST,
        "Missing required fields",
        400
      );
    }

    const parsedAmount = parseFloat(amount);

    if (parsedAmount < MINIMUM_WITHDRAWAL) {
      throw new APIError(
        ErrorCode.MINIMUM_WITHDRAWAL_NOT_MET,
        `Minimum withdrawal amount is ${MINIMUM_WITHDRAWAL} naira`,
        400
      );
    }

    // Check balance
    const balance = await getWalletBalance(user.id);

    if (balance < parsedAmount) {
      throw errorResponses.insufficientBalance();
    }

    // Create withdrawal record (pending)
    const { data: withdrawal } = await supabaseAdmin
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount: parsedAmount,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder_name: accountHolderName,
        status: "pending",
      })
      .select()
      .single();

    if (!withdrawal) {
      throw new APIError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to create withdrawal record",
        500
      );
    }

    // Process payout via KoraPay
    let payoutResult;
    try {
      payoutResult = await processPayout(
        user.id,
        parsedAmount,
        bankName,
        accountNumber,
        accountHolderName
      );
    } catch (error) {
      // Update withdrawal as failed
      await supabaseAdmin
        .from("withdrawals")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq("id", withdrawal.id);

      throw error;
    }

    // Update withdrawal with korapay reference
    await supabaseAdmin
      .from("withdrawals")
      .update({
        korapay_reference: payoutResult.reference,
        status: "processing",
      })
      .eq("id", withdrawal.id);

    // Debit wallet immediately (reserved)
    await debitUserWallet(
      user.id,
      parsedAmount,
      `withdrawal_${withdrawal.id}`,
      `Withdrawal to ${bankName} account`
    );

    // Update wallet total_withdrawn
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("total_withdrawn")
      .eq("user_id", user.id)
      .single();

    await supabaseAdmin
      .from("wallets")
      .update({
        total_withdrawn: (wallet?.total_withdrawn || 0) + parsedAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    logger.info(
      "Withdrawal initiated",
      {
        amount: parsedAmount,
        bank: bankName,
        reference: payoutResult.reference,
      },
      user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          withdrawalId: withdrawal.id,
          reference: payoutResult.reference,
          status: "processing",
          amount: parsedAmount,
          bank: bankName,
          message: `Your withdrawal of ${parsedAmount} naira has been initiated. It will be processed within 24-48 hours.`,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}

// Get withdrawal history
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { data: withdrawals } = await supabaseAdmin
      .from("withdrawals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: withdrawals || [],
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
