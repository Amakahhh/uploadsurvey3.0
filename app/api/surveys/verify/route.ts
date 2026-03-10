import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth, requireVerified } from "@/lib/utils/auth";
import { APIError, errorResponses, getErrorResponse, ErrorCode } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";
import { creditUserWallet } from "@/lib/utils/wallet";
import { fetchSheetResponses, findUserResponseInSheet } from "@/lib/integrations/google-sheets";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    await requireVerified(user.id);

    const body = await request.json();
    const { surveyId } = body;

    if (!surveyId) {
      throw new APIError(
        ErrorCode.INVALID_REQUEST,
        "Survey ID is required",
        400
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    if (!profile) {
      throw new APIError(
        ErrorCode.UNAUTHORIZED,
        "User profile not found",
        401
      );
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("survey_sessions")
      .select("*")
      .eq("survey_id", surveyId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (sessionError || !session) {
      throw new APIError(
        ErrorCode.SESSION_EXPIRED,
        "No active session found. Please start the survey again.",
        400
      );
    }

    const now = new Date();
    const expiryTime = new Date(session.expires_at);

    if (now > expiryTime) {
      await supabaseAdmin
        .from("survey_sessions")
        .update({ status: "expired" })
        .eq("id", session.id);

      throw new APIError(
        ErrorCode.SESSION_EXPIRED,
        "Survey session expired. Please start the survey again.",
        400
      );
    }

    const { data: survey } = await supabaseAdmin
      .from("surveys")
      .select("*")
      .eq("id", surveyId)
      .single();

    if (!survey) {
      throw errorResponses.surveyNotFound();
    }

    const { data: existingResponse } = await supabaseAdmin
      .from("survey_responses")
      .select("id")
      .eq("survey_id", surveyId)
      .eq("user_id", user.id)
      .single();

    if (existingResponse) {
      logger.warn(
        "Duplicate verification attempt",
        { surveyId },
        user.id,
        surveyId
      );
      throw errorResponses.duplicatePayment();
    }

    let sheetResponses;
    try {
      sheetResponses = await fetchSheetResponses(survey.google_sheet_url);
    } catch (error) {
      logger.error(
        "Failed to fetch sheet responses",
        error as Error,
        user.id,
        surveyId
      );
      throw errorResponses.sheetError("Could not access survey responses");
    }

    const sessionStartTime = new Date(session.started_at);
    const userResponse = findUserResponseInSheet(
      sheetResponses,
      profile.email,
      sessionStartTime
    );

    if (!userResponse) {
      logger.warn(
        "User response not found in sheet",
        {
          email: profile.email,
          sessionStart: sessionStartTime.toISOString(),
        },
        user.id,
        surveyId
      );
      throw errorResponses.signatureNotFound();
    }

    const walletCreditResult = await creditUserWallet(
      user.id,
      survey.reward,
      surveyId,
      `survey_${surveyId}`,
      `Reward for completing survey: ${survey.title}`
    );

    await supabaseAdmin.from("survey_responses").insert({
      survey_id: surveyId,
      user_id: user.id,
      session_id: session.id,
      user_email: profile.email,
      submission_timestamp: userResponse.timestamp,
      response_data: userResponse,
      verified: true,
      payment_processed: true,
      payment_amount: survey.reward,
    });

    await supabaseAdmin
      .from("surveys")
      .update({ responses_count: survey.responses_count + 1 })
      .eq("id", surveyId);

    await supabaseAdmin
      .from("survey_sessions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", session.id);

    logger.info(
      "Survey verification successful",
      {
        sessionId: session.id,
        reward: survey.reward,
      },
      user.id,
      surveyId
    );

    return NextResponse.json({
      success: true,
      data: {
        walletBalance: walletCreditResult.newBalance,
        rewardAmount: survey.reward,
        message: `Congratulations! You earned ${survey.reward} naira for this survey.`,
      },
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: error instanceof APIError ? error.statusCode : 500,
    });
  }
}
