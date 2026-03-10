'use client';
import React from 'react';
import { CreateSurveyResponse } from '../services/api';

interface InvoiceModalProps {
  survey: CreateSurveyResponse | null;
  isOpen: boolean;
  isLoading: boolean;
  error?: string | null;
  serviceFee: number;
  onProceedToPaymentAction: () => void;
  onCancelAction: () => void;
}

export default function InvoiceModal({
  survey,
  isOpen,
  isLoading,
  error,
  serviceFee,
  onProceedToPaymentAction,
  onCancelAction,
}: InvoiceModalProps) {
  if (!isOpen || !survey) return null;

  // Calculate costs from the survey response
  // Use backend-provided values if available, otherwise calculate locally
  const costPerResponse = survey.chargePerResponse || 0;
  const numberOfResponses = survey.maxResponseNo || 0;
  const respondentsCharge = survey.respondentsCharge ?? (costPerResponse * numberOfResponses);
  const platformCommission = survey.platformCommission ?? serviceFee;
  const conditionsCharge = survey.conditionsCharge ?? 0;
  const subtotal = respondentsCharge;
  const totalAmount = survey.totalAmount ?? (respondentsCharge + platformCommission + conditionsCharge);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'invoice-backdrop') {
          onCancelAction();
        }
      }}
      id="invoice-backdrop"
    >
      <div className="bg-white border border-[#B3935E] p-6 rounded-lg shadow-lg w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onCancelAction}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-bold text-2xl mb-4 text-[#2E2F32]" style={{fontFamily: 'Jost, sans-serif', fontWeight: 700}}>Invoice</h2>
        
        <p className="text-sm text-gray-700 mb-6 leading-relaxed text-center" style={{fontFamily: 'Jost, sans-serif'}}>
          Please verify all the information you provided before proceeding to pay as it's{' '}
          <strong>non-refundable</strong>.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Invoice Details - Simplified */}
        <div className="mb-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Number of responses:</span>
            <span className="font-semibold text-gray-900">{numberOfResponses}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Cost per response:</span>
            <span className="font-semibold text-gray-900">₦{costPerResponse.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Service fee:</span>
            <span className="font-semibold text-gray-900">₦{platformCommission.toLocaleString()}</span>
          </div>
          
          <div className="border-t border-gray-300 pt-3 flex justify-between">
            <span className="font-bold text-[#2E2F32]">Total:</span>
            <span className="font-bold text-lg text-[#2E2F32]">₦{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onProceedToPaymentAction}
            disabled={isLoading}
            className="w-full bg-[#B3935E] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#8B7358] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{fontFamily: 'Jost, sans-serif'}}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                Pay with 
              </>
            )}
          </button>
          <button
            onClick={onCancelAction}
            disabled={isLoading}
            className="w-full bg-white border-2 border-[#B3935E] text-[#B3935E] py-2 px-4 rounded-lg font-medium hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{fontFamily: 'Jost, sans-serif'}}
          >
            Save and exit
          </button>
        </div>
      </div>
    </div>
  );
}
