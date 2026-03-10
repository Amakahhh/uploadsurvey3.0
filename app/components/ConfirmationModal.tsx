'use client';
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onProceedAction: () => void;
  onGoBackAction: () => void;
}

export default function ConfirmationModal({
  isOpen,
  isLoading,
  onProceedAction,
  onGoBackAction,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'confirmation-backdrop') {
          onGoBackAction();
        }
      }}
      id="confirmation-backdrop"
    >
      <div className="bg-white border border-[#B3935E] p-8 rounded-lg shadow-lg w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onGoBackAction}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Heading */}
        <h2 className="font-bold text-3xl mb-4 text-[#2E2F32] text-center" style={{fontFamily: 'Jost, sans-serif', fontWeight: 700}}>Notice!</h2>
        
        {/* Description */}
        <p className="text-base text-gray-700 mb-6 leading-relaxed font-semibold text-center" style={{fontFamily: 'Jost, sans-serif', fontWeight: 300}}>
          You won't be able to edit the form after being taken to the invoice. Verify that all details are correct before proceeding.
        </p>

        {/* Buttons Container */}
        <div className="space-y-3">
          <button
            onClick={onProceedAction}
            disabled={isLoading}
            className="w-full px-6 py-2 bg-[#B3935E] text-white rounded-lg hover:bg-[#8B7358] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base"
          >
            {isLoading ? 'Processing...' : 'Proceed to Pay'}
          </button>
          
          <button
            onClick={onGoBackAction}
            disabled={isLoading}
            className="w-full px-6 py-2 bg-white border-2 border-[#B3935E] text-[#B3935E] rounded-lg hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
