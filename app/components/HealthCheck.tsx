'use client';
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function HealthCheck() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkHealth = async () => {
    setStatus('checking');
    try {
      const result = await apiService.healthCheck();
      setStatus('online');
      setLastChecked(new Date().toLocaleTimeString());
    } catch (error) {
      setStatus('offline');
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return '🟢 API Online';
      case 'offline': return '🔴 API Offline';
      case 'checking': return '🟡 Checking...';
      default: return 'API Status';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className={getStatusColor()}>{getStatusText()}</span>
        {lastChecked && (
          <span className="text-gray-500 text-xs">
            ({lastChecked})
          </span>
        )}
        <button
          onClick={checkHealth}
          disabled={status === 'checking'}
          className="ml-2 text-xs text-[#B3935E] hover:underline disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}


