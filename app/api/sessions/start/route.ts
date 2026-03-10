import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/db/database';
import { generateId, verifyJWT } from '@/lib/utils/auth';
import { success, error, serverError, unauthorized, getAuthHeader } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    const token = getAuthHeader(request);
    if (!token) {
      return unauthorized('Token required');
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return unauthorized('Invalid token');
    }

    const { exec, run } = await initializeDatabase();
    const body = await request.json();
    const { survey_id } = body;

    if (!survey_id) {
      return error('survey_id is required', 400);
    }

    // Check if survey exists and is active
    const surveyResults = exec(
      'SELECT * FROM surveys WHERE id = ? AND is_active = 1',
      [survey_id]
    );

    if (!surveyResults.length || !surveyResults[0].values.length) {
      return error('Survey not found or inactive', 404);
    }

    // Check if user already has an active session for any survey
    const sessionResults = exec(
      `SELECT * FROM survey_sessions WHERE user_id = ? AND status = 'active'`,
      [decoded.id]
    );

    if (sessionResults.length && sessionResults[0].values.length) {
      return error('You already have an active survey session. Complete it first.', 400);
    }

    // Get survey details
    const surveyRow = surveyResults[0];
    const columns = surveyRow.columns;
    const values = surveyRow.values[0];
    
    const survey: any = {};
    columns.forEach((col: string, idx: number) => {
      survey[col] = values[idx];
    });

    // Check if survey has reached max responses
    if (survey.current_responses >= survey.max_responses) {
      return error('This survey has reached its response limit', 400);
    }

    // Create session (30 minute expiry)
    const sessionId = generateId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

    run(
      `INSERT INTO survey_sessions (id, survey_id, user_id, started_at, expires_at, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [sessionId, survey_id, decoded.id, now.toISOString(), expiresAt]
    );

    return success({
      sessionId,
      surveyId: survey_id,
      expiresAt,
      googleFormUrl: survey.googleFormUrl,
    });
  } catch (err: any) {
    console.error('[Start Session Error]', err);
    return serverError(err.message);
  }
}
