import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { APIError, ErrorCode, getErrorResponse } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      throw new APIError(ErrorCode.INVALID_REQUEST, "Email and password are required", 400);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new APIError(ErrorCode.INTERNAL_SERVER_ERROR, "Supabase env vars are missing", 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user || !data.session) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CREDENTIALS",
          message: authError?.message || "Invalid email or password",
        },
        { status: 401 }
      );
    }

    let { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      const fallbackName = (data.user.user_metadata?.full_name as string | undefined) || "";
      const { data: createdProfile } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fallbackName,
          role: "respondent",
          is_verified: Boolean(data.user.email_confirmed_at),
        })
        .select("*")
        .single();
      profile = createdProfile;
    }

    if (!data.user.email_confirmed_at) {
      return NextResponse.json(
        {
          success: false,
          error: "NOT_VERIFIED",
          message: "Email not verified. Please check your inbox and verify your account.",
        },
        { status: 403 }
      );
    }

    if (profile && !profile.is_verified) {
      await supabaseAdmin
        .from("profiles")
        .update({ is_verified: true, updated_at: new Date().toISOString() })
        .eq("id", data.user.id);
      profile.is_verified = true;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName: profile?.full_name || "",
            role: profile?.role || "respondent",
            college: profile?.college,
            department: profile?.department,
            level: profile?.level,
            isVerified: true,
          },
          session: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: error instanceof APIError ? error.statusCode : 500,
    });
  }
}
