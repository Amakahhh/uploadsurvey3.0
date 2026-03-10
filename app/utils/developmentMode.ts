/**
 * Development mode utilities for handling API failures gracefully
 */

export const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development';
};

export const isBackendAvailable = async (): Promise<boolean> => {
  // Health check removed - backend availability will be determined by actual API calls
  return true;
};

export const createMockSurveyId = () => {
  return `dev_survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const shouldUseMockData = () => {
  return isDevelopmentMode() && localStorage.getItem('FORCE_MOCK_MODE') === 'true';
};

// Helper for debugging API requests
export const logApiRequest = (method: string, url: string, data?: any) => {
  if (isDevelopmentMode()) {
    console.group(`🌐 API ${method} ${url}`);
    if (data) {
      console.log('📤 Request Data:', data);
    }
    console.groupEnd();
  }
};

export const logApiError = (error: any, context: string) => {
  if (isDevelopmentMode()) {
    console.group(`❌ API Error in ${context}`);
    console.error('Error:', error);
    console.error('Error Type:', typeof error);
    console.error('Error Message:', error instanceof Error ? error.message : 'Not an Error object');
    console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};