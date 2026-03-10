import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { APIError, getErrorResponse } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      throw new APIError("INVALID_REQUEST", "Token is required", 400);
    }

    const supabase = await createClient();

    // Exchange token for user session
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });

    if (error) {
      logger.warn("Email verification failed", { errorMessage: error.message });
      throw new APIError(
        "INVALID_REQUEST",
        "Invalid or expired verification link",
        400
      );
    }

    if (!data.user) {
      throw new APIError(
        "UNAUTHORIZED",
        "Email verification failed",
        401
      );
    }

    logger.info("Email verified successfully", {}, data.user.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      message: "Email verified successfully",
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
