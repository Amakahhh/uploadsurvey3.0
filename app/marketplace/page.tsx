'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Engineering: 'bg-blue-50 text-blue-700',
    'Social Sciences': 'bg-pink-50 text-pink-700',
    Business: 'bg-emerald-50 text-emerald-700',
    'Mass Communication': 'bg-orange-50 text-orange-700',
    General: 'bg-gray-100 text-gray-700',
    Education: 'bg-violet-50 text-violet-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
}

function normalizeTargetValues(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      return [value];
    }
    return [value];
  }
  return [String(value)];
}

interface SurveyCardProps {
  survey: any;
  onStart: (id: string) => void;
}

function SurveyCard({ survey, onStart }: SurveyCardProps) {
  const currentResponses = survey.responses_count || 0;
  const maxResponses = survey.response_cap || 0;
  const progress = maxResponses > 0 ? (currentResponses / maxResponses) * 100 : 0;
  const spotsLeft = maxResponses - currentResponses;
  const reward = survey.reward || 0;
  const time = survey.estimated_time || 5;
  const category = survey.category || 'General';
  const title = survey.title || 'Untitled Survey';
  const description = survey.description || '';
  const createdAt = survey.created_at || new Date().toISOString();
  const targetLevels = normalizeTargetValues(survey.target_level);
  const targetDepts = normalizeTargetValues(survey.target_department);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#B3935E]/5 hover:border-[#B3935E]/20 transition-all duration-300 p-5 sm:p-6 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(category)}`}>
          {category}
        </span>
        <span className="text-xs text-[#2E2F32]/40">{timeAgo(createdAt)}</span>
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-bold text-[#2E2F32] mb-2 group-hover:text-[#B3935E] transition-colors line-clamp-2">{title}</h3>
      <p className="text-sm text-[#2E2F32]/60 mb-4 line-clamp-2">{description}</p>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-sm mb-4">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold text-green-700">N{reward}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#2E2F32]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[#2E2F32]/60">~{time} mins</span>
        </div>
      </div>

      {/* Target Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {targetLevels.slice(0, 3).map((level: string) => (
          <span key={level} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-medium">
            {level === 'All' ? 'All Levels' : `${level} Level`}
          </span>
        ))}
        {targetDepts.slice(0, 2).map((dept: string) => (
          <span key={dept} className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-medium">
            {dept}
          </span>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[#2E2F32]/50">{currentResponses}/{maxResponses} responses</span>
          <span className={`font-medium ${spotsLeft < 20 ? 'text-red-500' : 'text-[#2E2F32]/50'}`}>
            {spotsLeft} spots left
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${progress > 80 ? 'bg-red-400' : 'bg-[#B3935E]'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onStart(survey.id)}
        className="w-full py-3 bg-[#B3935E] hover:bg-[#A0824F] text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#B3935E]/25 active:scale-[0.98]"
      >
        Start Survey - Earn N{reward}
      </button>
    </div>
  );
}

export default function MarketplacePage() {
  const { isAuthenticated, user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [activeSurveyId, setActiveSurveyId] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loadingError, setLoadingError] = useState('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Load surveys from API
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const data = await apiService.getSurveys();
        setSurveys(data);
      } catch (err: any) {
        console.error('Failed to load surveys:', err);
        setLoadingError('Failed to load surveys. Using demo data.');
      }
    };
    loadSurveys();
  }, []);

  useEffect(() => {
    const loadWallet = async () => {
      if (!isAuthenticated) return;
      try {
        const wallet = await apiService.getWallet();
        setWalletBalance(Number(wallet.balance || 0));
      } catch {
        setWalletBalance(0);
      }
    };
    loadWallet();
  }, [isAuthenticated]);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSurveyId && sessionTimer > 0) {
      interval = setInterval(() => {
        setSessionTimer((prev) => {
          if (prev <= 1) {
            setActiveSurveyId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSurveyId, sessionTimer]);

  const categories = ['All', ...new Set(surveys.map((s) => s.category || 'General'))];

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch = (survey.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (survey.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const surveyCategory = survey.category || 'General';
    const matchesCategory = selectedCategory === 'All' || surveyCategory === selectedCategory;
    return matchesSearch && matchesCategory && survey.status === 'active';
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'highest') return (b.reward || 0) - (a.reward || 0);
    if (sortBy === 'quickest') return (a.estimated_time || 0) - (b.estimated_time || 0);
    return 0;
  });

  const handleStartSurvey = async (id: string) => {
    if (activeSurveyId) {
      alert('You already have an active survey session. Complete or wait for it to expire before starting another.');
      return;
    }
    try {
      const response = await apiService.startSurveySession(id);
      if (response.sessionId) {
        setActiveSurveyId(id);
        setSessionTimer(30 * 60); // 30 minutes
        const startedSurvey = surveys.find((s) => s.id === id);
        if (startedSurvey?.google_form_url) {
          window.open(startedSurvey.google_form_url, '_blank');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start survey');
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const activeSurvey = surveys.find((s) => s.id === activeSurveyId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAF2] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B3935E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-[#2E2F32] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/onlylogo.svg" alt="SH" width={32} height={32} className="rounded-full" />
                <span className="font-bold text-lg hidden sm:inline">SurveyHustler</span>
              </Link>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="text-[#B3935E] font-semibold text-sm hidden sm:inline">View Surveys</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Wallet Balance */}
              <div className="bg-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#B3935E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-semibold text-sm">N{walletBalance.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/withdraw"
                  className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Withdraw
                </Link>
                <Link
                  href="/researcher"
                  className="text-xs bg-[#B3935E] hover:bg-[#A0824F] text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Upload Survey
                </Link>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#B3935E] flex items-center justify-center text-sm font-bold">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Active Session Banner */}
      {activeSurveyId && activeSurvey && (
        <div className="bg-gradient-to-r from-[#B3935E] to-[#C4A76E] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="font-medium text-sm">Active: {activeSurvey.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`font-mono font-bold ${sessionTimer < 300 ? 'text-red-200 animate-pulse' : ''}`}>
                    {formatTimer(sessionTimer)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setVerifyError(null);
                    setShowVerifyModal(true);
                  }}
                  className="px-4 py-1.5 bg-white text-[#B3935E] rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                >
                  Verify My Response
                </button>
                <button
                  onClick={() => { setActiveSurveyId(null); setSessionTimer(0); }}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2F32] mb-1">Survey Marketplace</h1>
            <p className="text-[#2E2F32]/60 text-sm">Find surveys that match your profile and start earning</p>
          </div>
          <Link
            href="/researcher"
            className="inline-flex items-center px-4 py-2.5 bg-[#2E2F32] hover:bg-[#1f2023] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Upload a Survey
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2E2F32]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B3935E] focus:ring-1 focus:ring-[#B3935E]/20 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B3935E] cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Pay</option>
            <option value="quickest">Quickest</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-[#B3935E] text-white shadow-md shadow-[#B3935E]/20'
                  : 'bg-white text-[#2E2F32]/60 hover:bg-[#B3935E]/10 hover:text-[#B3935E] border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="text-sm text-[#2E2F32]/50 mb-4">
          {filteredSurveys.length} survey{filteredSurveys.length !== 1 ? 's' : ''} available
        </div>

        {/* Survey Grid */}
        {filteredSurveys.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                onStart={handleStartSurvey}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-[#2E2F32] mb-2">No surveys found</h3>
            <p className="text-[#2E2F32]/60">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Verify Response Modal */}
      {showVerifyModal && activeSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              x
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B3935E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#B3935E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#2E2F32] mb-2">Verify Your Response</h3>
              <p className="text-sm text-[#2E2F32]/60 mb-6">
                Make sure you&apos;ve submitted the Google Form using your registered email ({user?.email || 'your email'}).
                We&apos;ll check the spreadsheet to confirm your submission.
              </p>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm mb-4 text-left">
                <strong>Important:</strong> Your form submission timestamp must be after you clicked &quot;Start Survey&quot; on SurveyHustler.
              </div>
              {verifyError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4 text-left">
                  {verifyError}
                </div>
              )}
              <button
                onClick={async () => {
                  if (!activeSurveyId) return;
                  setVerifyLoading(true);
                  setVerifyError(null);
                  try {
                    const result = await apiService.verifyResponse(activeSurveyId);
                    const newBalance = Number(result.walletBalance ?? result.data?.walletBalance ?? walletBalance);
                    if (!Number.isNaN(newBalance)) {
                      setWalletBalance(newBalance);
                    }
                    setShowVerifyModal(false);
                    setActiveSurveyId(null);
                    setSessionTimer(0);
                    alert(result.message || 'Response verified and wallet credited.');
                  } catch (err) {
                    setVerifyError(err instanceof Error ? err.message : 'Verification failed');
                  } finally {
                    setVerifyLoading(false);
                  }
                }}
                disabled={verifyLoading}
                className="w-full py-3 bg-[#B3935E] hover:bg-[#A0824F] text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-60"
              >
                {verifyLoading ? 'Verifying...' : `Verify & Get N${activeSurvey.reward || 0}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


