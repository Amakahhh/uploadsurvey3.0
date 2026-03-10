'use client';
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function WalletManager() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    if (user) {
      loadWallet();
    }
  }, [user]);

  const loadWallet = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const walletId = user.id; // Adjust this based on your API structure
      
      try {
        const walletData = await apiService.getWallet(walletId);
        setWallet(walletData);
        
        const balanceData = await apiService.getWalletBalance(walletId);
        setBalance(balanceData.balance);
      } catch (walletError) {
        // Wallet doesn't exist
        setWallet(null);
        setBalance(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    if (!user) return;

    if (newPin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    try {
      setLoading(true);
      await apiService.createWallet({ 
        userId: user.id, 
        pin: newPin, 
        cPin: confirmPin 
      });
      setSuccess('Wallet created successfully!');
      setShowCreateModal(false);
      setNewPin('');
      setConfirmPin('');
      loadWallet(); // Reload wallet data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const fundWallet = async () => {
    if (!wallet || !fundAmount) return;

    const amount = parseFloat(fundAmount);
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      await apiService.fundWallet(wallet.id, { 
        walletId: wallet.id, 
        amount, 
        message: `Wallet funding - ₦${amount}` 
      });
      setSuccess(`Wallet funded with ₦${amount.toLocaleString()}`);
      setShowFundModal(false);
      setFundAmount('');
      loadWallet(); // Reload wallet data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fund wallet');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white border border-[#B3935E] p-6 rounded-xl">
        <p className="text-center text-gray-600">Please log in to manage your wallet</p>
      </div>
    );
  }

  if (loading && !wallet) {
    return (
      <div className="bg-white border border-[#B3935E] p-6 rounded-xl">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#B3935E] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Loading wallet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#B3935E] p-6 rounded-xl">
      <h3 className="text-xl font-bold mb-4">Wallet Management</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span>{success}</span>
        </div>
      )}

      {!wallet ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">You don't have a wallet yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#B3935E] text-white px-6 py-2 rounded hover:bg-[#8B7358]"
          >
            Create Wallet
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-lg">Wallet Balance</h4>
            <p className="text-2xl font-bold text-[#B3935E]">₦{balance.toLocaleString()}</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowFundModal(true)}
              className="flex-1 bg-[#B3935E] text-white py-2 rounded hover:bg-[#8B7358]"
            >
              Fund Wallet
            </button>
            <button
              onClick={loadWallet}
              disabled={loading}
              className="flex-1 border border-[#B3935E] text-[#B3935E] py-2 rounded hover:bg-[#B3935E] hover:text-white"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
          <div className="bg-white border border-[#B3935E] p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="font-bold text-xl mb-4">Create Wallet</h3>
            <p className="text-sm mb-4">Set up a 4-digit PIN for your wallet</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">PIN</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#B3935E] focus:outline-none text-center text-lg tracking-widest"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Confirm PIN</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm 4-digit PIN"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#B3935E] focus:outline-none text-center text-lg tracking-widest"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createWallet}
                disabled={loading || newPin.length !== 4 || confirmPin.length !== 4}
                className="flex-1 px-4 py-2 bg-[#B3935E] text-white rounded hover:bg-[#8B7358] disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
          <div className="bg-white border border-[#B3935E] p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="font-bold text-xl mb-4">Fund Wallet</h3>
            <p className="text-sm mb-4">Enter amount to add to your wallet</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Amount (₦)</label>
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#B3935E] focus:outline-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFundModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={fundWallet}
                disabled={loading || !fundAmount || parseFloat(fundAmount) <= 0}
                className="flex-1 px-4 py-2 bg-[#B3935E] text-white rounded hover:bg-[#8B7358] disabled:opacity-50"
              >
                {loading ? 'Funding...' : 'Fund Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
