'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiService, LoginRequest } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { parseApiError } from '../utils/apiErrorHandler';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loginData, setLoginData] = useState<LoginRequest>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const authData = await apiService.login(loginData);
      if (authData.isAuthenticated) {
        login({
          id: authData.id,
          firstName: authData.firstName,
          lastName: authData.lastName,
          email: authData.email,
          roles: authData.roles,
          isVerified: authData.isVerified,
        }, authData.jwToken, authData.refreshToken);
        router.push('/marketplace');
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      const apiError = parseApiError(err);
      if (apiError.status === 401) {
        setError('Invalid email or password.');
      } else if (apiError.isNetworkError) {
        setError('Network error. Please check your connection.');
      } else if (apiError.message.includes('timeout')) {
        setError('Server timeout. The server may be waking up — please try again in 30 seconds.');
      } else {
        setError(apiError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left visual panel */}
      <div className="hidden md:flex w-1/2 relative bg-[#2E2F32] items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/woodbg.svg" alt="Background" fill className="object-cover opacity-30" />
        </div>
        <div className="relative z-10 text-center space-y-6 p-8">
          <Image src="/onlylogo.svg" alt="SurveyHustler" width={200} height={200} className="mx-auto" />
          <h2 className="text-white text-3xl font-bold">Welcome Back!</h2>
          <p className="text-white/60 text-lg max-w-md">
            Login to access the survey marketplace, check your wallet, and manage your research.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-[#FCFAF2] flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center mb-8">
            <Image src="/onlylogo.svg" alt="SurveyHustler" width={80} height={80} />
          </div>

          <div className="mb-8">
            <Link href="/" className="text-[#B3935E] hover:text-[#A0824F] text-sm font-medium flex items-center gap-1 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-[#2E2F32] mb-2">Log In</h1>
            <p className="text-[#2E2F32]/60">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="loginEmail" className="block text-sm font-medium text-[#2E2F32] mb-1.5">Email Address</label>
              <input
                type="email" id="loginEmail" name="email" value={loginData.email} onChange={handleInputChange} required autoComplete="username"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#2E2F32] focus:outline-none focus:border-[#B3935E] focus:ring-2 focus:ring-[#B3935E]/20 transition-all"
                placeholder="you@stu.cu.edu.ng"
              />
            </div>

            <div>
              <label htmlFor="loginPassword" className="block text-sm font-medium text-[#2E2F32] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} id="loginPassword" name="password" value={loginData.password} onChange={handleInputChange} required autoComplete="current-password"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#2E2F32] focus:outline-none focus:border-[#B3935E] focus:ring-2 focus:ring-[#B3935E]/20 transition-all pr-12"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit" disabled={isLoading}
              className="w-full py-3.5 bg-[#B3935E] hover:bg-[#A0824F] text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#B3935E]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#2E2F32]/60">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#B3935E] hover:text-[#A0824F] font-medium">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
