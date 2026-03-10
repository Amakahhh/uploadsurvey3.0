import { GoogleGenerativeAI } from "@google/generative-ai";
import { APIError, ErrorCode } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";
import { fetchSheetResponses } from "./google-sheets";

interface AnalysisResult {
  summary: string;
  keyFindings: string[];
  respondentCount: number;
  completionRate?: number;
  fullAnalysis?: string;
  averages?: Record<string, number>;
  correlations?: Array<{ fieldA: string; fieldB: string; correlation: number }>;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const useMockGemini =
  process.env.MOCK_EXTERNAL_SERVICES === "true" ||
  !process.env.GEMINI_API_KEY;

/**
 * Analyze survey responses using Gemini API
 */
export const analyzeSurveyResponses = async (
  sheetUrl: string,
  surveyTitle: string,
  surveyId: string
): Promise<AnalysisResult> => {
  try {
    if (useMockGemini) {
      return {
        summary: "Most respondents are engineering students aged 20-23.",
        keyFindings: [
          "High response concentration from STEM departments",
          "Most submissions were completed within 10 minutes",
          "Participation peaked in the afternoon",
        ],
        respondentCount: 1,
        fullAnalysis: "Mock analysis enabled for local development.",
        averages: { age: 21 },
        correlations: [],
      };
    }

    const responses = await fetchSheetResponses(sheetUrl);

    if (responses.length === 0) {
      return {
        summary: "No responses to analyze yet",
        keyFindings: [],
        respondentCount: 0,
      };
    }

    const numericStats = computeNumericStats(responses);

    // Format data for Gemini
    const analysisPrompt = `
Analyze the following survey responses for a study titled "${surveyTitle}". 
Provide:
1. A brief summary (2-3 sentences)
2. 3-5 key findings
3. Any notable trends or patterns

Survey Responses (JSON):
${JSON.stringify(responses, null, 2)}

Respond in a structured format with these exact sections:
SUMMARY: [summary text]
KEY_FINDINGS: [bullet points separated by newlines]
ANALYSIS: [detailed analysis]
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(analysisPrompt);
    const text = result.response.text();

    // Parse response
    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=KEY_FINDINGS:|$)/);
    const findingsMatch = text.match(/KEY_FINDINGS:\s*([\s\S]*?)(?=ANALYSIS:|$)/);
    const analysisMatch = text.match(/ANALYSIS:\s*([\s\S]*?)$/);

    const summary = (summaryMatch?.[1] || "").trim();
    const findingsText = (findingsMatch?.[1] || "").trim();
    const keyFindings = findingsText
      .split("\n")
      .map((f) => f.replace(/^[-•*]\s*/, "").trim())
      .filter((f) => f.length > 0);

    logger.info(
      "Survey analysis completed",
      { respondentCount: responses.length },
      undefined,
      surveyId
    );

    return {
      summary,
      keyFindings,
      respondentCount: responses.length,
      fullAnalysis: (analysisMatch?.[1] || "").trim(),
      averages: numericStats.averages,
      correlations: numericStats.correlations,
    };
  } catch (error) {
    logger.error("Error analyzing survey responses", error as Error, undefined, surveyId);
    throw new APIError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to analyze survey responses",
      500
    );
  }
};

const parseNumber = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const computeNumericStats = (responses: Record<string, any>[]) => {
  const numericValues: Record<string, number[]> = {};

  responses.forEach((response) => {
    Object.entries(response).forEach(([key, value]) => {
      if (key === "email" || key === "timestamp") return;
      const num = parseNumber(value);
      if (num === null) return;
      if (!numericValues[key]) numericValues[key] = [];
      numericValues[key].push(num);
    });
  });

  const averages: Record<string, number> = {};
  Object.entries(numericValues).forEach(([key, values]) => {
    if (values.length === 0) return;
    const sum = values.reduce((acc, val) => acc + val, 0);
    averages[key] = sum / values.length;
  });

  const fields = Object.keys(numericValues);
  const correlations: Array<{ fieldA: string; fieldB: string; correlation: number }> = [];

  for (let i = 0; i < fields.length; i += 1) {
    for (let j = i + 1; j < fields.length; j += 1) {
      const fieldA = fields[i];
      const fieldB = fields[j];
      const valuesA = numericValues[fieldA];
      const valuesB = numericValues[fieldB];
      const length = Math.min(valuesA.length, valuesB.length);
      if (length < 2) continue;
      const pairedA = valuesA.slice(0, length);
      const pairedB = valuesB.slice(0, length);
      const corr = pearsonCorrelation(pairedA, pairedB);
      if (!Number.isNaN(corr)) {
        correlations.push({ fieldA, fieldB, correlation: corr });
      }
    }
  }

  correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  return {
    averages,
    correlations: correlations.slice(0, 5),
  };
};

const pearsonCorrelation = (xs: number[], ys: number[]) => {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return NaN;
  const meanX = xs.reduce((acc, val) => acc + val, 0) / n;
  const meanY = ys.reduce((acc, val) => acc + val, 0) / n;
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  const denom = Math.sqrt(denomX) * Math.sqrt(denomY);
  if (denom === 0) return NaN;
  return numerator / denom;
};

/**
 * Generate custom insights for specific questions
 */
export const generateCustomInsights = async (
  sheetUrl: string,
  questions: string[],
  surveyId: string
): Promise<Record<string, any>> => {
  try {
    if (useMockGemini) {
      return {
        insights: "Mock custom insights generated for local testing.",
        respondentCount: 1,
      };
    }

    const responses = await fetchSheetResponses(sheetUrl);

    if (responses.length === 0) {
      return { insight: "No responses to analyze" };
    }

    const prompt = `
Given the following survey responses, provide detailed insights for these specific questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Responses:
${JSON.stringify(responses, null, 2)}

For each question, provide:
- Primary insight
- Secondary patterns
- Statistical observations if relevant
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);

    logger.info(
      "Custom insights generated",
      { questionCount: questions.length },
      undefined,
      surveyId
    );

    return {
      insights: result.response.text(),
      respondentCount: responses.length,
    };
  } catch (error) {
    logger.error("Error generating custom insights", error as Error, undefined, surveyId);
    throw new APIError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to generate insights",
      500
    );
  }
};

/**
 * Detect potential data quality issues
 */
export const detectDataQualityIssues = async (
  sheetUrl: string,
  surveyId: string
): Promise<string[]> => {
  try {
    const responses = await fetchSheetResponses(sheetUrl);

    if (responses.length === 0) {
      return [];
    }

    const issues: string[] = [];

    // Check for duplicate emails
    const emailCounts = new Map<string, number>();
    responses.forEach((r) => {
      const count = emailCounts.get(r.email) || 0;
      emailCounts.set(r.email, count + 1);
    });

    const duplicates = Array.from(emailCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([email, count]) => `Email ${email} appears ${count} times`);

    issues.push(...duplicates);

    // Check for missing required fields
    const requiredFields = ["email", "timestamp"];
    requiredFields.forEach((field) => {
      const missing = responses.filter(
        (r) => !r[field] || String(r[field]).trim() === ""
      ).length;
      if (missing > 0) {
        issues.push(`${missing} responses missing ${field}`);
      }
    });

    if (issues.length > 0) {
      logger.warn(
        "Data quality issues detected",
        { issues, count: issues.length },
        undefined,
        surveyId
      );
    }

    return issues;
  } catch (error) {
    logger.error("Error detecting data quality issues", error as Error, undefined, surveyId);
    return [];
  }
};
