'use client';
import React, { useState } from 'react';
import { apiService, LoginRequest, RegisterRequest } from './services/api';
import { useAuth } from './contexts/AuthContext';
import { safeLocalStorage } from './utils/storageUtils';
import { parseApiError } from './utils/apiErrorHandler';

export default function LoginOverlay() {
  const { login } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testConnectionResult, setTestConnectionResult] = useState<string | null>(null);
  
  // Helper function to clear session data
  const clearSessionData = () => {
    safeLocalStorage.removeItem('jwtToken');
    safeLocalStorage.removeItem('refreshToken');
    safeLocalStorage.removeItem('userData');
  };

  // Test backend connection
  const testBackendConnection = async () => {
    setIsTestingConnection(true);
    setTestConnectionResult(null);
    
    try {
      console.log('🧪 Testing backend connection to https://survey-hustler-api.onrender.com...');
      const result = await apiService.healthCheck();
      console.log('✅ Backend is reachable:', result);
      setTestConnectionResult('✅ Backend is online and responding');
    } catch (err) {
      console.error('❌ Backend connection failed:', err);
      const apiError = parseApiError(err);
      
      if (apiError.message.includes('timeout')) {
        setTestConnectionResult('❌ Backend is not responding (timeout). The server may be sleeping or offline. If using Render.com free tier, the dyno may have spun down. Try waking it up or check if the backend is running.');
      } else if (apiError.isNetworkError) {
        setTestConnectionResult('❌ Network error: Cannot reach the backend server. Check your internet connection or verify the backend URL is correct.');
      } else {
        setTestConnectionResult(`❌ Backend error: ${apiError.message}`);
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState<RegisterRequest>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔐 Login attempt started for:', loginData.email);
      const authData = await apiService.login(loginData);
      console.log('🔐 Login response received:', { isAuthenticated: authData.isAuthenticated, id: authData.id });
      
      if (authData.isAuthenticated) {
        console.log('✅ Authentication successful, logging in user...');
        login({
          id: authData.id,
          firstName: authData.firstName,
          lastName: authData.lastName,
          email: authData.email,
          roles: authData.roles,
          isVerified: authData.isVerified
        }, authData.jwToken, authData.refreshToken);
      } else {
        console.error('❌ Authentication failed - isAuthenticated is false');
        setError('Authentication failed. Please check your email and password.');
      }
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Login error caught:', err);
      const apiError = parseApiError(err);
      console.error('📊 Parsed API error:', apiError);
      
      if (apiError.status === 409) {
        // 409 errors are now handled automatically by the retry logic
        setError('Session conflict detected. Please clear browser storage and try again. (F12 → Application → LocalStorage → Clear)');
        clearSessionData();
      } else if (apiError.isNetworkError) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (apiError.message.includes('timeout')) {
        setError('⏱️ Backend timeout - The server is not responding (took >20 seconds). It may be sleeping (Render free tier) or offline. Click "Test Connection" to check.');
      } else if (apiError.status === 500) {
        setError('Backend server error (500). The backend may be experiencing issues. Please try again in a few moments.');
      } else if (apiError.status === 0) {
        setError('Unable to connect to the server. The backend appears to be offline or unreachable.');
      } else if (apiError.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(apiError.message);
      }
      
      setIsLoading(false);
    }
  };

  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
    setError(null);
    setSuccess(null);
  };

  const validateSignupForm = (): string | null => {
    if (!signupData.firstName.trim()) {
      return 'First name is required';
    }
    if (!signupData.lastName.trim()) {
      return 'Last name is required';
    }
    if (!signupData.userName.trim()) {
      return 'Username is required';
    }
    if (!signupData.email.trim()) {
      return 'Email is required';
    }
    if (!signupData.password) {
      return 'Password is required';
    }
    if (signupData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (signupData.password !== signupData.confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateSignupForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiService.register(signupData);
      setSuccess('Registration successful! A verification email has been sent to ' + signupData.email + '. Please verify your email before logging in.');
      
      // Clear form
      setSignupData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        userName: ''
      });
      
      // Switch back to login after 3 seconds
      setTimeout(() => {
        setShowSignup(false);
      }, 3000);
      
      setIsLoading(false);
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      setIsLoading(false);
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-40 z-20 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-[#B3935E] text-center w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#2E2F32]">
          {showSignup ? 'Sign Up for SurveyHustler' : 'Login to SurveyHustler'}
        </h2>

        {showSignup ? (
          /* Signup Form */
          <form onSubmit={handleSignup} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-left">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={signupData.firstName}
                  onChange={handleSignupInputChange}
                  required
                  className="border border-gray-300 px-3 py-2 w-full rounded-md focus:border-[#B3935E] focus:outline-none text-sm"
                  placeholder="John"
                />
              </div>

              <div className="text-left">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={signupData.lastName}
                  onChange={handleSignupInputChange}
                  required
                  className="border border-gray-300 px-3 py-2 w-full rounded-md focus:border-[#B3935E] focus:outline-none text-sm"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="text-left">
              <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="signupEmail"
                name="email"
                value={signupData.email}
                onChange={handleSignupInputChange}
                required
                autoComplete="email"
                className="border border-gray-300 px-3 py-2 w-full rounded-md focus:border-[#B3935E] focus:outline-none"
                placeholder="john@example.com"
              />
            </div>

            <div className="text-left">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={signupData.userName}
                onChange={handleSignupInputChange}
                required
                autoComplete="username"
                className="border border-gray-300 px-3 py-2 w-full rounded-md focus:border-[#B3935E] focus:outline-none"
                placeholder="johndoe123"
              />
            </div>

            <div className="text-left">
              <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="signupPassword"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupInputChange}
                  required
                  autoComplete="new-password"
                  className="border border-gray-300 px-3 py-2 w-full rounded-md focus:border-[#B3935E] focus:outline-none pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="text-left">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleSignupInputChange}
                  required
                  autoComplete="new-password"
                  className="border border-gray-300 px-3 py-2 w-full rounded-md focus:border-[#B3935E] focus:outline-none pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#B3935E] text-white w-full py-3 rounded-md font-medium hover:bg-[#8B7358] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setShowSignup(false)}
                className="text-[#B3935E] hover:text-[#8B7358] font-medium"
              >
                Log In
              </button>
            </div>
          </form>
        ) : (
          /* Login Form */
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-left">
                <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  required
                  autoComplete="username"
                  className="border border-gray-300 px-3 py-2 w-full rounded-md focus:border-[#B3935E] focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div className="text-left">
                <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="loginPassword"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    required
                    autoComplete="current-password"
                    className="border border-gray-300 px-3 py-2 w-full rounded-md focus:border-[#B3935E] focus:outline-none pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#B3935E] text-white w-full py-3 rounded-md font-medium hover:bg-[#8B7358] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>

              <button
                type="button"
                onClick={testBackendConnection}
                disabled={isTestingConnection}
                className="bg-gray-500 text-white w-full py-2 rounded-md font-medium text-sm hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </button>

              {testConnectionResult && (
                <div className={`text-sm mt-2 p-2 rounded ${testConnectionResult.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {testConnectionResult}
                </div>
              )}
            </form>

            <div className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setShowSignup(true)}
                className="text-[#B3935E] hover:text-[#8B7358] font-medium"
              >
                Sign Up
              </button>
            </div>
          </>
        )}

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mt-4 flex items-start gap-2 text-sm">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mt-4 flex items-start gap-2 text-sm">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>{success}</span>
          </div>
        )}
      </div>
    </div>
  );
}
