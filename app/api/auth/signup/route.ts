import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { APIError, ErrorCode, getErrorResponse } from "@/lib/utils/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      fullName,
      college,
      department,
      level,
      role,
    } = body;

    if (!email || !password || !fullName) {
      throw new APIError(
        ErrorCode.INVALID_REQUEST,
        "Email, password, and fullName are required",
        400
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new APIError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Supabase env vars are missing",
        500
      );
    }

    const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);
    const normalizedRole = role === "researcher" ? "researcher" : "respondent";

    let userId = "";
    let needsEmailVerification = true;
    let signupMode: "public-signup" | "admin-fallback" = "public-signup";

    const { data: signUpData, error: signUpError } = await supabasePublic.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
        data: {
          full_name: fullName,
          role: normalizedRole,
        },
      },
    });

    if (!signUpError && signUpData.user) {
      userId = signUpData.user.id;
    } else {
      const message = signUpError?.message || "";
      const isDbSaveError =
        message.toLowerCase().includes("database error saving new user") ||
        message.toLowerCase().includes("database error");

      if (!isDbSaveError) {
        throw new APIError(
          ErrorCode.INVALID_REQUEST,
          message || "Failed to create user",
          400
        );
      }

      // Fallback: if public signUp fails due DB trigger/policy issues, create via service role
      const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role: normalizedRole },
      });

      if (adminError || !adminData.user) {
        throw new APIError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          adminError?.message || "Failed to create user via admin fallback",
          500
        );
      }

      userId = adminData.user.id;
      needsEmailVerification = false;
      signupMode = "admin-fallback";
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        email,
        full_name: fullName,
        role: normalizedRole,
        college: college || null,
        department: department || null,
        level: level || null,
        is_verified: false,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      throw new APIError(ErrorCode.INTERNAL_SERVER_ERROR, profileError.message, 500);
    }

    await supabaseAdmin.from("wallets").upsert({
      user_id: userId,
      balance: 0,
      total_earned: 0,
      total_withdrawn: 0,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: needsEmailVerification
          ? "Sign up successful. Check your email to verify your account."
          : "Sign up successful. Your account was created without email verification fallback.",
        data: {
          user: {
            id: userId,
            email,
          },
          needsEmailVerification,
          signupMode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: error instanceof APIError ? error.statusCode : 500,
    });
  }
}
