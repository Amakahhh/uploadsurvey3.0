'use client';
import React, { useState, useEffect } from 'react';
// Update the import path below to the correct location of your Navbar component
import Navbar from '../navbar'; // Example: if Navbar is in the parent 'app' directory
import Image from 'next/image';
import Selectpage from '../select'; 
import College from '../collegeoptions';
import Link from 'next/link';
import form from '@/public/form preview.svg'

const SurveySpecification = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [responses, setResponses] = useState('');
  const [price, setPrice] = useState('');
  const [institution] = useState('Covenant University');
  const [role] = useState('Student');
  const [showSummary, setShowSummary] = useState(false);


  useEffect(() => {
    // Function to inject the scrollbar styles
    const injectScrollbarStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: rgb(223, 220, 220);
          margin-top: 15px;
          margin-bottom: 15px;
          border-radius: 20px;
        }
        ::-webkit-scrollbar-thumb {
          background: #B3935E;
          border-radius: 20px;
          border: 0px solid transparent;
          background-clip: padding-box;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: darkkhaki;
        }
        .rounded-container {
          overflow: hidden;
          border-radius: 1rem;
        }
      `;
      document.head.appendChild(style);

      // Cleanup function to remove the styles when the component unmounts
      return () => {
        document.head.removeChild(style);
      };
    };

    // Inject the styles when the component mounts
    const removeStyles = injectScrollbarStyles();

    // Clean up when the component unmounts
    return () => {
      removeStyles();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAF2] text-[#2E2F32] relative font-jost scrollbar-hide ">
      <Navbar /> 

      <div className='flex  gap-48 justify-center md:justify-start pt-32 md:pt-16 pl-0 md:pl-48 md:pb-0'>         
      <h2 className='pl-4'> <span className="font-semibold text-lg  text-black md:text-sm ">Niche specification: </span>Specify who exactly you want answering your surveys</h2>
      <Link href="/second">
                <button className="font-jost w-full ml-5  bg-[#B3935E] text-white py-2 rounded disabled:opacity-50 hidden md:block hover:bg-[#A67B4C] outline-none" onClick={() => setShowSummary(true)}>
                Next
                </button>
            </Link>

      </div>    

      <div className="min-h-screen flex flex-col md:flex-row gap-6 pt-0 md:pt-10 px-4 md:px-16 mt-0">
        
        {/* Survey Details */}
        <div className="w-full md:w-1/3 bg-white shadow-md rounded-xl border border-[#E7DFC6] p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#B3935E] scrollbar-track-transparent scrollbar-thumb-rounded-full">
          <h2 className="font-normal text-lg mb-4">Survey details:</h2>

          <label className="block mb-1 font-normal">Title of Survey:</label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              maxLength={200}
              className="w-full border mb-4 border-[#E7DFC6] rounded-md py-2 px-4 text-sm pr-16 outline-none focus:border-[#B3935E] focus:ring-0 active:border-[#B3935E] hover:border-[#B3935E]"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              {title.length}/200
            </span>
          </div>

          <label className="block mb-1 font-normal">Brief description:</label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 300))}
              maxLength={300}
              className="w-full border mb-4 border-[#E7DFC6] rounded-md py-2 px-4 text-sm outline-none focus:border-[#B3935E] focus:ring-0 active:border-[#B3935E] hover:border-[#B3935E]"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              {description.length}/300
            </span>
          </div>

          <label className="block mb-1 font-normal">How long will it take in minutes?</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border mb-4 border-[#E7DFC6] rounded-md py-2 px-4 text-sm"
          />

          <label className="block mb-1 font-normal">How many responses do you need on this survey?</label>
          <input
            type="number"
            value={responses}
            onChange={(e) => setResponses(e.target.value)}
            className="w-full border mb-4 border-[#E7DFC6] rounded-md py-2 px-4 text-sm"
          />

          <label className="block mb-1 font-normal">How much are you willing to pay for each response?</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-[#E7DFC6] rounded-md py-2 px-4 text-sm"
          />
        </div>

        {/* Niche specification */}
          {/* You can add niche specification content here */}
            <Selectpage />
          

        {/* Options sidebar */}
        
        <College />

        </div>
        <Link href="/second">
              <button className="font-jost ml-11 mt-5 bg-[#B3935E] text-white py-2 rounded disabled:opacity-50 md:hidden sm:block hover:bg-[#A67B4C] transition-colors duration-300 w-80 h-auto " onClick={() => setShowSummary(true)}>
                Next
              </button>
            </Link>
      {showSummary && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-[#FCFAF2] rounded-xl p-6 shadow-lg w-[90%] max-w-md relative">
      <button
        onClick={() => setShowSummary(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
      >
        &times;
      </button>

      {/* Example Image Preview (Optional) */}<div className='flex gap-3'>
        <div></div>
      <div className="mb-4 rounded-lg overflow-hidden">
        <Image src={form} alt="Form Preview" width={300} height={180} />

         <div className="text-sm space-y-2">
        <h2 className="text-lg font-semibold">{title || 'Survey Title'}</h2>
        <p className="text-gray-700">{description || 'No description provided'}</p>
        <p>🕒 {duration || '0'} mins</p>
        <p>👥 {responses || '0'} responses</p></div>
      </div>

     

        <div className=" border border-[#B3935E] bg-white rounded-md p-4 text-sm ">
          <p><strong>Institution:</strong> {institution}</p>
          <p><strong>Gender:</strong> Male, Female</p>
          <p><strong>Role:</strong> {role}</p>
          <p><strong>College:</strong> CST, COE</p>
        </div>

        
      </div>
      <div className="pt-4 text-sm shadow-md justify-center pl-32">
          <p>Number of responses: {responses || '0'}</p>
          <p>Cost per response: ₦{price || '0.00'}</p>
          <p>Service fee: ₦800.00</p>
          <p className="font-semibold text-lg">Total: ₦{(parseInt(responses) * parseInt(price) + 800) || '0.00'}</p>
        </div>

      <button
        className="mt-6 w-full bg-[#B3935E] text-white py-2 rounded hover:bg-[#A67B4C]"
        onClick={() => {
          setShowSummary(false);
          // Navigate to next page if needed
          window.location.href = '/second'; // Or use router.push('/second') if using Next.js router
        }}
      >
        Proceed to Pay
      </button>
    </div>
  </div>
)}

      </div>
    
  );
};

export default SurveySpecification;