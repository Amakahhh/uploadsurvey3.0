import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[DEBUG SIGNUP] Email:', email);
    console.log('[DEBUG SIGNUP] Password length:', password?.length);
    console.log('[DEBUG SIGNUP] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[DEBUG SIGNUP] Has service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Try to create user
    console.log('[DEBUG SIGNUP] Step 1: Creating user...');
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    console.log('[DEBUG SIGNUP] Step 1 result:', {
      hasError: !!error,
      errorMessage: error?.message,
      errorCode: error?.code,
      hasUser: !!data?.user,
      userId: data?.user?.id,
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        errorCode: error.code,
        step: 'Auth creation failed',
      }, { status: 400 });
    }

    if (!data?.user) {
      return NextResponse.json({
        success: false,
        error: 'No user returned',
        step: 'Auth creation returned no user',
      }, { status: 400 });
    }

    // Step 2: Try to read back the created user
    console.log('[DEBUG SIGNUP] Step 2: Verifying user in database...');
    const { data: checkData, error: checkError } = await supabaseAdmin.auth.admin.getUserById(data.user.id);

    console.log('[DEBUG SIGNUP] Step 2 result:', {
      hasError: !!checkError,
      errorMessage: checkError?.message,
      userEmail: checkData?.user?.email,
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      userId: data.user.id,
      userEmail: data.user.email,
      createdAt: data.user.created_at,
    });
  } catch (err: any) {
    console.error('[DEBUG SIGNUP] Exception:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
