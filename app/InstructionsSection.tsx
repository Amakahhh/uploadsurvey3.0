'use client';
import React from 'react';
import { Dispatch, SetStateAction } from 'react';

const bullets = [
  '/green-bullet.svg',
  '/green-bullet.svg',
  '/green-bullet.svg',
  '/green-bullet.svg',
  '/green-bullet.svg',
  '/green-bullet.svg',
];

interface InstructionsProps {
  setShowVideoAction: Dispatch<SetStateAction<boolean>>;
}

export default function InstructionsSection({ setShowVideoAction }: InstructionsProps) {
  const steps = [
    "Open your Google form.",
    "Link your form to a Google sheet (Create a new spreadsheet)",
    "Share your spreadsheet with surveyhustler@gmail.com.",
    "Grant the email above Editor access to your Google sheet.",
  ];

  const extraSteps = [
    "Click on the Settings tab of your Google form.",
    "Go to the Responses section. ensure \"Collect email addresses\" is set to Responder input and \"Limit to 1 response\" is turned on.",
  ];

  return (
    <div className="bg-white border border-[#B3935E] p-6 rounded-xl text-sm w-full">
      <p className="text-sm mb-4">
        Hey Ayomide! We need you to set up your form first. This will help us track your responses and be able to provide you with valuable functionalities in our bot.
        <button
          className="text-[#B3935E] underline ml-1 font-bold"
          onClick={() => setShowVideoAction(true)}
        >
          Click here
        </button> to watch the tutorial video or follow the step-by-step guide we have outlined for you below.
      </p>

      <div className="mb-6">
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

      <div className="mb-6">
        <p className="font-jost text-xl mb-3">Additional Settings</p>
        <ul className="list-none space-y-2">
          {extraSteps.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-[#2E2F32]">
              <img src={bullets[j]} alt="bullet" className="w-4 h-4 mt-1 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 w-full flex flex-col items-center space-y-3">
          <img
            src="/response1.svg"
            alt="collect email"
            className="w-full max-w-[400px] object-contain"
          />
          <img
            src="/response 2.svg"
            alt="limit response"
            className="w-full max-w-[400px] object-contain"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="font-jost text-lg block mb-2">Done?</label>
        <p className="text-xs mb-3">
          Done with making the adjustments? Copy and paste the link to your Google sheet below.
        </p>
        
        <input
          type="text"
          className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-[#B3935E] focus:outline-none"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          required
        />
      </div>
      
    </div>
  );
}