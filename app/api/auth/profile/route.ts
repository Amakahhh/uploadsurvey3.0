import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/utils/auth";
import { APIError, getErrorResponse } from "@/lib/utils/errors";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      throw new APIError("RESOURCE_NOT_FOUND", "Profile not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { full_name, college, department, level, bio, avatar_url, phone_number } = body;

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: full_name || undefined,
        college: college || undefined,
        department: department || undefined,
        level: level || undefined,
        bio: bio || undefined,
        avatar_url: avatar_url || undefined,
        phone_number: phone_number || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      throw new APIError(
        "INTERNAL_SERVER_ERROR",
        "Failed to update profile",
        500
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
