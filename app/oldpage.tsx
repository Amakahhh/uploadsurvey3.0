'use client';
import React from 'react';
import Image from 'next/image';
import { useState } from 'react';
import logoOnly from '@/public/surveylogo.svg';
import bullet from '@/public/green-bullet.svg'
import share from '@/public/share-button.svg'
import email from '@/public/survey-email.svg'
import access from '@/public/change access.svg'
import response1 from '@/public/response1.svg'
import response2 from '@/public/response 2.svg'
import play from '@/public/play-circle.svg'
import Link from 'next/link';

const UploadSurvey = () => {
  const [formLink, setFormLink] = useState('https://docs.google.com/forms/d/1G1zR6AzGCtN2yE3-pzFq9UuXbQzXlVQyQnGx0oRAbRk');

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAF2] text-[#2E2F32] relative font-jost">
      {/* Top dark bar */}
      <div className="absolute top-0 left-0 w-full h-12 bg-[#2E2F32] z-0" />

      {/* Header content (on top of dark bar) */}
      <div className="absolute top-3 right-4 z-10 flex items-center space-x-2">
        <p className="text-sm font-semibold text-white">Aboderin Ayomide</p>
        <div className="w-6 h-6 rounded-full bg-white text-[#2E2F32] flex items-center justify-center text-sm">A</div>
      </div>

      {/* Logo at top center for mobile */}
      <div className="md:hidden absolute top-3 left-16 -translate-x-1/2 z-10">
        <Image src={logoOnly} alt="SurveyQuest Logo" className="w-28 h-auto" />
      </div>

      {/* Logo and text for desktop */}
      <div className="hidden md:flex absolute top-3 left-8 z-10 items-center gap-6 w-96">
        <Image src={logoOnly} alt="SurveyQuest Logo" className="w-40 h-auto" />
      </div>

      <div className="flex justify-center md:justify-start pt-20 md:pt-16 pl-0 md:pl-96 md:pb-0">
        <h1 className="text-black font-semibold sm:text-4xl md:text-4xl whitespace-nowrap font-jost">
          Upload a Survey
        </h1>
      </div>
      {/* Main layout container for larger screens */}
      <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto px-4 md:px-8   gap-8 font-[\'Inter\']">
      {/* Left: Instructions Section */}
      <div className="w-full md:flex-[2] flex flex-col items-center justify-start py-6 pl-[20%]">
        <div className="w-full max-w-xl border-2 border-[#E7DFC6] rounded-xl px-6 py-8 bg-white shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold font-jost">Linking your Google Form</h2>
            <a
              href="https://your-video-url.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-md text-black underline font-jost flex"
            >
              <Image src={play} alt='play circle'/> Watch video
            </a>
          </div>
          <div className='font-jost'>Hey Ayomide! Want to get your survey out there right? For now we only work with Google forms, so this is the step by step process on how to set your survey ready for our platform.</div>
          <div> <div className="flex font-jost"> <Image src={bullet} alt='bullet'/> <p>Open your google form (the one you wish to publish).</p></div>  <div className='flex'><Image src={bullet} alt='bullet'/> <p>Click on the Share button.</p></div>
          </div>
          <Image src={share} alt='share button' />
          <div className="flex font-jost"> <Image src={bullet} alt='bullet'/> <p>Add surveyhustler@gmail.com to your form.</p></div> 
          <Image src={email} alt='survey email' />
          <div className="flex font-jost"> <Image src={bullet} alt='bullet'/> <p>Change the access to Editor and ensure the “Notify people” checkbox is clicked. Click on Done.</p></div> 
          <Image src={access} alt='change access' />




          {/* Additional Settings heading */}
          <h3 className="font-jost text-xl font-medium mt-6 mb-2">Additional Settings</h3>
          <div> <div className="flex font-jost"> <Image src={bullet} alt='bullet'/> <p>Click on Settings of your google form.</p></div>  <div className='flex'><Image src={bullet} alt='bullet'/> <p>Go to the Responses section. ensure “Collect email addresses” is set to Responder input and “Limit to 1 response” is turned on.</p></div>
          </div>
         <Image src={response1} alt='responses section'  className='pb-2'/>
         
         <Image src={response2} alt='responses section' />

          {/* Done section */}
          <h3 className="text-2xl font-medium mt-6 mb-2 font-jost">Done?</h3>
          <p>Done with making the adjustments? Enter the link to your google form below.</p>
          <input
  type="text font-jost"
  value={formLink}
  onChange={(e) => setFormLink(e.target.value)}
  placeholder="Paste your Google Form link here"
  className="w-full border border-[#E7DFC6] rounded-md py-2 px-4 text-xs outline-none focus:border-[#B3935E] focus:ring-0 active:border-[#B3935E] hover:border-[#B3935E]"
/>

          <Link href="/second">
          <button className="font-jost w-full mt-6 bg-[#B3935E] text-white py-2 rounded disabled:opacity-50">
            Next
          </button></Link>

          <div className="font-jost flex justify-between items-center mt-3 text-xs text-[#2E2F32]">
            <span className="font-jost flex items-center">
              <span className="font-jost loader border-t-2 border-[#B3935E] rounded-full w-4 h-4 animate-spin mr-2" />
              Verifying form settings...
            </span>
            <span className="text-[#0A8F5A] font-semibold font-jost">Verified</span>
          </div>
        </div>
      </div>

      {/* Right note section (desktop only) */}
      <div className="hidden md:block w-full md:flex-[1] bg-[#FCFAF2] px-4 py-6 font-jost">
        <p className="text-[#2E2F32] text-sm font-jost">
          <strong>Note!</strong> <br /> If we notice that any of these settings have
          been tampered with after upload, your survey will be automatically
          taken down from the platform with no notice. You will not be entitled
          either to any refund on cost incurred on the survey.
        </p>
      </div>

      {/* Mobile note section */}
      <div className="md:hidden w-full px-4 mt-6 text-sm text-[#2E2F32] font-jost">
        <p>
          <strong>Note!</strong> <br /> If we notice that any of these settings have
          been tampered with after upload, your survey will be automatically
          taken down from the platform with no notice. You will not be entitled
          either to any refund on cost incurred on the survey.
        </p>
      </div>
    </div>
    </div>
  );
};

export default UploadSurvey;
