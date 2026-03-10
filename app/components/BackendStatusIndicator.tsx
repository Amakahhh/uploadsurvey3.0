'use client';

import React, { useState, useEffect } from 'react';

const BackendStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkBackendStatus = async () => {
    setStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('https://survey-hustler-api.onrender.com/health', {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      console.log('Backend health check failed:', error);
      setStatus('offline');
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkBackendStatus();
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Backend Online';
      case 'offline': return 'Backend Offline (Using Mock Data)';
      case 'checking': return 'Checking Backend...';
      default: return 'Unknown';
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Hide in production
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-3 border">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}>
          {status === 'checking' && (
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="text-sm">
          <div className="font-medium">{getStatusText()}</div>
          {lastCheck && (
            <div className="text-xs text-gray-500">
              Last checked: {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </div>
        <button
          onClick={checkBackendStatus}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default BackendStatusIndicator;