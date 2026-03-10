import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/utils/auth";
import { APIError, getErrorResponse, ErrorCode } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";
import { analyzeSurveyResponses } from "@/lib/integrations/gemini";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

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
    const { data: survey } = await supabaseAdmin
      .from("surveys")
      .select("*")
      .eq("id", surveyId)
      .eq("creator_id", user.id)
      .single();

    if (!survey) {
      throw new APIError(
        ErrorCode.SURVEY_NOT_FOUND,
        "Survey not found",
        404
      );
    }

    // Analyze responses
    const analysis = await analyzeSurveyResponses(
      survey.google_sheet_url,
      survey.title,
      surveyId
    );

    logger.info(
      "Survey analyzed",
      {
        respondents: analysis.respondentCount,
        findingsCount: analysis.keyFindings.length,
      },
      user.id,
      surveyId
    );

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
