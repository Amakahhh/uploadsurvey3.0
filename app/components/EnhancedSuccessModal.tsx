'use client';

import React, { useState } from 'react';
import { CreateSurveyResponse } from '../services/api';

interface EnhancedSuccessModalProps {
  survey: CreateSurveyResponse;
  onClose: () => void;
  show: boolean;
}

const EnhancedSuccessModal: React.FC<EnhancedSuccessModalProps> = ({
  survey,
  onClose,
  show
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'share' | 'manage'>('overview');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateQRCode = (url: string) => {
    // Simple QR code generation using a service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '📱',
      url: `https://wa.me/?text=Please%20help%20me%20by%20taking%20this%20survey:%20${encodeURIComponent(survey.responderLink)}`,
      color: 'bg-green-500'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=Please%20help%20me%20by%20taking%20this%20survey:%20${encodeURIComponent(survey.responderLink)}`,
      color: 'bg-blue-400'
    },
    {
      name: 'Facebook',
      icon: '👥',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(survey.responderLink)}`,
      color: 'bg-blue-600'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(survey.responderLink)}`,
      color: 'bg-blue-700'
    }
  ];

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#B3935E] to-[#D4B887] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🎉 Survey Live!</h2>
              <p className="text-white/90 mt-1">Your survey is now collecting responses</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'share', label: 'Share', icon: '🔗' },
            { id: 'manage', label: 'Manage', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#B3935E] text-[#B3935E]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Survey Details</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {survey.name}</div>
                  <div><strong>Max Responses:</strong> {survey.maxResponseNo.toLocaleString()}</div>
                  <div><strong>Cost per Response:</strong> ₦{survey.chargePerResponse}</div>
                  <div><strong>Total Budget:</strong> ₦{(survey.maxResponseNo * survey.chargePerResponse).toLocaleString()}</div>
                  <div><strong>Status:</strong> <span className="text-green-600 font-medium">Active</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Current Stats</h4>
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-600">Responses Collected</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Estimated Time</h4>
                  <div className="text-2xl font-bold text-purple-600">~3-5 days</div>
                  <div className="text-sm text-purple-600">To complete</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* Survey Link */}
              <div>
                <h3 className="font-semibold mb-3">📎 Survey Link</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={survey.responderLink}
                    readOnly
                    className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(survey.responderLink, 'link')}
                    className="px-4 py-2 bg-[#B3935E] text-white rounded-lg text-sm hover:bg-[#A08549] transition-colors"
                  >
                    {copied === 'link' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <h3 className="font-semibold mb-3">📱 QR Code</h3>
                <div className="flex items-center space-x-4">
                  <img
                    src={generateQRCode(survey.responderLink)}
                    alt="Survey QR Code"
                    className="w-24 h-24 border rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Share this QR code for easy mobile access
                    </p>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generateQRCode(survey.responderLink);
                        link.download = `${survey.name}-qr-code.png`;
                        link.click();
                      }}
                      className="text-[#B3935E] text-sm hover:underline"
                    >
                      Download QR Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Sharing */}
              <div>
                <h3 className="font-semibold mb-3">🚀 Share on Social Media</h3>
                <div className="grid grid-cols-2 gap-2">
                  {shareOptions.map(option => (
                    <a
                      key={option.name}
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${option.color} text-white p-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
                    >
                      <span>{option.icon}</span>
                      <span>{option.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div>
                  <h3 className="font-semibold text-yellow-800">Important</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your survey is now live! Monitor responses and manage your survey through the Telegram bot.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.open('https://t.me/suveyhustler_test_bot', '_blank')}
                  className="w-full bg-[#0088cc] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0077b3] transition-colors flex items-center justify-center space-x-2"
                >
                  <img src="/Ellipse 9.svg" alt="Telegram" className="w-6 h-6" />
                  <span>Go to Telegram Bot</span>
                </button>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => window.open(survey.sheetLink, '_blank')}
                    className="w-full border border-gray-300 py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    📊 View Response Sheet
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(survey.responderLink, 'responder')}
                    className="w-full border border-gray-300 py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    {copied === 'responder' ? '✓ Link Copied' : '🔗 Copy Survey Link'}
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Next Steps:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Share your survey link to collect responses</li>
                  <li>• Monitor progress in the Telegram bot</li>
                  <li>• Download results when you have enough responses</li>
                  <li>• Create more surveys for different topics</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Survey ID: {survey.id.slice(0, 8)}...
          </div>
          <div className="space-x-2">
            <button
              onClick={() => window.open('https://t.me/suveyhustler_test_bot', '_blank')}
              className="bg-[#B3935E] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#A08549] transition-colors"
            >
              Go to Bot
            </button>
            <button
              onClick={onClose}
              className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSuccessModal;