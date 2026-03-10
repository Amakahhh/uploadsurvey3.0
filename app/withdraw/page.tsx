'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { safeLocalStorage } from '../utils/storageUtils';

interface WithdrawalRecord {
  id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  status: string;
  created_at: string;
}

export default function WithdrawPage() {
  const { isAuthenticated } = useAuth();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) return;
      try {
        const wallet = await apiService.getWallet();
        setBalance(Number(wallet.balance || 0));

        const token = safeLocalStorage.getItem('jwtToken');
        const res = await fetch('/api/withdraw', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const payload = await res.json();
        if (res.ok && payload?.success !== false) {
          setWithdrawals(payload.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wallet');
      }
    };
    load();
  }, [isAuthenticated]);

  const submitWithdrawal = async () => {
    setError(null);
    setSuccess(null);

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!bankName || !accountNumber || !accountHolderName) {
      setError('Bank details are required');
      return;
    }

    try {
      setLoading(true);
      const token = safeLocalStorage.getItem('jwtToken');
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: parsedAmount,
          bankName,
          accountNumber,
          accountHolderName,
        }),
      });
      const payload = await res.json();
      if (!res.ok || payload?.success === false) {
        throw new Error(payload?.message || payload?.error || 'Withdrawal failed');
      }
      setSuccess(payload?.message || 'Withdrawal initiated');
      setAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountHolderName('');

      const wallet = await apiService.getWallet();
      setBalance(Number(wallet.balance || 0));

      const historyRes = await fetch('/api/withdraw', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const historyPayload = await historyRes.json();
      if (historyRes.ok && historyPayload?.success !== false) {
        setWithdrawals(historyPayload.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <nav className="sticky top-0 z-50 bg-[#2E2F32] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/marketplace" className="text-sm text-[#B3935E] font-semibold">
              Back to Marketplace
            </Link>
            <div className="text-sm">Wallet Balance: N{balance.toFixed(2)}</div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#2E2F32] mb-4">Withdraw Funds</h1>

        {!isAuthenticated && (
          <div className="bg-white border border-[#E7DFC6] rounded-lg p-6 mb-6">
            <p className="text-sm text-[#2E2F32]/70">
              Please log in to request a withdrawal.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="bg-white border border-[#E7DFC6] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount (minimum N500)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Holder Name</label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <button
            onClick={submitWithdrawal}
            disabled={loading || !isAuthenticated}
            className="mt-4 bg-[#B3935E] text-white px-6 py-2 rounded-md hover:bg-[#A0824F] disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Request Withdrawal'}
          </button>
        </div>

        <div className="bg-white border border-[#E7DFC6] rounded-lg">
          <div className="p-4 border-b border-[#E7DFC6]">
            <h2 className="text-lg font-semibold text-[#2E2F32]">Withdrawal History</h2>
          </div>
          <div className="divide-y divide-[#E7DFC6]">
            {withdrawals.length === 0 && (
              <div className="p-4 text-sm text-[#2E2F32]/60">No withdrawals yet.</div>
            )}
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium">N{Number(withdrawal.amount || 0).toLocaleString()}</div>
                  <div className="text-xs text-[#2E2F32]/60">{withdrawal.status}</div>
                </div>
                <div className="text-[#2E2F32]/60 mt-1">
                  {withdrawal.bank_name} • {withdrawal.account_number}
                </div>
                <div className="text-xs text-[#2E2F32]/40 mt-1">
                  {new Date(withdrawal.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
