'use client';
import React, { useState } from 'react';
import NicheFilters from './NicheFilters';

export default function SurveyInfoForm() {
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    link: '',
    sheet: '',
    minutes: '',
    responses: '',
    cost: ''
  });

  const [showInvoice, setShowInvoice] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const serviceFee = 800;

  const totalCost =
    parseInt(String(formData.responses || '0')) * parseFloat(String(formData.cost || '0')) +
    serviceFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowInvoice(true);
  };

const handlePayment = async () => {
  try {
    const response = await fetch('/api/kora/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: totalCost,
        email: 'test@example.com', // you can add a real email field later
        name: formData.title || 'Survey User'
      }),
    });

    const data = await response.json();
    if (data.checkout_url) {
      window.location.href = data.checkout_url; // redirect user to KoraPay
    } else {
      alert('Unable to create payment link');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
};


  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === 'overlay-backdrop') {
      setShowInvoice(false);
      setShowSuccess(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="w-7/12 bg-white border border-[#B3935E] p-6 rounded-xl text-sm ml-52"
      >
        <h2 className="font-bold text-xl mb-4">
          Survey information{' '}
         
        </h2>

        {/* Title of Survey */}
        <div className="mb-2">
          <label className="block mb-1 text-[#2E2F32]" htmlFor="title">
            Title of Survey:
          </label>
          <div className="relative">
            <input
              id="title"
              type="text"
              maxLength={200}
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border p-2 pr-16 rounded-[5px]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#2E2F32]">
              {formData.title.length}/200
            </span>
          </div>
        </div>

        {/* Brief Description */}
        <div className="mb-2">
          <label className="block mb-1 text-[#2E2F32]" htmlFor="desc">
            Brief description:
          </label>
          <textarea
            id="desc"
            value={formData.desc}
            onChange={handleInputChange}
            className="w-full border p-2 rounded-[5px]"
            maxLength={300}
          />
        </div>

        {/* Responder Link */}
        <div className="mb-2">
          <label className="block mb-1 text-[#2E2F32]" htmlFor="link">
            Responder link (provided by the form)
          </label>
          <input
            id="link"
            type="text"
            value={formData.link}
            onChange={handleInputChange}
            className="w-full border p-2 rounded-[5px]"
          />
        </div>

        {/* Google Sheet Link */}
        <div className="mb-4">
          <label className="block mb-1 text-[#2E2F32]" htmlFor="sheet">
            Google Sheet link (in browser’s search bar)
          </label>
          <input
            id="sheet"
            type="text"
            value={formData.sheet}
            onChange={handleInputChange}
            className="w-full border p-2 rounded-[5px]"
          />
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor="minutes">
              How long will it take in minutes?
            </label>
            <input
              id="minutes"
              type="number"
              value={formData.minutes}
              onChange={handleInputChange}
              className="w-full border p-2 rounded-[5px]"
            />
          </div>
          <div>
            <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor="responses">
              How many responses do you need on this survey?
            </label>
            <input
              id="responses"
              type="number"
              value={formData.responses}
              onChange={handleInputChange}
              className="w-full border p-2 rounded-[5px]"
            />
          </div>
          <div>
            <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor="cost">
              How much are you willing to pay for each response?
            </label>
            <input
              id="cost"
              type="number"
              value={formData.cost}
              onChange={handleInputChange}
              className="w-full border p-2 rounded-[5px]"
            />
          </div>
        </div>
      </form>

      <NicheFilters />

      <div className="w-full flex justify-center">
        <button
          type="submit"
          onClick={handleSubmit}
          className="mt-6 bg-[#B3935E] text-white px-10 py-2 rounded w-full max-w-md"
        >
          Proceed to Pay
        </button>
      </div>

      {/* Invoice Overlay */}
      {showInvoice && (
        <div
          id="overlay-backdrop"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center"
        >
          <div className="bg-white  border-[#B3935E] border-l p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="font-bold text-xl mb-2">Invoice</h2>
            <p className="text-sm mb-2">
              Please verify all the information you provided before proceeding to pay as
              it’s <strong>non-refundable</strong>.
            </p>
            <div className="text-left text-sm my-4 space-y-1">
              <div className="flex justify-between">
                <span>Number of responses:</span>
                <span>{formData.responses}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost per response:</span>
                <span>₦{formData.cost}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee:</span>
                <span>₦{serviceFee}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>Total:</span>
                <span>₦{totalCost.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handlePayment}
              className="bg-[#B3935E]   w-full flex items-center justify-center gap-2 text-white py-2 rounded"
            >
              
              Pay with <img src="/kora.png" alt="Kora" className="w-4 h-4" /> Kora
            </button>
          </div>
        </div>
      )}

      {/* Upload Success Overlay */}
      {showSuccess && (
        <div
          id="overlay-backdrop"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center flex flex-col justify-center items-center">
            <h2 className="font-bold text-xl mb-2">Survey uploaded!</h2>
            <p className="text-sm mb-4">
              Your survey has been uploaded to SurveyHustler successfully! Thanks for choosing us as the launchpad for your survey ❤️❤️❤️
            </p>
            <div className="flex justify-center items-center w-full flex-1">
              <button
                onClick={() =>
                  window.open('https://t.me/suveyhustler_test_bot', '_blank')
                }
                className="bg-[#B3935E] w-3/4 flex items-center justify-center gap-2 text-white py-2 px-4 rounded"
              >
                <img src="/Ellipse 9.svg" alt="Telegram" className="w-10 h-10" />
                Back to Telegram bot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
