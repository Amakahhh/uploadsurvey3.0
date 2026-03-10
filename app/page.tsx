'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFAF2] text-[#2E2F32] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2E2F32]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/onlylogo.svg" alt="SurveyHustler" width={40} height={40} className="rounded-full" />
              <span className="text-white font-bold text-xl tracking-tight">SurveyHustler</span>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/marketplace"
                    className="px-5 py-2 bg-[#B3935E] hover:bg-[#A0824F] text-white rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#B3935E]/25"
                  >
                    View Surveys
                  </Link>
                  <Link
                    href="/researcher"
                    className="px-5 py-2 border border-[#B3935E] text-[#B3935E] hover:bg-[#B3935E] hover:text-white rounded-lg font-medium text-sm transition-all duration-300"
                  >
                    Upload Surveys
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-5 py-2 text-white/80 hover:text-white font-medium text-sm transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2 bg-[#B3935E] hover:bg-[#A0824F] text-white rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#B3935E]/25"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#B3935E]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#B3935E]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Content */}
            <div className={`space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#B3935E]/10 border border-[#B3935E]/20 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-[#B3935E]">Live on Covenant University</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                Fill Surveys.{' '}
                <span className="text-[#B3935E]">Get Paid</span>
                <br />
                <span className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#2E2F32]/70">Instantly.</span>
              </h1>

              <p className="text-lg text-[#2E2F32]/70 leading-relaxed max-w-lg">
                SurveyHustler is your campus marketplace for research surveys. 
                <strong className="text-[#2E2F32]"> Researchers</strong> access targeted respondents, and{' '}
                <strong className="text-[#2E2F32]">students</strong> earn real cash — all verified and automated.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="group relative px-8 py-4 bg-[#B3935E] hover:bg-[#A0824F] text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#B3935E]/30 text-center overflow-hidden"
                >
                  <span className="relative z-10">Start Earning Today</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C4A76E] to-[#B3935E] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                <Link
                  href="/researcher"
                  className="px-8 py-4 border-2 border-[#2E2F32]/20 hover:border-[#B3935E] text-[#2E2F32] hover:text-[#B3935E] rounded-xl font-semibold text-lg transition-all duration-300 text-center"
                >
                  Upload a Survey
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <div className="text-2xl font-bold text-[#B3935E]">500+</div>
                  <div className="text-sm text-[#2E2F32]/60">Active Students</div>
                </div>
                <div className="w-px h-10 bg-[#2E2F32]/10" />
                <div>
                  <div className="text-2xl font-bold text-[#B3935E]">₦75+</div>
                  <div className="text-sm text-[#2E2F32]/60">Min Per Survey</div>
                </div>
                <div className="w-px h-10 bg-[#2E2F32]/10" />
                <div>
                  <div className="text-2xl font-bold text-[#B3935E]">Instant</div>
                  <div className="text-sm text-[#2E2F32]/60">Payouts</div>
                </div>
              </div>
            </div>

            {/* Right - Mock Survey Card */}
            <div className={`relative transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-[#B3935E]/10 border border-[#B3935E]/10 p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#B3935E] bg-[#B3935E]/10 px-3 py-1 rounded-full">Featured Survey</span>
                    <span className="text-xs text-[#2E2F32]/50">Posted 2h ago</span>
                  </div>
                  
                  <h3 className="text-xl font-bold">Impact of AI on Academic Performance</h3>
                  <p className="text-sm text-[#2E2F32]/60">Help us understand how AI tools affect student learning outcomes at CU.</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-semibold text-green-700">₦200</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#2E2F32]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-[#2E2F32]/60">~5 mins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#2E2F32]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-[#2E2F32]/60">43/100</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">Engineering</span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-medium">300 Level+</span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md font-medium">All Depts</span>
                  </div>

                  <button className="w-full py-3 bg-[#B3935E] hover:bg-[#A0824F] text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#B3935E]/25">
                    Start Survey — Earn ₦200
                  </button>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-bounce">
                +₦200 💰
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#2E2F32] text-xs font-medium px-4 py-2 rounded-full shadow-lg border border-[#B3935E]/20">
                ✅ Verified &amp; Credited
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#2E2F32] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">Three simple steps to start earning or get your research done.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Browse & Start', desc: 'Find surveys matching your profile on the marketplace. Click "Start" to begin a 30-minute session.' },
              { num: '2', title: 'Fill the Survey', desc: 'Complete the Google Form survey with honest responses. Use your registered CU email address.' },
              { num: '3', title: 'Get Paid Instantly', desc: 'Click "Verify Response" and your wallet is credited immediately. Withdraw to your bank anytime!' },
            ].map((step) => (
              <div key={step.num} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-[#B3935E]/50 transition-all duration-300 group">
                <div className="w-14 h-14 bg-[#B3935E] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-white/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Researchers */}
      <section className="py-20 bg-[#FCFAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#B3935E] font-semibold text-sm uppercase tracking-wider">For Researchers</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6">Get Quality Responses in Hours, Not Weeks</h2>
              <div className="space-y-5">
                {[
                  { title: 'Targeted Sampling', desc: 'Filter by college, department, level, or course. Reach exactly who you need.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { title: 'AI-Powered Analysis', desc: 'Get instant summaries, correlations, and statistical analysis powered by Gemini AI.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                  { title: 'Secure Escrow', desc: 'Funds held safely. Only released when responses are verified via Google Sheets.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 bg-[#B3935E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#B3935E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-[#2E2F32]/60 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/researcher"
                className="inline-block mt-8 px-8 py-3.5 bg-[#B3935E] hover:bg-[#A0824F] text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#B3935E]/25"
              >
                Upload Your Survey →
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl border border-[#B3935E]/10 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-lg">Your Survey Dashboard</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Live</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-[#2E2F32]/60">Total Responses</span><span className="font-semibold">67 / 100</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-[#B3935E] h-2.5 rounded-full" style={{ width: '67%' }} /></div>
                  <div className="flex justify-between text-sm"><span className="text-[#2E2F32]/60">Budget Spent</span><span className="font-semibold">₦13,400 / ₦20,000</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[#2E2F32]/60">Avg. Completion Time</span><span className="font-semibold">4.2 mins</span></div>
                  <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300">
                    ✨ AI Analyze Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2E2F32] text-white/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/onlylogo.svg" alt="SurveyHustler" width={32} height={32} className="rounded-full" />
              <span className="text-white font-semibold">SurveyHustler</span>
            </div>
            <p className="text-sm">© 2026 SurveyHustler. Built for the Covenant University community.</p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/signup" className="hover:text-[#B3935E] transition-colors">Sign Up</Link>
              <Link href="/login" className="hover:text-[#B3935E] transition-colors">Log In</Link>
              <Link href="/marketplace" className="hover:text-[#B3935E] transition-colors">View Surveys</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
