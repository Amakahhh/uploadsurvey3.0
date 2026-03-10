'use client';

import React, { useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ApiDiagnosticPanel: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (endpoint: string, method: string, status: string, details: any) => {
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      endpoint,
      method,
      status,
      details: typeof details === 'object' ? JSON.stringify(details, null, 2) : details
    }]);
  };

  const testHealthEndpoint = async () => {
    try {
      const response = await fetch('https://survey-hustler-api.onrender.com/health');
      const data = await response.json();
      addResult('/health', 'GET', response.ok ? 'SUCCESS' : 'FAILED', data);
    } catch (error) {
      addResult('/health', 'GET', 'ERROR', error);
    }
  };

  const testFormVerification = async () => {
    try {
      const testRequest = {
        surveyId: 'diagnostic-test',
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/test123/edit'
      };
      
      console.log('Form verification request:', testRequest);
      const result = await apiService.verifyForm(testRequest);
      addResult('/surveys/check-form-available', 'POST', 'SUCCESS', result);
    } catch (error: any) {
      console.error('Form verification error:', error);
      addResult('/surveys/check-form-available', 'POST', 'FAILED', {
        message: error.message,
        status: error.status,
        isAuthError: error.status === 401 || error.status === 403,
        fullError: error
      });
    }
  };

  const testSurveyCreation = async () => {
    if (!user) {
      addResult('/surveys', 'POST', 'FAILED', 'No authenticated user');
      return;
    }

    try {
      const testSurvey = {
        name: 'Diagnostic Test Survey',
        description: 'Testing survey creation endpoint',
        responderLink: 'https://forms.gle/test123',
        sheetLink: 'https://docs.google.com/spreadsheets/d/test123/edit',
        maxResponseNo: 10,
        chargePerResponse: 50,
        begin: new Date().toISOString(),
        creatorId: user.id,
        conditions: []
      };
      
      console.log('Survey creation request:', testSurvey);
      const result = await apiService.createSurvey(testSurvey);
      addResult('/surveys', 'POST', 'SUCCESS', result);
    } catch (error: any) {
      console.error('Survey creation error:', error);
      addResult('/surveys', 'POST', 'FAILED', {
        message: error.message,
        status: error.status,
        isAuthError: error.status === 401 || error.status === 403,
        fullError: error
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Test basic connectivity
    await testHealthEndpoint();
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test form verification
    await testFormVerification();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test survey creation (only if authenticated)
    if (isAuthenticated && user) {
      await testSurveyCreation();
    } else {
      addResult('/surveys', 'POST', 'SKIPPED', 'User not authenticated');
    }
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 bg-white border rounded-lg shadow-lg w-96 max-h-96 overflow-hidden">
      <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
        <h3 className="font-semibold">🔧 API Diagnostic</h3>
        <div className="flex space-x-2">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-2 py-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded text-xs"
          >
            {isRunning ? 'Running...' : 'Test APIs'}
          </button>
          <button
            onClick={clearResults}
            className="px-2 py-1 bg-gray-500 hover:bg-gray-600 rounded text-xs"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="p-3">
        <div className="mb-3 text-sm space-y-1">
          <div className="flex items-center gap-2">
            <strong>Auth Status:</strong>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                {isAuthenticated ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                )}
              </svg>
              {isAuthenticated ? 'Logged In' : 'Not Logged In'}
            </span>
          </div>
          {user && <div><strong>User:</strong> {user.firstName} ({user.id})</div>}
          <div className="flex items-center gap-2">
            <strong>Token Present:</strong>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                {localStorage.getItem('jwtToken') ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                )}
              </svg>
              {localStorage.getItem('jwtToken') ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        
        <div className="border-t pt-3 max-h-64 overflow-y-auto">
          <h4 className="font-semibold mb-2 text-sm">Test Results:</h4>
          {testResults.length === 0 && !isRunning && (
            <p className="text-gray-500 text-sm">Click "Test APIs" to run diagnostics</p>
          )}
          
          {testResults.map((result, index) => (
            <div key={index} className="mb-3 p-2 bg-gray-50 rounded text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono">{result.method} {result.endpoint}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                  result.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {result.status}
                </span>
              </div>
              <div className="text-gray-600 break-all">
                <strong>Time:</strong> {result.timestamp}<br/>
                <strong>Details:</strong> {result.details}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiDiagnosticPanel;