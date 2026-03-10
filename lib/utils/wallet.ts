import { supabaseAdmin } from "@/lib/supabase/admin";
import { APIError, ErrorCode } from "./errors";
import { logger } from "./logger";

const LOCK_TIMEOUT_MS = 5000;

export interface WalletCreditResult {
  success: boolean;
  newBalance: number;
  ledgerId: string;
}

export const creditUserWallet = async (
  userId: string,
  amount: number,
  surveyId: string,
  reference: string,
  description: string
): Promise<WalletCreditResult> => {
  try {
    // Check for duplicate payment
    const { data: existingPayment } = await supabaseAdmin
      .from("ledger")
      .select("id")
      .eq("user_id", userId)
      .eq("survey_id", surveyId)
      .eq("type", "credit")
      .single();

    if (existingPayment) {
      logger.warn(
        "Duplicate payment attempt detected",
        { userId, surveyId, amount },
        userId,
        surveyId
      );
      throw new APIError(
        ErrorCode.DUPLICATE_PAYMENT,
        "Payment already processed for this survey",
        400
      );
    }

    // Start transaction
    const { error: txError, data: result } = await supabaseAdmin.rpc(
      "credit_wallet",
      {
        p_user_id: userId,
        p_amount: amount,
        p_survey_id: surveyId,
        p_reference: reference,
        p_description: description,
      }
    );

    if (txError) {
      logger.error("Wallet credit failed", txError, userId, surveyId);
      throw new APIError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to credit wallet",
        500
      );
    }

    logger.info(
      `Wallet credited: ${amount} naira`,
      { surveyId, reference },
      userId,
      surveyId
    );

    return {
      success: true,
      newBalance: result?.new_balance || amount,
      ledgerId: result?.ledger_id || "",
    };
  } catch (error) {
    if (error instanceof APIError) throw error;
    
    logger.error("Unexpected error in creditUserWallet", error as Error, userId, surveyId);
    throw new APIError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to process wallet credit",
      500
    );
  }
};

export const getWalletBalance = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error) {
      logger.error("Get wallet balance failed", error, userId);
      return 0;
    }

    return data?.balance || 0;
  } catch (error) {
    logger.error("Unexpected error in getWalletBalance", error as Error, userId);
    return 0;
  }
};

export const debitUserWallet = async (
  userId: string,
  amount: number,
  reference: string,
  description: string
): Promise<WalletCreditResult> => {
  try {
    const currentBalance = await getWalletBalance(userId);

    if (currentBalance < amount) {
      throw new APIError(
        ErrorCode.INSUFFICIENT_BALANCE,
        "Insufficient wallet balance",
        400
      );
    }

    // Update wallet
    const { error: walletError } = await supabaseAdmin
      .from("wallets")
      .update({
        balance: currentBalance - amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (walletError) {
      throw new APIError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to debit wallet",
        500
      );
    }

    // Create ledger entry
    const { data: ledgerData, error: ledgerError } = await supabaseAdmin
      .from("ledger")
      .insert({
        user_id: userId,
        amount,
        type: "debit",
        reference,
        description,
      })
      .select("id")
      .single();

    if (ledgerError) {
      logger.error("Ledger entry creation failed", ledgerError, userId);
      throw new APIError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to create transaction record",
        500
      );
    }

    logger.info(
      `Wallet debited: ${amount} naira`,
      { reference },
      userId
    );

    return {
      success: true,
      newBalance: currentBalance - amount,
      ledgerId: ledgerData?.id || "",
    };
  } catch (error) {
    if (error instanceof APIError) throw error;

    logger.error("Unexpected error in debitUserWallet", error as Error, userId);
    throw new APIError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to process wallet debit",
      500
    );
  }
};

export const getLedgerHistory = async (userId: string, limit = 50) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("ledger")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Get ledger history failed", error, userId);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error("Unexpected error in getLedgerHistory", error as Error, userId);
    return [];
  }
};
