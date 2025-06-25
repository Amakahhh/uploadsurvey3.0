import React from 'react';

export default function TopNavbar() {
  const name = 'Ayomide';
  const initial = name[0].toUpperCase();

  return (
    <div className="relative w-full bg-[#2E2F32] text-white flex justify-between items-center px-6 py-3">
      <div className="absolute left-20 -translate-x-1/2 top-full -mt-12 z-10">
        <img src="/SurveyHustler Logo.svg" alt="SurveyHustler Logo" className="h-28 rounded-full p-2" />
      </div>
      <div className="w-20" />
      <div className="flex items-center gap-2 ml-auto">
        <div className="w-10 h-10 rounded-full bg-[#B3935E] flex items-center justify-center text-lg">
          {initial}
        </div>
        <span>{`Aboderin ${name}`}</span>
      </div>
    </div>
  );
}