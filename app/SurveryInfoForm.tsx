'use client';
import React, { useState } from 'react';
import NicheFilters, { NicheFilter } from './NicheFilters';
import { apiService, CreateSurveyRequest, FormVerificationRequest, CreateSurveyResponse, SurveyCondition } from './services/api';
import { useAuth } from './contexts/AuthContext';
import EnhancedSuccessModal from './components/EnhancedSuccessModal';
import ConfirmationModal from './components/ConfirmationModal';
import { logApiRequest, logApiError, createMockSurveyId } from './utils/developmentMode';
import { parseApiError, formatErrorForDisplay } from './utils/apiErrorParser';
import { safeLocalStorage } from './utils/storageUtils';

export default function SurveyInfoForm({ 
  setStepAction, 
  onSurveyCreatedAction 
}: { 
  setStepAction: (step: 'instructions' | 'surveyInfoForm') => void;
  onSurveyCreatedAction?: (survey: CreateSurveyResponse) => void;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    link: '',
    sheet: '',
    minutes: '',
    responses: '',
    cost: ''
  });

  const [nicheFilters, setNicheFilters] = useState<NicheFilter[]>([{}]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formVerified, setFormVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletPin, setWalletPin] = useState('');
  const [userWallet, setUserWallet] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [createdSurvey, setCreatedSurvey] = useState<CreateSurveyResponse | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [sheetShareConfirmed, setSheetShareConfirmed] = useState(false);
  const [sheetSourceConfirmed, setSheetSourceConfirmed] = useState(false);
  
  // Wallet creation states
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [newWalletPin, setNewWalletPin] = useState('');
  const [confirmWalletPin, setConfirmWalletPin] = useState('');
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  const platformFeeRate = 0.05;
  const baseCost = parseInt(String(formData.responses || '0')) * parseFloat(String(formData.cost || '0'));
  const serviceFee = baseCost * platformFeeRate;
  const totalCost = baseCost + serviceFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(null);
    if (id === 'sheet') {
      setSheetShareConfirmed(false);
      setSheetSourceConfirmed(false);
    }
    // Reset form verification when form data changes
    if (formVerified) {
      setFormVerified(false);
    }
  };

  const verifyForm = async () => {
    if (!formData.link) {
      setError('Please provide the responder link');
      return;
    }

    setVerificationLoading(true);
    setError(null);

    try {
      const request: FormVerificationRequest = {
        surveyId: `temp-survey-${Date.now()}`
      };
      
      const result = await apiService.verifyForm(request);
      setFormVerified(result.isAvailable);
      
      if (!result.isAvailable) {
        setError(result.message || 'Form verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Form verification failed');
      setFormVerified(false);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.title || !formData.desc || !formData.link || 
        !formData.minutes || !formData.responses || !formData.cost) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a survey');
      return;
    }

    if (!sheetShareConfirmed || !sheetSourceConfirmed) {
      setError('Please confirm your Google Sheet sharing and source before proceeding.');
      return;
    }

    // Show confirmation modal instead of directly showing invoice
    setShowConfirmation(true);
  };

  const handleConfirmationProceed = async () => {
    // This is where createSurvey gets called after user confirms
    setShowConfirmation(false);
    await createSurvey();
  };

  const handleConfirmationGoBack = () => {
    setShowConfirmation(false);
  };


  const createWallet = async () => {
    if (!user) return;
    
    if (newWalletPin !== confirmWalletPin) {
      setError('Wallet PINs do not match. Please try again.');
      return;
    }
    
    if (newWalletPin.length !== 4) {
      setError('Wallet PIN must be exactly 4 digits.');
      return;
    }

    try {
      setIsCreatingWallet(true);
      setError(null);
      
      const newWallet = await apiService.createWallet({
        userId: user.id,
        pin: newWalletPin,
        cPin: confirmWalletPin
      });
      
      setUserWallet(newWallet);
      setWalletBalance(0); // New wallet starts with 0 balance
      setShowCreateWalletModal(false);
      setNewWalletPin('');
      setConfirmWalletPin('');
      
      // Show success message and guide user to fund wallet
      setError(`Wallet created successfully! You need to fund your wallet with ₦${totalCost.toLocaleString()} to complete the payment.`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
      console.error('Wallet creation error:', err);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const createSurvey = async () => {
    console.log('[INFO] Survey creation started');
    
    if (!user) {
      setError('You must be logged in to create a survey. Please log in first.');
      return;
    }

    // Validate form data
    if (!formData.title?.trim()) {
      setError('Survey title is required');
      return;
    }
    if (!formData.desc?.trim()) {
      setError('Survey description is required');
      return;
    }
    if (!formData.link?.trim()) {
      setError('Google Form link is required');
      return;
    }
    if (!formData.sheet?.trim()) {
      setError('Google Sheet link is required');
      return;
    }
    if (!sheetShareConfirmed || !sheetSourceConfirmed) {
      setError('Please confirm your Google Sheet sharing and source before proceeding.');
      return;
    }
    if (!formData.responses || parseInt(formData.responses) <= 0) {
      setError('Valid number of responses is required');
      return;
    }
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      setError('Valid cost per response is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const primaryFilter = nicheFilters.find((filter) =>
        filter.schoolId || filter.collegeId || filter.departmentId || filter.courseId || filter.gender || filter.personType
      );
      const targetColleges = primaryFilter?.collegeId ? [primaryFilter.collegeId] : [];
      const targetDepartments = primaryFilter?.departmentId ? [primaryFilter.departmentId] : [];

      // Create survey with new API
      const surveyData = {
        title: formData.title.trim(),
        description: formData.desc.trim(),
        googleFormUrl: formData.link.trim(),
        googleSheetUrl: formData.sheet.trim(),
        reward_per_response: parseFloat(formData.cost),
        estimated_time: parseInt(formData.minutes) || 5,
        category: 'General',
        max_responses: parseInt(formData.responses),
        target_colleges: targetColleges,
        target_departments: targetDepartments,
        target_levels: [],
      };

      const response = await apiService.createSurvey(surveyData);
      
      setCreatedSurvey(response);
      
      onSurveyCreatedAction?.(response);
      
      // Proceed to payment
      alert(`Survey created! Total cost: N${totalCost.toLocaleString()}\n\nClick "Proceed to Pay" to continue.`);
      setShowInvoice(false);
      setShowPaymentOptions(true);
    } catch (err: any) {
      console.error('Survey creation failed:', err);
      setError(err.message || 'Failed to create survey');
    } finally {
      setIsLoading(false);
    }
  };

  const payWithCheckout = async () => {
    if (!createdSurvey) {
      setError('Survey not available for payment.');
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(safeLocalStorage.getItem('jwtToken')
            ? { Authorization: `Bearer ${safeLocalStorage.getItem('jwtToken')}` }
            : {}),
        },
        body: JSON.stringify({ surveyId: createdSurvey.id }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || 'Unable to initialize checkout');
      }
      const checkoutUrl = payload?.data?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error('No checkout URL returned by backend');
      }
      window.open(checkoutUrl, '_blank');
      setShowPaymentOptions(false);
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const payWithWalletFlow = async () => {
    if (!user || !createdSurvey) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // First, try to get user's wallet
      const walletId = user.id;
      
      try {
        const wallet = await apiService.getWallet(walletId);
        setUserWallet(wallet);
        
        const balanceResponse = await apiService.getWalletBalance(walletId);
        setWalletBalance(balanceResponse.balance);
        
        if (balanceResponse.balance >= totalCost) {
          setShowPaymentOptions(false);
          setShowWalletModal(true);
        } else {
          setError(`Insufficient wallet balance. You have ₦${balanceResponse.balance.toLocaleString()}, but need ₦${totalCost.toLocaleString()}. Please fund your wallet first.`);
        }
      } catch (walletError) {
        // Wallet doesn't exist (404 error), offer to create one
        setShowPaymentOptions(false);
        setShowCreateWalletModal(true);
        console.log('Wallet not found, offering to create one:', walletError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check wallet balance');
      console.error('Wallet balance check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const processWalletPayment = async () => {
    if (!user || !createdSurvey || !userWallet) {
      setError('Missing required information for payment');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use the new wallet payment endpoint
      const paymentResult = await apiService.payWithWallet({
        walletId: userWallet.id,
        surveyId: createdSurvey.id,
        totalAmount: totalCost
      });

      if (paymentResult.success) {
        setShowWalletModal(false);
        setShowSuccess(true);
      } else {
        setError(paymentResult.message || 'Payment failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      console.error('Wallet payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === 'overlay-backdrop') {
      setShowInvoice(false);
      setShowSuccess(false);
      setShowPaymentOptions(false);
    }
  };

  return (
    <div className="w-full px-4">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => setStepAction('instructions')}
        className="flex items-center text-[#B3935E] font-medium mb-4 hover:underline focus:outline-none"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <form
        onSubmit={handleSubmit}
        // Changed: removed w-7/12 and ml-52. 
        // Added w-full, max-w-3xl (to match NicheFilters), and mx-auto (for centering).
        className="bg-white border border-[#B3935E] p-6 rounded-xl text-sm w-full max-w-3xl mx-auto"
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
              maxLength={100}
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
        {/* Brief Description */}
<div className="mb-2">
  <label className="block mb-1 text-[#2E2F32]" htmlFor="desc">
    Brief description:
  </label>
  {/* Add a relative wrapper around the textarea */}
  <div className="relative"> 
    <textarea
      id="desc"
      value={formData.desc}
      onChange={handleInputChange}
      // Add `pr-16` for right padding (matches title input)
      className="w-full border p-2 pr-16 rounded-[5px]"
      maxLength={300}
    />
    {/* Absolute counter inside the relative wrapper */}
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#2E2F32]">
      {formData.desc.length}/300 {/* Use `desc` length (not `title` length) */}
    </span>
  </div>
</div>

        {/* Responder Link */}
        <div className="mb-4">
          <label className="block mb-1 text-[#2E2F32]" htmlFor="link">
            Responder link (provided by the form)
          </label>
          <input
            id="link"
            type="text"
            value={formData.link}
            onChange={handleInputChange}
            className="w-full border p-2 rounded-[5px]"
            placeholder="https://forms.gle/..."
          />
        </div>

        {/* Response Sheet Link */}
        <div className="mb-4">
          <label className="block mb-1 text-[#2E2F32]" htmlFor="sheet">
            Response sheet link (Google Sheets for responses)
          </label>
          <input
            id="sheet"
            type="text"
            value={formData.sheet}
            onChange={handleInputChange}
            className="w-full border p-2 rounded-[5px]"
            placeholder="https://docs.google.com/spreadsheets/..."
          />
          <div className="mt-2 text-xs text-[#2E2F32]/70 space-y-1">
            <div>Required: Set sharing to "Anyone with the link" and "Viewer".</div>
            <div>Use the Form Responses sheet linked to your Google Form.</div>
            <div>Tip: Only Google Sheets links work (not the Google Form link).</div>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={sheetShareConfirmed}
                onChange={(e) => setSheetShareConfirmed(e.target.checked)}
                className="mt-0.5"
              />
              <span>I have set sharing to "Anyone with the link" (Viewer).</span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={sheetSourceConfirmed}
                onChange={(e) => setSheetSourceConfirmed(e.target.checked)}
                className="mt-0.5"
              />
              <span>This sheet is the Form Responses sheet for my survey.</span>
            </label>
          </div>
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 max-w-3xl mx-auto flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          <div className="flex-1">
            <p className="font-semibold">Error</p>
            <div className="text-sm mt-2 space-y-2 whitespace-pre-wrap">
              {error.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NicheFilters is already responsive and centered from your previous request */}
      <NicheFilters onFiltersChange={setNicheFilters} />

      <div className="w-full flex justify-center mb-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || verificationLoading}
          className="mt-6 bg-[#B3935E] text-white px-10 py-2 rounded-lg w-[60%] max-w-lg mx-auto hover:bg-[#8B7358] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Survey...' : 'Proceed to Pay'}
        </button>
      </div>

      {/* Invoice Overlay */}
      {showInvoice && (
        <div
          id="overlay-backdrop"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4"
        >
          <div className="bg-white  border-[#B3935E] border-l p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
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
              onClick={createSurvey}
              disabled={isLoading}
              className="bg-[#B3935E] w-full flex items-center justify-center gap-2 text-white py-2 rounded hover:bg-[#8B7358] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Survey...' : 'Create Survey'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Options Modal */}
      {showPaymentOptions && (
        <div
          id="overlay-backdrop"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === 'overlay-backdrop') {
              setShowPaymentOptions(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4"
        >
          <div className="bg-white border border-[#B3935E] p-6 rounded-lg shadow-lg w-full max-w-md text-center">
            <h2 className="font-bold text-xl mb-4">Choose Payment Method</h2>
            <p className="text-sm mb-6 text-gray-600">
              Survey created successfully! Choose your preferred payment method:
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={payWithCheckout}
                className="w-full bg-[#B3935E] text-white py-3 px-4 rounded-lg hover:bg-[#8B7358] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Pay with Checkout Link
              </button>
              
              <button
                onClick={payWithWalletFlow}
                disabled={isLoading}
                className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay with Wallet {walletBalance > 0 && `(₦${walletBalance.toLocaleString()})`}
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Total Amount: ₦{totalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Success Modal */}
      {showSuccess && createdSurvey && (
        <EnhancedSuccessModal
          survey={createdSurvey}
          show={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* Old success modal - keeping as fallback */}
      {showSuccess && !createdSurvey && (
        <div
          id="overlay-backdrop"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center flex flex-col justify-center items-center">
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

      {/* Wallet PIN Modal */}
      {showWalletModal && (
        <div
          id="overlay-backdrop"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === 'overlay-backdrop') {
              setShowWalletModal(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4"
        >
          <div className="bg-white border border-[#B3935E] p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="font-bold text-xl mb-4">Enter Wallet PIN</h2>
            <p className="text-sm mb-4">
              Please enter your wallet PIN to complete the payment of ₦{totalCost.toLocaleString()}
            </p>
            <p className="text-sm mb-4 text-gray-600">
              Wallet Balance: ₦{walletBalance.toLocaleString()}
            </p>
            
            <div className="mb-4">
              <input
                type="password"
                value={walletPin}
                onChange={(e) => setWalletPin(e.target.value)}
                placeholder="Enter your 4-digit PIN"
                maxLength={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#B3935E] focus:outline-none text-center text-lg tracking-widest"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowWalletModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={processWalletPayment}
                disabled={walletPin.length !== 4 || isLoading}
                className="flex-1 px-4 py-2 bg-[#B3935E] text-white rounded hover:bg-[#8B7358] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreateWalletModal && (
        <div
          id="overlay-backdrop"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === 'overlay-backdrop') {
              setShowCreateWalletModal(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4"
        >
          <div className="bg-white border border-[#B3935E] p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="font-bold text-xl mb-4">Create Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              You need a wallet to make payments. Create one now with a 4-digit PIN.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Create 4-digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newWalletPin}
                  onChange={(e) => setNewWalletPin(e.target.value.replace(/\D/g, ''))}
                  className="border border-gray-300 px-3 py-2 w-full rounded-md focus:border-[#B3935E] focus:outline-none text-center text-lg tracking-widest"
                  placeholder="0000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmWalletPin}
                  onChange={(e) => setConfirmWalletPin(e.target.value.replace(/\D/g, ''))}
                  className="border border-gray-300 px-3 py-2 w-full rounded-md focus:border-[#B3935E] focus:outline-none text-center text-lg tracking-widest"
                  placeholder="0000"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateWalletModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createWallet}
                disabled={newWalletPin.length !== 4 || confirmWalletPin.length !== 4 || isCreatingWallet}
                className="flex-1 px-4 py-2 bg-[#B3935E] text-white rounded-md hover:bg-[#A0824F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingWallet ? 'Creating...' : 'Create Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        isLoading={isLoading}
        onProceedAction={handleConfirmationProceed}
        onGoBackAction={handleConfirmationGoBack}
      />
    </div>
  );
}
