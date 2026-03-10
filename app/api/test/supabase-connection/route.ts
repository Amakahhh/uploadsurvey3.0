import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    console.log('[TEST] Checking Supabase connection...');
    console.log('[TEST] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[TEST] SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Test 1: Query profiles table
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      return NextResponse.json({
        success: false,
        error: 'PROFILES_QUERY_ERROR',
        message: profilesError.message,
        details: profilesError,
      }, { status: 500 });
    }

    // Test 2: Check auth users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json({
        success: false,
        error: 'AUTH_QUERY_ERROR',
        message: usersError.message,
        details: usersError,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection is working!',
      data: {
        profilesTableReachable: true,
        totalAuthUsers: users?.length || 0,
        authUsersList: users?.map(u => ({
          id: u.id,
          email: u.email,
          createdAt: u.created_at,
        })) || [],
      },
    });
  } catch (err: any) {
    console.error('[TEST] Connection error:', err);
    return NextResponse.json({
      success: false,
      error: 'CONNECTION_ERROR',
      message: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
