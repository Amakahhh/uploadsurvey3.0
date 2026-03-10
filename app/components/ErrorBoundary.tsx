'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
    
    // Check if this is a localStorage/JSON parsing error
    if (error.message?.includes('JSON') || error.message?.includes('localStorage') || 
        error.message?.includes('[object Object]')) {
      console.log('Detected storage-related error, attempting cleanup...');
      
      try {
        // Clear potentially problematic localStorage data
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          try {
            const value = localStorage.getItem(key);
            if (value === '[object Object]' || value === '[object Array]') {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // If we can't even access the key, try to remove it
            try {
              localStorage.removeItem(key);
            } catch (removeError) {
              console.log('Failed to remove key:', key, removeError);
            }
          }
        });
        
        console.log('Storage cleanup completed');
      } catch (cleanupError) {
        console.error('Error during storage cleanup:', cleanupError);
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCFAF2] flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
            <div className="text-red-600 text-xl font-bold mb-4">
              Something went wrong
            </div>
            <div className="text-gray-700 mb-4">
              An error occurred while loading the application. This might be due to:
            </div>
            <ul className="text-sm text-gray-600 mb-6 list-disc ml-4">
              <li>Browser extension conflicts</li>
              <li>Corrupted local storage data</li>
              <li>Network connectivity issues</li>
            </ul>
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Clear localStorage and reload
                  try {
                    localStorage.clear();
                  } catch (e) {
                    console.error('Error clearing localStorage:', e);
                  }
                  window.location.reload();
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Clear Data & Reload
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                }}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
            {this.state.error && (
              <details className="mt-4 text-xs text-gray-500">
                <summary className="cursor-pointer">Technical Details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;