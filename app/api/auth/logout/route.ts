import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { APIError, getErrorResponse } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new APIError("INTERNAL_SERVER_ERROR", "Logout failed", 500);
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
