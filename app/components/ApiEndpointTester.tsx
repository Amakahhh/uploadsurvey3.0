'use client';

import React, { useState } from 'react';
import { apiService } from '../services/api';

const ApiEndpointTester: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDifferentFormats = async () => {
    setLoading(true);
    setResult('Testing different request formats...\n');

    // Test format 1: Original format
    try {
      setResult(prev => prev + '\n--- Test 1: Original Format ---\n');
      const request1 = {
        surveyId: 'test-survey-123',
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1ABC123/edit'
      };
      setResult(prev => prev + `Request: ${JSON.stringify(request1, null, 2)}\n`);
      
      const response1 = await fetch('https://survey-hustler-api.onrender.com/surveys/check-form-available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwtToken') || 'no-token'}`
        },
        body: JSON.stringify(request1),
      });
      
      const data1 = await response1.text();
      setResult(prev => prev + `Status: ${response1.status}\nResponse: ${data1}\n`);
    } catch (error) {
      setResult(prev => prev + `Error: ${error}\n`);
    }

    // Test format 2: Different field names
    try {
      setResult(prev => prev + '\n--- Test 2: Alternative Field Names ---\n');
      const request2 = {
        id: 'test-survey-123',
        sheetUrl: 'https://docs.google.com/spreadsheets/d/1ABC123/edit'
      };
      setResult(prev => prev + `Request: ${JSON.stringify(request2, null, 2)}\n`);
      
      const response2 = await fetch('https://survey-hustler-api.onrender.com/surveys/check-form-available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwtToken') || 'no-token'}`
        },
        body: JSON.stringify(request2),
      });
      
      const data2 = await response2.text();
      setResult(prev => prev + `Status: ${response2.status}\nResponse: ${data2}\n`);
    } catch (error) {
      setResult(prev => prev + `Error: ${error}\n`);
    }

    // Test format 3: Minimal format
    try {
      setResult(prev => prev + '\n--- Test 3: Minimal Format ---\n');
      const request3 = {
        url: 'https://docs.google.com/spreadsheets/d/1ABC123/edit'
      };
      setResult(prev => prev + `Request: ${JSON.stringify(request3, null, 2)}\n`);
      
      const response3 = await fetch('https://survey-hustler-api.onrender.com/surveys/check-form-available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwtToken') || 'no-token'}`
        },
        body: JSON.stringify(request3),
      });
      
      const data3 = await response3.text();
      setResult(prev => prev + `Status: ${response3.status}\nResponse: ${data3}\n`);
    } catch (error) {
      setResult(prev => prev + `Error: ${error}\n`);
    }

    setLoading(false);
  };

  const testSurveyCreationFormats = async () => {
    setLoading(true);
    setResult('Testing survey creation formats...\n');

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setResult(prev => prev + 'No JWT token found. Please login first.\n');
      setLoading(false);
      return;
    }

    // Test minimal survey creation
    try {
      setResult(prev => prev + '\n--- Survey Creation Test ---\n');
      const surveyRequest = {
        name: 'Test Survey',
        description: 'Testing API endpoint',
        responderLink: 'https://forms.gle/test123',
        sheetLink: 'https://docs.google.com/spreadsheets/d/test123/edit',
        maxResponseNo: 10,
        chargePerResponse: 50.0,
        begin: new Date().toISOString(),
        creatorId: 'test-creator-id',
        conditions: []
      };
      
      setResult(prev => prev + `Request: ${JSON.stringify(surveyRequest, null, 2)}\n`);
      
      const response = await fetch('https://survey-hustler-api.onrender.com/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(surveyRequest),
      });
      
      const data = await response.text();
      setResult(prev => prev + `Status: ${response.status}\nResponse: ${data}\n`);
    } catch (error) {
      setResult(prev => prev + `Error: ${error}\n`);
    }

    setLoading(false);
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-white border rounded-lg shadow-lg w-96 max-h-96 overflow-hidden">
      <div className="bg-purple-600 text-white p-3 flex items-center justify-between">
        <h3 className="font-semibold">🧪 API Format Tester</h3>
      </div>
      
      <div className="p-3 space-y-2">
        <button
          onClick={testDifferentFormats}
          disabled={loading}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
        >
          {loading ? 'Testing...' : 'Test Form Verification Formats'}
        </button>
        
        <button
          onClick={testSurveyCreationFormats}
          disabled={loading}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {loading ? 'Testing...' : 'Test Survey Creation'}
        </button>
        
        <div className="border-t pt-2 max-h-48 overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded">
            {result || 'Click a button to test API formats'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ApiEndpointTester;