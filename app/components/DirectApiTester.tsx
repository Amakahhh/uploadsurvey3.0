'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DirectApiTester: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testWithRealData = async () => {
    if (!user) {
      setResults('Please login first to test authenticated endpoints.');
      return;
    }

    setLoading(true);
    setResults('Testing with realistic data...\n\n');
    
    const token = localStorage.getItem('jwtToken');
    
    // Test 1: Form verification with real Google Sheets URL
    try {
      setResults(prev => prev + '--- Testing Form Verification ---\n');
      
      const formRequest = {
        surveyId: `survey_${Date.now()}`,
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0'
      };
      
      setResults(prev => prev + `Request: ${JSON.stringify(formRequest, null, 2)}\n`);
      
      const formResponse = await fetch('https://survey-hustler-api.onrender.com/surveys/check-form-available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formRequest)
      });
      
      const formData = await formResponse.text();
      setResults(prev => prev + `Status: ${formResponse.status}\n`);
      setResults(prev => prev + `Headers: ${JSON.stringify(Object.fromEntries(formResponse.headers.entries()), null, 2)}\n`);
      setResults(prev => prev + `Response: ${formData}\n\n`);
      
    } catch (error) {
      setResults(prev => prev + `Form verification error: ${error}\n\n`);
    }

    // Test 2: Survey creation with minimal valid data
    try {
      setResults(prev => prev + '--- Testing Survey Creation ---\n');
      
      const surveyRequest = {
        name: 'Test Survey ' + Date.now(),
        description: 'A simple test survey to check API connectivity',
        responderLink: 'https://forms.gle/example123',
        sheetLink: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0',
        maxResponseNo: 10,
        chargePerResponse: 100.0,
        begin: new Date().toISOString(),
        creatorId: user.id,
        conditions: []
      };
      
      setResults(prev => prev + `Request: ${JSON.stringify(surveyRequest, null, 2)}\n`);
      
      const surveyResponse = await fetch('https://survey-hustler-api.onrender.com/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(surveyRequest)
      });
      
      const surveyData = await surveyResponse.text();
      setResults(prev => prev + `Status: ${surveyResponse.status}\n`);
      setResults(prev => prev + `Headers: ${JSON.stringify(Object.fromEntries(surveyResponse.headers.entries()), null, 2)}\n`);
      setResults(prev => prev + `Response: ${surveyData}\n\n`);
      
    } catch (error) {
      setResults(prev => prev + `Survey creation error: ${error}\n\n`);
    }

    // Test 3: Check what user data looks like
    setResults(prev => prev + '--- Current User Data ---\n');
    setResults(prev => prev + `User ID: ${user.id}\n`);
    setResults(prev => prev + `User Name: ${user.firstName} ${user.lastName}\n`);
    setResults(prev => prev + `Token Length: ${token?.length || 0} characters\n`);
    setResults(prev => prev + `Token Preview: ${token?.substring(0, 50)}...\n\n`);

    setLoading(false);
  };

  const testTokenValidity = async () => {
    setLoading(true);
    setResults('Testing JWT token validity...\n\n');
    
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      setResults(prev => prev + 'No JWT token found. Please login first.\n');
      setLoading(false);
      return;
    }

    try {
      // Try to decode JWT (just the payload, not verifying signature)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        setResults(prev => prev + `JWT Payload: ${JSON.stringify(payload, null, 2)}\n\n`);
        
        // Check expiration
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          setResults(prev => prev + `Token expires: ${expDate.toISOString()}\n`);
          setResults(prev => prev + `Current time: ${now.toISOString()}\n`);
          setResults(prev => prev + `Token is ${expDate > now ? 'VALID' : 'EXPIRED'}\n\n`);
        }
      }
      
      // Test with a simple authenticated endpoint
      const response = await fetch('https://survey-hustler-api.onrender.com/schools', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.text();
      setResults(prev => prev + `Test endpoint (/schools) status: ${response.status}\n`);
      setResults(prev => prev + `Response: ${data.substring(0, 200)}...\n`);
      
    } catch (error) {
      setResults(prev => prev + `Token test error: ${error}\n`);
    }

    setLoading(false);
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-96 z-50 bg-white border rounded-lg shadow-lg w-[500px] max-h-96 overflow-hidden">
      <div className="bg-green-600 text-white p-3 flex items-center justify-between">
        <h3 className="font-semibold">🔬 Direct API Tester</h3>
        <span className="text-xs">{user ? `Logged in as ${user.firstName}` : 'Not logged in'}</span>
      </div>
      
      <div className="p-3 space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={testWithRealData}
            disabled={loading || !user}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {loading ? 'Testing...' : 'Test with Real Data'}
          </button>
          
          <button
            onClick={testTokenValidity}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            Check Token
          </button>
        </div>
        
        <div className="border-t pt-2 max-h-64 overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded font-mono">
            {results || 'Click a button to test API calls with realistic data'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DirectApiTester;