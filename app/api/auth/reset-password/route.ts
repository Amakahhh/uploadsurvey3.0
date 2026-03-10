import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { APIError, getErrorResponse } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    const { password, token } = body;

    if (!password || !token) {
      throw new APIError(
        "INVALID_REQUEST",
        "Password and token are required",
        400
      );
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      throw new APIError(
        "INTERNAL_SERVER_ERROR",
        "Failed to reset password",
        500
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
