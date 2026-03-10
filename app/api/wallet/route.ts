import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/utils/auth";
import { APIError, ErrorCode, getErrorResponse } from "@/lib/utils/errors";

const ensureWallet = async (userId: string) => {
  const { data: existing } = await supabaseAdmin
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existing) return existing;

  const { data: created, error } = await supabaseAdmin
    .from("wallets")
    .insert({ user_id: userId, balance: 0, total_earned: 0, total_withdrawn: 0 })
    .select("*")
    .single();

  if (error || !created) {
    throw new APIError(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to create wallet", 500);
  }

  return created;
};

export async function GET() {
  try {
    const user = await requireAuth();
    const wallet = await ensureWallet(user.id);

    const { data: ledger } = await supabaseAdmin
      .from("ledger")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: {
        id: wallet.id,
        balance: Number(wallet.balance || 0),
        total_earned: Number(wallet.total_earned || 0),
        total_withdrawn: Number(wallet.total_withdrawn || 0),
        transactions: ledger || [],
      },
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: error instanceof APIError ? error.statusCode : 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const action = body.action as string;

    const wallet = await ensureWallet(user.id);

    if (action === "create") {
      return NextResponse.json({
        success: true,
        data: wallet,
        message: "Wallet ready",
      });
    }

    const amount = Number(body.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new APIError(ErrorCode.INVALID_REQUEST, "Amount must be greater than zero", 400);
    }

    if (action === "fund") {
      const newBalance = Number(wallet.balance || 0) + amount;
      await supabaseAdmin
        .from("wallets")
        .update({
          balance: newBalance,
          total_earned: Number(wallet.total_earned || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      await supabaseAdmin.from("ledger").insert({
        user_id: user.id,
        amount,
        type: "credit",
        description: body.message || "Wallet funding (local mock)",
        reference: body.reference || `fund_${Date.now()}`,
      });

      return NextResponse.json({
        success: true,
        data: { balance: newBalance },
        message: "Wallet funded successfully",
      });
    }

    if (action === "debit") {
      if (Number(wallet.balance || 0) < amount) {
        throw new APIError(ErrorCode.INSUFFICIENT_BALANCE, "Insufficient balance", 400);
      }

      const newBalance = Number(wallet.balance || 0) - amount;
      await supabaseAdmin
        .from("wallets")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);

      await supabaseAdmin.from("ledger").insert({
        user_id: user.id,
        amount,
        type: "debit",
        description: body.description || "Wallet debit",
        reference: body.reference || `debit_${Date.now()}`,
      });

      return NextResponse.json({
        success: true,
        data: { balance: newBalance },
        message: "Wallet debited successfully",
      });
    }

    throw new APIError(ErrorCode.INVALID_REQUEST, "Unsupported wallet action", 400);
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: error instanceof APIError ? error.statusCode : 500,
    });
  }
}
