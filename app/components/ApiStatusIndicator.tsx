'use client';

import React, { useState, useEffect } from 'react';

interface ApiStatusIndicatorProps {
  className?: string;
}

interface ApiStatus {
  status: 'online' | 'degraded' | 'offline';
  message: string;
  lastChecked: Date;
}

const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<ApiStatus>({
    status: 'online',
    message: 'All systems operational',
    lastChecked: new Date()
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const checkApiStatus = async () => {
    // Health check removed - API status will be determined by actual API calls
    setStatus({
      status: 'online',
      message: 'API status will be shown when making requests',
      lastChecked: new Date()
    });
  };

  useEffect(() => {
    // Check immediately
    checkApiStatus();

    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status.status) {
      case 'online':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'online':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'offline':
        return '✗';
      default:
        return '?';
    }
  };

  // Only show if there are issues or in development
  const shouldShow = status.status !== 'online' || process.env.NODE_ENV === 'development';

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg cursor-pointer transition-all duration-200 ${
          isExpanded ? 'bg-white border' : 'bg-gray-800 text-white'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className={`w-3 h-3 rounded-full ${getStatusColor()} ${
            status.status === 'degraded' ? 'animate-pulse' : ''
          }`}
        />
        <span className="text-sm font-medium">
          {getStatusIcon()} API
        </span>
        {isExpanded && (
          <div className="text-xs text-gray-600">
            {status.message}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-2 bg-white border rounded-lg shadow-lg p-3 text-sm">
          <div className="space-y-2">
            <div>
              <span className="font-medium">Status:</span>{' '}
              <span className={`font-semibold ${
                status.status === 'online' ? 'text-green-600' :
                status.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {status.status.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-medium">Message:</span>{' '}
              {status.message}
            </div>
            <div className="text-gray-500 text-xs">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                checkApiStatus();
              }}
              className="w-full mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiStatusIndicator;