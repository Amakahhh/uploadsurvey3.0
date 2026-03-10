import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth";
import { getLedgerHistory } from "@/lib/utils/wallet";
import { APIError, getErrorResponse } from "@/lib/utils/errors";

export async function GET() {
  try {
    const user = await requireAuth();
    const ledger = await getLedgerHistory(user.id, 50);

    return NextResponse.json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: error instanceof APIError ? error.statusCode : 500,
    });
  }
}
