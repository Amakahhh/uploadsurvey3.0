// /components/InstructionsSection.tsx
'use client';
import React from 'react';

const bullets = [
  '/green-bullet.svg',
  '/green-bullet.svg',
  '/green-bullet.svg',
  '/green-bullet.svg',
  '/green-bullet.svg',
  '/green-bullet.svg',
];



// ...other imports

import { Dispatch, SetStateAction } from 'react';

interface InstructionsProps {
  setShowVideoAction: Dispatch<SetStateAction<boolean>>;
}

export default function InstructionsSection({ setShowVideoAction }: InstructionsProps) {
  // component implementation

  const steps = [
    "Open your google form.",
    "Click on the Share button.",
    "Add surveyhustler@gmail.com to your form.",
    "Change the access to Editor and ensure the “Notify people” checkbox is clicked. Click on Done.",
    "Link your form to a Google sheet (Create a new spreadsheet)",
    "In your newly created google sheet, grant Editor access to the same email address as above.",
  ];

  const extraSteps = [
    "Click on the Settings tab of your google form.",
    "Go to the Responses section. ensure “Collect email addresses” is set to Responder input and “Limit to 1 response” is turned on.",
  ];

  return (
    <div className="bg-white border border-[#B3935E] p-6 rounded-xl text-sm w-full ml-0 md:w-[800px] md:ml-[20px] max-w-full">
      <p className="text-sm mb-4">
        Hey Ayomide! We need you to set up your form first.
        <button
          className="text-[#B3935E] underline ml-1"
          onClick={() => setShowVideoAction(true)}
        >
          Click here
        </button> to watch the tutorial video or follow the step-by-step guide below.
      </p>

      <div className="mb-4">
        <p className="font-jost text-2xl">Linking your Google Form</p>
        <ul className="list-none space-y-2 mt-2">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-[#2E2F32]">
              <img src={bullets[i]} alt="bullet" className="w-4 h-4 mt-1" />
              <span>{i === 2 ? <><a href="mailto:surveyhustler@gmail.com" className="text-[#B3935E] font-bold underline">surveyhustler@gmail.com</a></> : step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <p className="font-jost text-2xl">Additional Settings</p>
        <ul className="list-none space-y-2 mt-2">
          {extraSteps.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-[#2E2F32]">
              <img src={bullets[j]} alt="bullet" className="w-4 h-4 mt-1" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2">
          <img src="/response1.svg" alt="collect email" className="w-full max-w-sm ml-10 mb-3" />
          <img src="/response 2.svg" alt="limit response" className="w-full max-w-sm ml-10" />
        </div>
        <div className="mb-4">
            <label className="font-jost text-xl block mb-1">Done?</label>
            <p className="text-xs mb-4">
          Done with making the adjustments? Enter the Edit link to your google form below.
NOTE: The Edit link is the one in your browser’s search bar (top). Also ensure you are in the Questions tab of your form when copying the link. If done right, your copied link should be ending with /edit  </p>

            <input
              type="text"
              className="w-full border rounded-md px-2 py-1 border-black"
              defaultValue="https://docs.google.com/forms/..."
            />
          </div>

      </div>
    </div>
  );
}
