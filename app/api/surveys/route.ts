import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth, requireVerified } from "@/lib/utils/auth";
import { APIError, errorResponses, getErrorResponse } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await requireVerified(user.id);

    const { searchParams } = new URL(request.url);
    const targetCollege = searchParams.get("college");
    const targetDepartment = searchParams.get("department");
    const targetLevel = searchParams.get("level");

    let query = supabaseAdmin
      .from("surveys")
      .select(
        `
        id,
        title,
        description,
        reward,
        response_cap,
        responses_count,
        status,
        creator_id,
        google_form_url,
        target_college,
        target_department,
        target_level,
        estimated_time,
        created_at,
        profiles:creator_id (
          full_name,
          avatar_url
        )
      `
      )
      .eq("status", "active")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    // Apply filters
    if (targetCollege) query = query.eq("target_college", targetCollege);
    if (targetDepartment) query = query.eq("target_department", targetDepartment);
    if (targetLevel) query = query.eq("target_level", targetLevel);

    const { data: surveys, error } = await query;

    if (error) {
      logger.error("Error fetching surveys", error, user.id);
      throw new APIError(
        "INTERNAL_SERVER_ERROR" as any,
        "Failed to fetch surveys",
        500
      );
    }

    // Filter out surveys where user already completed response
    const { data: completedSurveys } = await supabaseAdmin
      .from("survey_responses")
      .select("survey_id")
      .eq("user_id", user.id);

    const completedIds = new Set(completedSurveys?.map((s) => s.survey_id) || []);

    const availableSurveys = (surveys || [])
      .filter((survey: any) => {
        // Skip if user already completed
        if (completedIds.has(survey.id)) return false;
        // Skip if response cap reached
        if (survey.responses_count >= survey.response_cap) return false;
        return true;
      });

    logger.info(
      `Retrieved ${availableSurveys.length} available surveys`,
      { filters: { targetCollege, targetDepartment, targetLevel } },
      user.id
    );

    return NextResponse.json({
      success: true,
      data: availableSurveys,
      count: availableSurveys.length,
    });
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const {
      title,
      description,
      reward,
      response_cap,
      google_sheet_url,
      google_form_url,
      target_college,
      target_department,
      target_level,
      estimated_time,
    } = body;

    // Validation
    if (!title || !reward || !response_cap || !google_sheet_url) {
      throw new APIError(
        "INVALID_REQUEST" as any,
        "Missing required fields",
        400
      );
    }

    if (reward <= 0 || response_cap <= 0) {
      throw new APIError(
        "INVALID_REQUEST" as any,
        "Reward and response cap must be positive",
        400
      );
    }

    const { data: survey, error } = await supabaseAdmin
      .from("surveys")
      .insert({
        creator_id: user.id,
        title,
        description,
        reward: parseFloat(reward),
        response_cap: parseInt(response_cap),
        google_sheet_url,
        google_form_url: google_form_url || null,
        target_college,
        target_department,
        target_level,
        estimated_time: estimated_time || 5,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating survey", error, user.id);
      throw new APIError(
        "INTERNAL_SERVER_ERROR" as any,
        "Failed to create survey",
        500
      );
    }

    logger.info(
      "Survey created",
      { surveyId: survey.id, reward, response_cap },
      user.id,
      survey.id
    );

    return NextResponse.json(
      {
        success: true,
        data: survey,
        message: "Survey created successfully. Proceed to funding.",
      },
      { status: 201 }
    );
  } catch (error) {
    const response = getErrorResponse(error);
    return NextResponse.json(response, {
      status: (error instanceof APIError ? error.statusCode : 500),
    });
  }
}
