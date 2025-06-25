// /components/LoginOverlay.tsx
'use client';
import React from 'react';

interface Props {
  setIsLoggedInAction: (val: boolean) => void;
}

export default function LoginOverlay({ setIsLoggedInAction }: Props) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-40 z-20 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg border border-[#B3935E] text-center">
        <p className="mb-2 font-bold">Enter your password to SurveyHunter</p>
        <input type="password" className="border px-2 py-1 w-full mb-2 border-[#B3935E]" />
        <div className="flex justify-between text-sm text-red-500 mb-2">
          <span>❌ Invalid password</span>
          <a href="#" className="text-[#B3935E]">Forgot password</a>
        </div>
        <button
          className="bg-[#B3935E] text-white w-full py-2"
          onClick={() => setIsLoggedInAction(true)}
        >
          Log In
        </button>
      </div>
    </div>
  );
}
