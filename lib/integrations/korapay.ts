import crypto from "crypto";
import { APIError, ErrorCode } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

interface CheckoutSession {
  status: "200" | "400" | string;
  message: string;
  data?: {
    checkout_url: string;
    reference: string;
  };
}

interface PayoutRequest {
  recipient_name: string;
  account_number: string;
  bank_code: string;
  amount: number;
  narration?: string;
}

interface PayoutResponse {
  status: string;
  message: string;
  data?: {
    reference: string;
    status: string;
  };
}

interface WebhookPayload {
  event: string;
  data?: {
    reference: string;
    status: string;
    amount: number;
    [key: string]: any;
  };
}

const PLATFORM_FEE_PERCENT = 5;
const API_BASE_URL = "https://api.korapay.com/merchant/api/v1";
const useMockKorapay =
  process.env.MOCK_EXTERNAL_SERVICES === "true" ||
  !process.env.KORAPAY_SECRET_KEY;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
});

/**
 * Create Korapay checkout session for survey funding
 */
export const createCheckoutSession = async (
  surveyTitle: string,
  reward: number,
  responseCap: number,
  researcherEmail: string,
  researcherId: string,
  surveyId: string
): Promise<string> => {
  try {
    if (useMockKorapay) {
      return `https://mock-korapay.com/checkout?reference=survey_${surveyId}_${Date.now()}`;
    }

    const surveyBudget = reward * responseCap;
    const platformFee = (surveyBudget * PLATFORM_FEE_PERCENT) / 100;
    const totalAmount = surveyBudget + platformFee;

    const payload = {
      amount: Math.ceil(totalAmount),
      currency: "NGN",
      reference: `survey_${surveyId}_${Date.now()}`,
      description: `Survey Funding: ${surveyTitle}`,
      customer: {
        name: researcherEmail.split("@")[0],
        email: researcherEmail,
      },
      metadata: {
        surveyId,
        researcherId,
        reward,
        responseCap,
        platformFee,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/surveys/${surveyId}?payment=success`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/korapay`,
    };

    const response = await fetch(
      `${API_BASE_URL}/charges/initialize`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data: CheckoutSession = await response.json();

    if (data.status !== "200" || !data.data?.checkout_url) {
      logger.error(
        "Checkout creation failed",
        { status: data.status, message: data.message },
        researcherId,
        surveyId
      );
      throw new APIError(
        ErrorCode.PAYMENT_FAILED,
        "Failed to create payment session",
        400
      );
    }

    logger.info(
      "Checkout session created",
      { reference: data.data.reference, amount: totalAmount },
      researcherId,
      surveyId
    );

    return data.data.checkout_url;
  } catch (error) {
    if (error instanceof APIError) throw error;

    logger.error("Error creating checkout session", error as Error, researcherId, surveyId);
    throw new APIError(
      ErrorCode.PAYMENT_FAILED,
      "Payment initialization failed",
      400
    );
  }
};

/**
 * Verify webhook signature from Korapay
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string
): boolean => {
  try {
    if (useMockKorapay) return true;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.KORAPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    return isValid;
  } catch (error) {
    logger.error("Webhook signature verification failed", error as Error);
    return false;
  }
};

/**
 * Process payout to user's bank account
 */
export const processPayout = async (
  userId: string,
  amount: number,
  bankName: string,
  accountNumber: string,
  accountHolderName: string
): Promise<{ reference: string; status: string }> => {
  try {
    if (useMockKorapay) {
      return {
        reference: `mock_payout_${userId}_${Date.now()}`,
        status: "success",
      };
    }

    if (amount < 500) {
      throw new APIError(
        ErrorCode.MINIMUM_WITHDRAWAL_NOT_MET,
        "Minimum withdrawal amount is 500 naira",
        400
      );
    }

    // Get bank code (this is a simplified version - you'd need a complete bank list)
    const bankCode = getBankCode(bankName);
    if (!bankCode) {
      throw new APIError(
        ErrorCode.INVALID_REQUEST,
        `Bank ${bankName} not supported`,
        400
      );
    }

    const reference = `payout_${userId}_${Date.now()}`;

    const payload = {
      amount: Math.ceil(amount),
      currency: "NGN",
      reference,
      recipient: {
        type: "individual",
        account_number: accountNumber,
        bank_code: bankCode,
        name: accountHolderName,
      },
      narration: `SurveyHustler Payout - ${accountHolderName}`,
      metadata: {
        userId,
      },
    };

    const response = await fetch(
      `${API_BASE_URL}/payouts/transfer`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data: PayoutResponse = await response.json();

    if (!data.data?.reference) {
      logger.error(
        "Payout creation failed",
        { status: data.status, message: data.message },
        userId
      );
      throw new APIError(
        ErrorCode.PAYMENT_FAILED,
        "Payout processing failed",
        400
      );
    }

    logger.info(
      "Payout initiated",
      { reference: data.data.reference, amount, bankName },
      userId
    );

    return {
      reference: data.data.reference,
      status: data.data.status || "pending",
    };
  } catch (error) {
    if (error instanceof APIError) throw error;

    logger.error("Error processing payout", error as Error, userId);
    throw new APIError(
      ErrorCode.PAYMENT_FAILED,
      "Failed to process payout",
      400
    );
  }
};

/**
 * Get bank code from bank name (simplified - should be expanded)
 */
const getBankCode = (bankName: string): string | null => {
  const bankMap: Record<string, string> = {
    GTB: "058",
    "GUARANTY TRUST": "058",
    "GUARANTEED TRUST": "058",
    ACCESS: "044",
    "ACCESS BANK": "044",
    ZENITH: "057",
    "ZENITH BANK": "057",
    USD: "032",
    "UNITED BANK FOR AFRICA": "033",
    UBA: "033",
    FCMB: "214",
    "FIRST CITY MONUMENT": "214",
    ECOBANK: "050",
    FIDELITY: "070",
    "FIDELITY BANK": "070",
    STANBIC: "221",
    STANBICIBTC: "221",
    WEMA: "035",
    "WEMA BANK": "035",
    POLARIS: "076",
    "POLARIS BANK": "076",
    UNITY: "215",
    "UNITY BANK": "215",
    TITAN: "102",
    "TITAN TRUST": "102",
  };

  return bankMap[bankName.toUpperCase()] || null;
};

/**
 * Get payout status
 */
export const getPayoutStatus = async (
  reference: string
): Promise<string> => {
  try {
    if (useMockKorapay) {
      return "success";
    }

    const response = await fetch(
      `${API_BASE_URL}/payouts/status?reference=${reference}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await response.json();
    return data.data?.status || "unknown";
  } catch (error) {
    logger.error("Error getting payout status", error as Error);
    return "unknown";
  }
};
