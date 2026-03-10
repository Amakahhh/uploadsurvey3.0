import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { APIError, getErrorResponse } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      throw new APIError("INVALID_REQUEST", "Email is required", 400);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      throw new APIError(
        "INTERNAL_SERVER_ERROR",
        "Failed to send reset email",
        500
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
