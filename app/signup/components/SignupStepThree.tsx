'use client';

import Image from 'next/image';
import React from 'react';
import { Jost, Nothing_You_Could_Do } from 'next/font/google';
import Link from 'next/link';

const jost = Jost({ subsets: ['latin'], weight: ['400', '500', '700'] });
const nothingYouCouldDo = Nothing_You_Could_Do({ subsets: ['latin'], weight: ['400'] });

type Props = { onBack?: () => void; onStart?: () => void; firstName?: string };

export default function SignupStepThree({ onStart, firstName }: Props) {
  return (
    <div className="w-full h-full overflow-y-auto flex justify-center pt-2 pb-20 md:pt-8 md:pb-12">
      <div className="w-full max-w-[560px] px-4 md:px-0">
        <div>
          <h1 className="text-xl md:text-4xl font-extrabold mb-6 text-[#B3935E] text-left">Welcome to SurveyHustler</h1>
          <h2
            className={`${nothingYouCouldDo.className} font-normal leading-none tracking-normal text-left text-[#B3935E] mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[63px]`}
          >
            {firstName || 'Friend'}
          </h2>
        </div>
        <div className="space-y-6">
          <div>
            <div className="text-[#090909] font-bold text-xl md:text-2xl mb-2">As the owner of a Survey,</div>
            <div className="font-extralight text-sm md:text-base text-black">
              You now have access to the biggest platform of survey respondents in CU at your reach. Those surveys will be filled in no time!
            </div>
          </div>
          <div>
            <div className="text-[#090909] font-bold text-xl md:text-2xl mb-2">As a Survey respondent,</div>
            <div className="font-extralight text-sm md:text-base text-black">
              Get paid to answer other&apos;s survey at the price they set. Don&apos;t worry, we have done it in such a way you can&apos;t get paid below ₦75 per survey!
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/marketplace"
            onClick={onStart}
            className={`${jost.className} bg-[#B3935E] text-white flex items-center justify-center gap-4 py-3.5 px-6 rounded-xl w-full sm:flex-1 hover:bg-[#9B7D4E] transition-colors`}
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full overflow-hidden">
              <Image src="/woodbg.svg" alt="Circle Background" fill className="object-cover" />
              <Image src="/onlylogo.svg" alt="Logo" width={28} height={28} className="relative z-10 w-8 h-8 object-contain" />
            </div>
            <span className="text-lg font-medium">Go to Marketplace</span>
          </Link>
          <Link
            href="/researcher"
            className={`${jost.className} border-2 border-[#B3935E] text-[#B3935E] flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl w-full sm:flex-1 hover:bg-[#B3935E]/5 transition-colors`}
          >
            <span className="text-lg font-medium">Upload a Survey</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
