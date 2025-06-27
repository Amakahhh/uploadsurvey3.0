'use client';

import { useState } from 'react';
import InstructionsSection from './InstructionsSection';
import LoginOverlay from './loginOverlay';
import VideoModal from './VideoModal';
import SurveyInfoForm from './SurveryInfoForm'; // <-- your actual form

export default function SurveyPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [step, setStep] = useState<'instructions' | 'surveyInfoForm'>('instructions');

  return (
    <div className="min-h-screen bg-[#FCFAF2] font-[Jost] text-[#000] flex flex-col">
      {/* Navbar */}
      <div className="absolute left-20 -translate-x-1/2 top-full -mt-12 z-10">
        <div className="w-20" />
        <div className="flex items-center gap-2 ml-auto"></div>
      </div>

      {/* Login & Modals */}
      {!isLoggedIn && <LoginOverlay setIsLoggedInAction={setIsLoggedIn} />}
      {showVideo && <VideoModal setShowVideoAction={setShowVideo} />}

      {/* Header */}
      <div className="flex flex-col mt-6 px-4 lg:px-0 lg:ml-auto lg:mr-auto lg:max-w-2xl w-full">
        {step === 'instructions' ? (
          <h2 className="font-jost text-3xl font-bold mb-2 mt-10">
            Upload a Survey <span className="font-normal text-sm">(Using a laptop is advised)</span>
          </h2>
        ) : (
          <h2 className="font-jost text-3xl font-bold mb-2 mt-10">
            Survey Information <span className="font-normal text-sm">(Sorry it’s kinda long but we do need all of these)</span>
          </h2>
        )}
      </div>

      {/* Page Content Switch */}
      {/* This container centers the content and handles the desktop/mobile layout switch */}
      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {step === 'instructions' && (
          <>
            {/* --- MODIFICATION START: Wrapped Instructions and Button in a single column container --- */}
            {/* This div acts as the main content column. lg:flex-1 makes it take the remaining space on desktop. */}
            <div className="flex flex-col w-full lg:flex-1">
              <InstructionsSection setShowVideoAction={setShowVideo} />

              {/* The "Next" button is now inside this column */}
              {isLoggedIn && (
                // Added mt-6 for spacing between instructions and the button
                <div className="mt-6">
                  <button
                    // w-full: Full width on mobile (respecting parent padding)
                    // md:w-[515px]: Fixed width on medium screens and up
                    // block mx-auto: Centers the button within this column
                    className="bg-[#B3935E] text-white py-2 px-3 border border-[#B3935E] rounded-[9px] w-full md:w-[515px] block mx-auto"
                    onClick={() => setStep('surveyInfoForm')}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            {/* --- MODIFICATION END --- */}

            {/* Note Sidebar */}
            {/* Added lg:self-start to prevent the sidebar from stretching to the full height of the main column on desktop */}
            <div className="lg:w-1/3 w-full bg-[#FFFCF5] p-4 rounded text-sm lg:self-start">
              <h3 className="font-bold text-lg mb-2">Note!</h3>
              <p>
                If we notice that any of these settings have been tampered with after upload,
                your survey will be taken down with no refund.
              </p>
            </div>
          </>
        )}

        {step === 'surveyInfoForm' && <SurveyInfoForm />}
      </div>

      {/* --- The previous standalone button container has been removed and integrated above --- */}
    </div>
  );
}
