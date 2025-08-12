'use client';

import { useState } from 'react';
import InstructionsSection from './InstructionsSection';
import LoginOverlay from './loginOverlay';
import VideoModal from './VideoModal';
import SurveyInfoForm from './SurveryInfoForm';

export default function SurveyPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [step, setStep] = useState<'instructions' | 'surveyInfoForm'>('instructions');

  return (
    <div className="min-h-screen bg-[#FCFAF2] font-[Jost] text-[#000]">
      {/* Login & Modals */}
      {!isLoggedIn && <LoginOverlay setIsLoggedInAction={setIsLoggedIn} />}
      {showVideo && <VideoModal setShowVideoAction={setShowVideo} />}

      {/* Main Content - Three Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_320px] gap-0 lg:gap-8 pt-10 lg:pt-14">
        {/* Left Column - Fixed 200px for logo spacing */}
        <div className="hidden lg:block"></div>

        {/* Center Column - Fluid content with centered form */}
        <div className="px-4 lg:px-0">
          {step === 'instructions' ? (
            <>
              {/* Title - 36-48px with 40-56px top gap */}
              <div className="mb-8 lg:mb-12 text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-2 text-[#2E2F32]">
                  Upload a Survey <span className="font-normal text-sm">(Using a laptop is advised)</span>
                </h2>
              </div>

              {/* Form Container - Narrower width like original */}
              <div className="max-w-2xl mx-auto">
                <InstructionsSection setShowVideoAction={setShowVideo} />

                {/* Next Button - Original size */}
                {isLoggedIn && (
                  <div className="mt-6 text-center">
                    <button
                      className="bg-[#B3935E] text-white py-2 px-3 border border-[#B3935E] rounded-[9px] w-full md:w-[515px] block mx-auto"
                      onClick={() => setStep('surveyInfoForm')}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <SurveyInfoForm setStep={setStep} />
          )}
        </div>

        {/* Right Column - Fixed 320px Note box */}
        <div className="px-4 lg:px-0 lg:self-start lg:pt-0 pt-8">
          <div className="bg-[#FFFCF5] p-6 rounded-lg w-full lg:w-[320px]">
            <h3 className="font-bold text-lg mb-2">Note!</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              If we notice that any of these settings have been tampered with after upload, your survey will be automatically taken down from the platform with no notice. You will not be entitled to any refund for the cost incurred on the survey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
