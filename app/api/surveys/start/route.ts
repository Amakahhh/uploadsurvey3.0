import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth, requireVerified } from "@/lib/utils/auth";
import { APIError, errorResponses, getErrorResponse, ErrorCode } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

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

    // Get survey
    const { data: survey, error: surveyError } = await supabaseAdmin
      .from("surveys")
      .select("*")
      .eq("id", surveyId)
      .single();

    if (surveyError || !survey) {
      throw errorResponses.surveyNotFound();
    }

    if (survey.status !== "active") {
      throw new APIError(
        ErrorCode.SURVEY_NOT_ACTIVE,
        "This survey is not currently active",
        400
      );
    }

    if (survey.responses_count >= survey.response_cap) {
      throw errorResponses.surveyFull();
    }

    // Check if user already completed this survey
    const { data: completed } = await supabaseAdmin
      .from("survey_responses")
      .select("id")
      .eq("survey_id", surveyId)
      .eq("user_id", user.id)
      .single();

    if (completed) {
      throw errorResponses.alreadyCompleted();
    }

    // Check for active session
    const { data: activeSession } = await supabaseAdmin
      .from("survey_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (activeSession) {
      throw errorResponses.activeSessionExists();
    }

    // Create session
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("survey_sessions")
      .insert({
        survey_id: surveyId,
        user_id: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (sessionError || !session) {
      logger.error("Failed to create session", sessionError, user.id, surveyId);
      throw new APIError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to start survey session",
        500
      );
    }

    logger.info(
      "Survey session started",
      {
        sessionId: session.id,
        expiresAt: expiresAt.toISOString(),
      },
      user.id,
      surveyId
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        surveyId,
        startedAt: session.started_at,
        expiresAt: session.expires_at,
        estimatedTime: survey.estimated_time,
      },
      message: "Survey session started. You have 30 minutes to complete the Google Form.",
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
