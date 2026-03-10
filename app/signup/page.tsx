'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import SignupStepOne from './components/SignupStepOne';
import SignupStepTwo from './components/SignupStepTwo';
import SignupStepThree from './components/SignupStepThree';
import Link from 'next/link';
import { apiService } from '../services/api';

type Direction = 1 | -1;

const STEPPER_STEPS = 3;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function Stepper({ currentStepIndex, inStepProgress, trailingComplete, showVerifyModal }: { currentStepIndex: number; inStepProgress: number; trailingComplete: boolean; showVerifyModal: boolean }) {
  const circles = new Array(STEPPER_STEPS).fill(0);
  const leftBarFill = 1;

  return (
    <div className="w-full max-w-[560px] mx-auto flex items-center justify-center gap-0 select-none">
      <div className="relative flex-1 h-2 rounded-full border border-[#B3935E] bg-transparent overflow-hidden -mr-px">
        <motion.div
          className="absolute left-0 top-0 h-full bg-[#B3935E] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${leftBarFill * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
      {circles.map((_, index) => {
        const isLastCircle = index === STEPPER_STEPS - 1;
        let circleFill = 0;
        if (index === 0) circleFill = 1;
        else if (index === 1) circleFill = currentStepIndex >= 1 ? 1 : 0;
        else if (isLastCircle) circleFill = currentStepIndex >= index ? 1 : 0;

        let barFill = 0;
        if ((index === 0 && currentStepIndex === 0) || (index === 1 && currentStepIndex === 1)) {
          barFill = clamp(inStepProgress, 0, 1);
        } else if (currentStepIndex > index) {
          barFill = 1;
        }
        const isLast = index === STEPPER_STEPS - 1;
        return (
          <React.Fragment key={index}>
            <div className="flex items-center gap-0">
              <div className="relative z-10 w-8 h-8 shrink-0 rounded-full border-2 border-[#B3935E] overflow-hidden text-[13px] font-semibold text-[#2E2F32] bg-transparent flex items-center justify-center">
                <span className="relative z-10">{index + 1}</span>
                <motion.div
                  className="absolute left-0 top-0 h-full bg-[#B3935E]"
                  style={{ width: 0 }}
                  animate={{ width: `${circleFill * 100}%` }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                />
              </div>
            </div>
            {!isLast && (
              <div className="relative flex-1 h-2 rounded-full border border-[#B3935E] bg-transparent overflow-hidden -mx-px">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-[#B3935E] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${barFill * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
      <div className="relative flex-1 h-2 rounded-full border border-[#B3935E] bg-transparent overflow-hidden -ml-px">
        <motion.div
          className="absolute left-0 top-0 h-full bg-[#B3935E] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(
            currentStepIndex === STEPPER_STEPS - 1
              ? (showVerifyModal ? 0 : trailingComplete ? 100 : 50)
              : 0
          )}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [withinStepProgress, setWithinStepProgress] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [justAdvanced, setJustAdvanced] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [trailingComplete, setTrailingComplete] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const goNext = useCallback(() => {
    if (isSigningUp) return;
    setDirection(1);
    setJustAdvanced(true);
    setWithinStepProgress(0);
    setStepIndex((s) => Math.min(2, s + 1));
  }, [isSigningUp]);

  React.useEffect(() => {
    const runSignup = async () => {
      if (stepIndex !== 2 || !accountData.email || !accountData.password) return;
      setIsSigningUp(true);
      setSignupError('');
      try {
        await apiService.register({
          firstName: accountData.firstName,
          lastName: accountData.lastName,
          email: accountData.email,
          password: accountData.password,
          confirmPassword: accountData.password,
          userName: accountData.email.split('@')[0],
          role: 'respondent',
        });
        setShowVerifyModal(true);
        setTrailingComplete(false);
        requestAnimationFrame(() => setWithinStepProgress(1));
      } catch (error) {
        setSignupError(error instanceof Error ? error.message : 'Signup failed');
        setStepIndex(1);
      } finally {
        setIsSigningUp(false);
      }
    };

    runSignup();
  }, [stepIndex, accountData]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setJustAdvanced(false);
    setWithinStepProgress(0);
    setStepIndex((s) => Math.max(0, s - 1));
  }, []);

  const steps = useMemo(
    () => [
      {
        key: 'step-1',
        node: (
          <SignupStepOne
            onNext={goNext}
            setProgress={(p: number) => setWithinStepProgress(p)}
            email={email}
            setEmail={setEmail}
            firstName={firstName}
            setFirstName={setFirstName}
            onAccountData={setAccountData}
          />
        ),
      },
      {
        key: 'step-2',
        node: (
          <SignupStepTwo
            onNext={goNext}
            onBack={goBack}
            setProgress={(p: number) => setWithinStepProgress(p)}
          />
        ),
      },
      {
        key: 'step-3',
        node: (
          <SignupStepThree
            onBack={goBack}
            firstName={firstName}
            onStart={() => {
              setShowVerifyModal(false);
              setWithinStepProgress(1);
              setTrailingComplete(true);
            }}
          />
        ),
      },
    ],
    [goBack, goNext, email, firstName]
  );

  React.useEffect(() => {
    if (justAdvanced) {
      const id = requestAnimationFrame(() => setJustAdvanced(false));
      return () => cancelAnimationFrame(id);
    }
  }, [justAdvanced]);

  const variants = {
    enter: (dir: Direction) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: Direction) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="flex flex-col md:flex-row relative w-full min-h-screen">
      {/* Left visual side */}
      <div className="hidden md:block w-full md:w-1/2 relative min-h-[200px] md:min-h-screen">
        <Image src="/woodbg.svg" alt="Wooden background" fill className="relative inset-0 z-0 object-cover w-full h-full" priority />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-0">
          <Image src="/onlylogo.svg" alt="SurveyHustler Logo" width={360} height={360} className="object-contain w-60 lg:w-80 h-auto" priority />
          <Image src="/surveyquest_text.svg" alt="SurveyHustler text" width={520} height={140} className="object-contain w-64 lg:w-[28rem] h-auto" priority />
          <Image src="/vector_below.svg" alt="Decorative underline" width={520} height={140} className="object-contain w-64 lg:w-[28rem] h-auto -mt-10 lg:-mt-16" priority />
        </div>
      </div>

      {/* Right form side */}
      <div className="flex-1 bg-[#FCFAF2] flex flex-col relative overflow-y-auto overflow-x-hidden md:overflow-hidden">
        <div className="px-4 md:px-8 pt-2 md:pt-6">
          <div className="w-full max-w-[560px] mx-auto flex items-center justify-between text-[#2E2F3266] text-sm md:text-base">
            <Link href="/" className="text-[#B3935E] hover:text-[#A0824F] font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
              Home
            </Link>
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 py-1 text-[#B3935E]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18" />
                </svg>
                <span>Back</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile logo */}
        <div className="md:hidden px-4 md:px-8 pt-2">
          <div className="w-full max-w-[560px] mx-auto flex justify-center">
            <Image src="/onlylogo.svg" alt="SurveyHustler Logo" width={96} height={96} className="object-contain w-24 h-auto" priority />
          </div>
        </div>

        {/* Stepper */}
        <div className="px-4 md:px-8 pt-4 md:pt-2 flex justify-center">
          <Stepper currentStepIndex={stepIndex} inStepProgress={withinStepProgress} trailingComplete={trailingComplete} showVerifyModal={showVerifyModal} />
        </div>

        {/* Sliding content */}
        <div className="relative flex-1 mt-4 px-4 md:px-8 pb-8 overflow-x-hidden z-0">
          {signupError && (
            <div className="w-full max-w-[560px] mx-auto mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
              {signupError}
            </div>
          )}
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={steps[stepIndex].key}
              className="absolute inset-0"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {steps[stepIndex].node}
            </motion.div>
          </AnimatePresence>
          {showVerifyModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative bg-[#fffaf5] rounded-xl shadow-xl p-6 w-[320px] md:w-[420px] text-center">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
                <div className="text-[#2b2b2b] font-bold text-2xl mb-4">We sent you something</div>
                <div className="flex items-center justify-center mb-4">
                  <Image src="/envelope-icon.svg" alt="Email Sent" width={56} height={56} className="w-14 h-14" />
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  Click the link we sent to{' '}
                  <span className="font-medium">{email}</span> to verify your email.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Login link at bottom */}
        <div className="px-4 md:px-8 pb-6">
          <div className="w-full max-w-[560px] mx-auto text-center text-sm text-[#2E2F32]/60">
            Already have an account?{' '}
            <Link href="/login" className="text-[#B3935E] hover:text-[#A0824F] font-medium">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
