// Enhanced API error handling utilities

export interface ApiError {
  status: number;
  message: string;
  details?: string;
  isNetworkError: boolean;
  isServerError: boolean;
  isClientError: boolean;
}

export const parseApiError = (error: any): ApiError => {
  let status = 500;
  let message = 'An unexpected error occurred';
  let details = '';
  let isNetworkError = false;
  let isServerError = false;
  let isClientError = false;

  if (error instanceof Error) {
    details = error.message;
    
    // Extract status code from error message
    const statusMatch = error.message.match(/^(\d{3}):/);
    if (statusMatch) {
      status = parseInt(statusMatch[1], 10);
      message = error.message.replace(/^\d{3}:\s*/, '');
    } else {
      message = error.message;
    }

    // Check for network errors
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to load resource') ||
      error.message.includes('timeout') ||
      error.name === 'TypeError'
    ) {
      isNetworkError = true;
      status = 0;
      message = 'Network error. Please check your internet connection.';
    }
  }

  // Categorize errors
  if (status >= 400 && status < 500) {
    isClientError = true;
  } else if (status >= 500) {
    isServerError = true;
  }

  // Provide user-friendly messages
  switch (status) {
    case 0:
      message = 'Network error. Please check your internet connection.';
      break;
    case 400:
      message = 'Invalid request data. Please check your input and try again.';
      break;
    case 401:
      message = 'Authentication failed. Please check your credentials.';
      break;
    case 403:
      message = 'Access denied. Please verify your account or permissions.';
      break;
    case 404:
      message = 'Resource not found. The requested item may have been removed.';
      break;
    case 409:
      message = 'Conflict detected. This usually resolves automatically.';
      break;
    case 429:
      message = 'Too many requests. Please wait a moment before trying again.';
      break;
    case 500:
      message = 'Server error. The backend server is experiencing issues. Please try again in a few moments.';
      break;
    case 502:
    case 503:
    case 504:
      message = 'Service temporarily unavailable. Please try again later.';
      break;
    default:
      if (isServerError) {
        message = 'Server error. Please try again later.';
      } else if (isClientError && !message.includes('Invalid request')) {
        message = 'Request failed. Please check your input.';
      }
  }

  return {
    status,
    message,
    details,
    isNetworkError,
    isServerError,
    isClientError
  };
};

export const shouldRetryRequest = (error: ApiError): boolean => {
  // Retry on network errors, server errors, and specific client errors
  return (
    error.isNetworkError ||
    error.isServerError ||
    error.status === 409 || // Conflict
    error.status === 429    // Rate limit
  );
};

export const getRetryDelay = (attempt: number): number => {
  // Exponential backoff with jitter
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
  
  return delay + jitter;
};

export const createRetryableApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  retryCondition?: (error: ApiError) => boolean
): Promise<T> => {
  let lastError: ApiError | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = parseApiError(error);
      
      const shouldRetry = retryCondition ? 
        retryCondition(lastError) : 
        shouldRetryRequest(lastError);
      
      if (attempt === maxRetries || !shouldRetry) {
        throw lastError;
      }
      
      // Wait before retrying
      const delay = getRetryDelay(attempt);
      console.log(`API call failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(delay)}ms...`, lastError);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};