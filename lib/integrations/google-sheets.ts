import { APIError, ErrorCode } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

interface SheetResponse {
  email: string;
  timestamp: string;
  [key: string]: any;
}

const useMockSheets =
  process.env.MOCK_EXTERNAL_SERVICES === "true";

const extractSheetIdFromUrl = (url: string): string => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match || !match[1]) {
    throw new APIError(
      ErrorCode.SHEET_ERROR,
      "Invalid Google Sheet URL format",
      400
    );
  }
  return match[1];
};

const extractGidFromUrl = (url: string): string | null => {
  const gidMatch = url.match(/[?&]gid=([0-9]+)/);
  return gidMatch?.[1] || null;
};

const buildPublicCsvUrl = (sheetUrl: string): string => {
  const sheetId = extractSheetIdFromUrl(sheetUrl);
  const gid = extractGidFromUrl(sheetUrl);
  const gidParam = gid ? `&gid=${gid}` : "";
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
};

const parseCsv = (csvText: string): string[][] => {
  const rows: string[][] = [];
  let current: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = false;
        continue;
      }
      value += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      current.push(value);
      value = "";
      continue;
    }

    if (char === "\n") {
      current.push(value.replace(/\r$/, ""));
      value = "";
      rows.push(current);
      current = [];
      continue;
    }

    value += char;
  }

  if (value.length > 0 || current.length > 0) {
    current.push(value.replace(/\r$/, ""));
    rows.push(current);
  }

  return rows.filter((row) => row.some((cell) => String(cell).trim().length > 0));
};

const fetchPublicSheetRows = async (sheetUrl: string): Promise<string[][]> => {
  const csvUrl = buildPublicCsvUrl(sheetUrl);
  const response = await fetch(csvUrl, { method: "GET" });
  if (!response.ok) {
    throw new APIError(
      ErrorCode.SHEET_ERROR,
      "Cannot access Google Sheet. Ensure it's publicly shared.",
      400
    );
  }
  const csvText = await response.text();
  return parseCsv(csvText);
};

/**
 * Fetch responses from Google Sheet
 * Expects columns: Email, Timestamp, and other form fields
 */
export const fetchSheetResponses = async (
  sheetUrl: string
): Promise<SheetResponse[]> => {
  try {
    if (useMockSheets) {
      return [
        {
          email: "test@student.edu",
          timestamp: "2026-03-01T10:00:00Z",
        },
      ];
    }

    const rows = await fetchPublicSheetRows(sheetUrl);

    if (rows.length < 2) {
      return [];
    }

    const headers = rows[0];
    const emailIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes("email")
    );
    const timestampIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes("timestamp")
    );

    if (emailIndex === -1) {
      throw new APIError(
        ErrorCode.SHEET_ERROR,
        "Email column not found in sheet",
        400
      );
    }

    const responses: SheetResponse[] = rows.slice(1).map((row: any[]) => {
      const response: SheetResponse = {
        email: (row[emailIndex] || "").toLowerCase().trim(),
        timestamp: row[timestampIndex] || new Date().toISOString(),
      };

      // Include other fields
      headers.forEach((header: string, index: number) => {
        if (index !== emailIndex && index !== timestampIndex) {
          response[header.toLowerCase().replace(/\s+/g, "_")] = row[index];
        }
      });

      return response;
    });

    logger.info(
      `Fetched ${responses.length} responses from Google Sheet (public access)`,
      {}
    );

    return responses;
  } catch (error) {
    if (error instanceof APIError) throw error;

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("Permission denied")) {
      throw new APIError(
        ErrorCode.SHEET_ERROR,
        "Sheet is not publicly accessible. Please share it with view access.",
        400
      );
    }

    logger.error("Error fetching sheet responses", error as Error);
    throw new APIError(
      ErrorCode.SHEET_ERROR,
      "Failed to fetch responses from Google Sheet",
      400
    );
  }
};

/**
 * Check if email exists in sheet responses and meets timestamp requirement
 */
export const findUserResponseInSheet = (
  responses: SheetResponse[],
  userEmail: string,
  sessionStartTime: Date
): SheetResponse | null => {
  const normalizedEmail = userEmail.toLowerCase().trim();

  const response = responses.find(
    (r) => r.email.toLowerCase().trim() === normalizedEmail
  );

  if (!response) {
    return null;
  }

  // Verify submission timestamp is after session start
  const submissionTime = new Date(response.timestamp);
  if (submissionTime < sessionStartTime) {
    logger.warn(
      "Submission timestamp before session start",
      {
        userEmail,
        submissionTime: submissionTime.toISOString(),
        sessionStart: sessionStartTime.toISOString(),
      },
      undefined,
      undefined
    );
    return null;
  }

  return response;
};

/**
 * Get unique verified respondents from sheet
 */
export const getVerifiedRespondents = async (
  sheetUrl: string
): Promise<string[]> => {
  try {
    const responses = await fetchSheetResponses(sheetUrl);
    const uniqueEmails = [...new Set(responses.map((r) => r.email.toLowerCase().trim()))];
    return uniqueEmails;
  } catch (error) {
    logger.error("Error getting verified respondents", error as Error);
    return [];
  }
};

/**
 * Validate Google Sheet accessibility
 */
export const validateSheetAccess = async (sheetUrl: string): Promise<boolean> => {
  try {
    const rows = await fetchPublicSheetRows(sheetUrl);
    return rows.length > 0;
  } catch (error) {
    logger.error("Sheet validation failed", error as Error);
    return false;
  }
};
