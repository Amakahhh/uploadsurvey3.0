'use client';

import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';

interface InstructionsSectionProps {
  setShowVideoAction: (show: boolean) => void;
  setStepAction: (step: 'instructions' | 'surveyInfoForm') => void;
}

const InstructionsSection: React.FC<InstructionsSectionProps> = ({ 
  setShowVideoAction, 
  setStepAction 
}) => {
  const { user } = useAuth();
  const firstName = user?.firstName || 'there';
  
  const [googleSheetLink, setGoogleSheetLink] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessages, setVerificationMessages] = useState<Array<{success: boolean, message: string}>>([]);

  const steps = [
    'Create a Google Sheet with columns for the data you want to collect.',
    'Make your Google Sheet publicly viewable by clicking "Share" and setting it to "Anyone with the link can view".',
    'Share your spreadsheet with surveyhustler@gmail.com.',
    'Copy the link to your Google Sheet and paste it below.'
  ];

  const extraSteps = [
    'Ensure your form responses are automatically saved to this sheet.',
    'The first row should contain your column headers.',
    'Test your setup by submitting a test response.'
  ];

  const bullets = [
    '/green-bullet.svg',
    '/green-bullet.svg', 
    '/green-bullet.svg',
    '/green-bullet.svg'
  ];

  const handleVerifyForm = async () => {
    if (!googleSheetLink.trim()) {
      setVerificationMessages([
        { success: false, message: "Please enter your Google Sheet link" }
      ]);
      return;
    }

    // Basic URL validation
    const urlMatch = googleSheetLink.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!urlMatch) {
      setVerificationMessages([
        { success: false, message: "Invalid Google Sheet URL format. Please ensure it contains '/spreadsheets/d/'" }
      ]);
      return;
    }

    const spreadsheetId = urlMatch[1];

    try {
      setIsVerifying(true);
      setVerificationMessages([]);

      // Client-side validation of Google Sheets URL format
      const isValidGoogleSheetUrl = googleSheetLink.includes('docs.google.com/spreadsheets') && 
                                   googleSheetLink.includes('/edit') && 
                                   spreadsheetId.length > 10;

      // Simulate verification process for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isValidGoogleSheetUrl) {
        setVerificationMessages([
          { success: true, message: "Yay! Google Sheet URL verified successfully." }
        ]);
        
        // Navigate to next step after successful verification
        setTimeout(() => {
          setStepAction('surveyInfoForm');
        }, 2000);
      } else {
        setVerificationMessages([
          { 
            success: false, 
            message: "Please ensure your Google Sheet URL is correct. It should contain 'docs.google.com/spreadsheets' and '/edit'." 
          }
        ]);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationMessages([
        { success: false, message: "Verification failed. Please check your internet connection and try again." }
      ]);
    } finally {
      setIsVerifying(false);
      
      // Auto-hide verification messages after 5 seconds
      setTimeout(() => {
        setVerificationMessages([]);
      }, 5000);
    }
  };

  return (
    <>
      <div className="bg-white border border-[#B3935E] p-6 rounded-xl text-sm w-full">
        <p className="text-sm mb-4">
          Hey {firstName}! We need you to set up your form first. This will help us track your responses and be able to provide you with valuable functionalities in our bot.
          <button
            className="text-[#B3935E] underline ml-1 font-bold"
            onClick={() => setShowVideoAction(true)}
          >
            Click here
          </button> to watch the tutorial video or follow the step-by-step guide we have outlined for you below.
        </p>

        <div className="mb-4">
          <p className="font-jost text-xl mb-3">Linking your responses</p>
          <ul className="list-none space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-[#2E2F32]">
                <img src={bullets[i]} alt="bullet" className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>
                  {i === 2 ? (
                    <>
                      Share your spreadsheet with{' '}
                      <a href="mailto:surveyhustler@gmail.com" className="text-[#B3935E] font-bold underline">
                        surveyhustler@gmail.com
                      </a>
                      .
                    </>
                  ) : (
                    step
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <p className="font-jost text-xl mb-3">Additional Settings</p>
          <ul className="list-none space-y-2">
            {extraSteps.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-[#2E2F32]">
                <img src={bullets[j]} alt="bullet" className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="googleSheetLink" className="block text-sm font-medium text-gray-700 mb-2">
              Paste your Google Sheet link here:
            </label>
            <input
              id="googleSheetLink"
              type="url"
              value={googleSheetLink}
              onChange={(e) => setGoogleSheetLink(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit#gid=0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B3935E] focus:border-transparent"
              disabled={isVerifying}
            />
          </div>

          <button
            onClick={handleVerifyForm}
            disabled={isVerifying || !googleSheetLink.trim()}
            className="w-full bg-[#B3935E] text-white py-3 px-4 rounded-md font-medium hover:bg-[#A0824F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Google Sheet'
            )}
          </button>

          {/* Verification Messages */}
          {verificationMessages.length > 0 && (
            <div className="space-y-2">
              {verificationMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md text-sm ${
                    msg.success
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      {msg.success ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      )}
                    </svg>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InstructionsSection;