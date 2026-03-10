/**
 * Parse API error responses and return user-friendly, actionable error messages
 */

interface ApiErrorResponse {
  status?: number;
  title?: string;
  detail?: string;
  errors?: Array<{
    code?: string;
    description?: string;
    type?: string;
  }>;
  message?: string;
}

interface ParsedError {
  title: string;
  message: string;
  details: string[];
  actionItems: string[];
}

export function parseApiError(error: unknown): ParsedError {
  const parsed: ParsedError = {
    title: 'Error',
    message: 'An error occurred. Please try again.',
    details: [],
    actionItems: [],
  };

  // Handle error object
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // First, check if there's a fullError object with the API response
    const errorData = err.fullError || err;

    console.log('[PARSER] Error data received:', { errorData, hasFullError: !!err.fullError });

    // Extract title
    if (errorData.title || errorData.detail) {
      parsed.title = errorData.title || 'Error';
      parsed.message = errorData.detail || 'An error occurred';
    }

    // Handle detailed validation errors from backend
    if (errorData.errors && Array.isArray(errorData.errors)) {
      console.log('[PARSER] Found errors array:', errorData.errors);
      errorData.errors.forEach((validationError: any) => {
        const description = validationError.description || '';
        parsed.details.push(description);

        // Add specific action items based on error type
        if (description.includes('Responder link') && description.includes('valid URL')) {
          parsed.actionItems.push('Make sure your Google Form link is correct and complete');
        }
        if (description.includes('access') || description.includes('form') || description.includes('sheet')) {
          parsed.actionItems.push('Share your Google Form and Sheet with the Survey Hustler service account');
        }
        if (description.includes('School ID')) {
          parsed.actionItems.push('If you want targeting, select a school from the niche filters');
        }
        if (description.includes('Person type')) {
          parsed.actionItems.push('Select a valid person type if you want targeting filters');
        }
        if (description.includes('Gender')) {
          parsed.actionItems.push('Select a gender if you want gender-based targeting');
        }
      });
    } else {
      console.log('[PARSER] No errors array found in:', Object.keys(errorData));
    }

    // Handle specific error codes/titles
    if (errorData.title === 'Survey.AccessDenied') {
      parsed.title = 'Access Denied';
      parsed.message = 'Survey Hustler does not have access to your Google Form or Sheet';
      parsed.actionItems.push('1. Open your Google Form');
      parsed.actionItems.push('2. Click the Share button');
      parsed.actionItems.push('3. Add the Survey Hustler service account email as an Editor');
      parsed.actionItems.push('4. Repeat the same for your Google Sheet');
      parsed.actionItems.push('5. Try again');
    }

    if (errorData.title === 'Person.NotFound') {
      parsed.title = 'Account Issue';
      parsed.message = 'There is an issue with your account';
      parsed.actionItems.push('Please log out and log back in');
      parsed.actionItems.push('If the problem persists, contact support');
    }

    if (errorData.title === 'Validation.General' && !parsed.details.length) {
      parsed.title = 'Validation Error';
      parsed.message = 'Please check your survey information and try again';
    }

    // Handle network/status errors
    if (errorData.status === 400) {
      if (!parsed.message || parsed.message.includes('Invalid request')) {
        parsed.title = 'Invalid Survey Data';
        if (!parsed.details.length) {
          parsed.message = 'One or more fields in your survey are invalid. Please review your information.';
        }
      }
    }

    if (errorData.status === 401 || errorData.status === 403) {
      parsed.title = 'Authentication Error';
      parsed.message = 'Your session has expired. Please log in again.';
      parsed.actionItems.push('Click the logout button and log back in');
    }

    if (errorData.status === 404) {
      parsed.title = 'Not Found';
      parsed.message = 'There was an issue finding your information. Please try again.';
    }

    if (errorData.status === 500) {
      parsed.title = 'Server Error';
      parsed.message = 'The server encountered an error. Please try again in a moment.';
      parsed.actionItems.push('If this continues, contact support');
    }

    // If we have a message property
    if (typeof err.message === 'string' && !parsed.details.length) {
      parsed.details.push(err.message);
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    parsed.details.push(error);
  }

  console.log('[PARSER] Final parsed result:', parsed);
  return parsed;
}

/**
 * Format the parsed error for display to the user
 */
export function formatErrorForDisplay(parsed: ParsedError): string {
  let formatted = parsed.title;

  if (parsed.message && parsed.message !== parsed.title) {
    formatted += '\n' + parsed.message;
  }

  if (parsed.details.length > 0) {
    formatted += '\n\n' + parsed.details.join('\n');
  }

  if (parsed.actionItems.length > 0) {
    formatted += '\n\n' + 'What to do:\n' + parsed.actionItems.join('\n');
  }

  return formatted;
}
