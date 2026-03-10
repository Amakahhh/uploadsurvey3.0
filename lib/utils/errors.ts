export enum ErrorCode {
  // Auth errors
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_VERIFIED = "NOT_VERIFIED",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Survey errors
  SURVEY_NOT_FOUND = "SURVEY_NOT_FOUND",
  SURVEY_FULL = "SURVEY_FULL",
  SURVEY_NOT_ACTIVE = "SURVEY_NOT_ACTIVE",
  ALREADY_COMPLETED = "ALREADY_COMPLETED",
  ACTIVE_SESSION_EXISTS = "ACTIVE_SESSION_EXISTS",

  // Wallet errors
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  MINIMUM_WITHDRAWAL_NOT_MET = "MINIMUM_WITHDRAWAL_NOT_MET",

  // Payment errors
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PROCESSING = "PAYMENT_PROCESSING",

  // Sheet errors
  SHEET_ERROR = "SHEET_ERROR",
  SIGNATURE_NOT_FOUND = "SIGNATURE_NOT_FOUND",

  // Server errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  INVALID_REQUEST = "INVALID_REQUEST",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  DUPLICATE_PAYMENT = "DUPLICATE_PAYMENT",
  FRAUD_DETECTED = "FRAUD_DETECTED",
}

export class APIError extends Error {
  constructor(
    public code: ErrorCode | string,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "APIError";
  }
}

export const getErrorResponse = (error: any) => {
  if (error instanceof APIError) {
    return {
      success: false,
      error: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message,
    };
  }

  return {
    success: false,
    error: ErrorCode.INTERNAL_SERVER_ERROR,
    message: "An unexpected error occurred",
  };
};

export const errorResponses = {
  unauthorized: () =>
    new APIError(
      ErrorCode.UNAUTHORIZED,
      "User not authenticated",
      401
    ),
  notVerified: () =>
    new APIError(
      ErrorCode.NOT_VERIFIED,
      "Email not verified. Please verify your email to continue.",
      403
    ),
  surveyNotFound: () =>
    new APIError(
      ErrorCode.SURVEY_NOT_FOUND,
      "Survey not found",
      404
    ),
  surveyFull: () =>
    new APIError(
      ErrorCode.SURVEY_FULL,
      "This survey has reached its response limit",
      400
    ),
  alreadyCompleted: () =>
    new APIError(
      ErrorCode.ALREADY_COMPLETED,
      "You have already completed this survey",
      400
    ),
  activeSessionExists: () =>
    new APIError(
      ErrorCode.ACTIVE_SESSION_EXISTS,
      "You already have an active survey session. Complete it first.",
      400
    ),
  insufficientBalance: () =>
    new APIError(
      ErrorCode.INSUFFICIENT_BALANCE,
      "Insufficient wallet balance",
      400
    ),
  minimumWithdrawalNotMet: (minimum: number) =>
    new APIError(
      ErrorCode.MINIMUM_WITHDRAWAL_NOT_MET,
      `Minimum withdrawal amount is ${minimum} naira`,
      400
    ),
  paymentFailed: (details?: any) =>
    new APIError(
      ErrorCode.PAYMENT_FAILED,
      "Payment processing failed",
      400,
      details
    ),
  sheetError: (details?: string) =>
    new APIError(
      ErrorCode.SHEET_ERROR,
      details || "Error accessing Google Sheet",
      400
    ),
  signatureNotFound: () =>
    new APIError(
      ErrorCode.SIGNATURE_NOT_FOUND,
      "Your email signature not found in survey responses",
      404
    ),
  fraudDetected: (reason: string) =>
    new APIError(
      ErrorCode.FRAUD_DETECTED,
      `Fraud detected: ${reason}`,
      403
    ),
  duplicatePayment: () =>
    new APIError(
      ErrorCode.DUPLICATE_PAYMENT,
      "Payment already processed for this survey",
      400
    ),
};
