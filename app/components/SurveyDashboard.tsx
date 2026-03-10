'use client';

import React, { useState } from 'react';
import { CreateSurveyResponse } from '../services/api';

interface SurveyDashboardProps {
  surveys: CreateSurveyResponse[];
  onCreateNew: () => void;
}

const SurveyDashboard: React.FC<SurveyDashboardProps> = ({ surveys, onCreateNew }) => {
  const [selectedSurvey, setSelectedSurvey] = useState<CreateSurveyResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [fundingSurveyId, setFundingSurveyId] = useState<string | null>(null);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusColor = (isActive: boolean) =>
    isActive ? 'bg-[#B3935E]/15 text-[#7E6841]' : 'bg-gray-100 text-gray-600';

  const handleFundSurvey = async (surveyId: string) => {
    try {
      setFundingError(null);
      setFundingSurveyId(surveyId);

      const token = localStorage.getItem('jwtToken');
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ surveyId }),
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || 'Unable to initialize KoraPay checkout');
      }

      const checkoutUrl = payload?.data?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error('No checkout URL returned by backend');
      }

      window.open(checkoutUrl, '_blank');
    } catch (error) {
      setFundingError(error instanceof Error ? error.message : 'Funding failed');
    } finally {
      setFundingSurveyId(null);
    }
  };

  const handleAnalyzeSurvey = async (surveyId: string) => {
    try {
      setAnalysisError(null);
      setAnalysisLoading(true);
      const token = localStorage.getItem('jwtToken');
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ surveyId }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || payload?.error || 'Analysis failed');
      }
      setAnalysisData(payload.data);
      setShowAnalysis(true);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (surveys.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[#2E2F32] mb-2">No Surveys Yet</h2>
        <p className="text-[#2E2F32]/70 mb-6">Create your first survey to start collecting responses</p>
        <button
          onClick={onCreateNew}
          className="bg-[#B3935E] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#A08549] transition-colors"
        >
          Create Your First Survey
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2E2F32]">Survey Dashboard</h1>
          <p className="text-[#2E2F32]/70">Manage and monitor your surveys</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-[#B3935E] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#A08549] transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Create New Survey</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FCFAF2] border border-[#E7DFC6] rounded-lg p-4">
          <h3 className="text-[#2E2F32] font-semibold">Total Surveys</h3>
          <div className="text-2xl font-bold text-[#B3935E]">{surveys.length}</div>
        </div>
        <div className="bg-[#FCFAF2] border border-[#E7DFC6] rounded-lg p-4">
          <h3 className="text-[#2E2F32] font-semibold">Active Surveys</h3>
          <div className="text-2xl font-bold text-[#B3935E]">{surveys.filter((s) => s.isActive).length}</div>
        </div>
        <div className="bg-[#FCFAF2] border border-[#E7DFC6] rounded-lg p-4">
          <h3 className="text-[#2E2F32] font-semibold">Total Budget</h3>
          <div className="text-2xl font-bold text-[#B3935E]">
            N{surveys.reduce((total, survey) => total + survey.maxResponseNo * survey.chargePerResponse, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {fundingError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{fundingError}</div>
      )}
      {analysisError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{analysisError}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-[#E7DFC6]">
        <div className="p-4 border-b border-[#E7DFC6]">
          <h2 className="text-lg font-semibold text-[#2E2F32]">Your Surveys</h2>
        </div>
        <div className="divide-y divide-[#E7DFC6]">
          {surveys.map((survey) => (
            <div key={survey.id} className="p-4 hover:bg-[#FCFAF2] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-[#2E2F32]">{survey.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(survey.isActive)}`}>
                      {survey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[#2E2F32]/70 text-sm mb-2">{survey.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-[#2E2F32]/70">
                    <span>Max: {survey.maxResponseNo.toLocaleString()} responses</span>
                    <span>N{survey.chargePerResponse}/response</span>
                    <span>Created: {formatDate(survey.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(survey.responderLink)}
                    className="text-[#B3935E] hover:bg-[#B3935E] hover:text-white px-3 py-1 rounded text-sm border border-[#B3935E] transition-colors"
                    title="Copy survey link"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSurvey(survey);
                      setShowDetails(true);
                    }}
                    className="bg-[#F3EAD8] hover:bg-[#E8DCC5] text-[#7E6841] px-3 py-1 rounded text-sm transition-colors"
                  >
                    View Details
                  </button>
                  {!survey.isActive && (
                    <button
                      onClick={() => handleFundSurvey(survey.id)}
                      disabled={fundingSurveyId === survey.id}
                      className="bg-[#B3935E] hover:bg-[#A08549] text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-60"
                    >
                      {fundingSurveyId === survey.id ? 'Initializing...' : 'Fund with KoraPay'}
                    </button>
                  )}
                  <button
                    onClick={() => handleAnalyzeSurvey(survey.id)}
                    disabled={analysisLoading}
                    className="bg-[#2E2F32] hover:bg-[#1f2023] text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-60"
                  >
                    {analysisLoading ? 'Analyzing...' : 'AI Analyze'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDetails && selectedSurvey && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-[#E7DFC6]">
            <div className="flex justify-between items-center p-6 border-b border-[#E7DFC6]">
              <div>
                <h2 className="text-xl font-bold text-[#2E2F32]">{selectedSurvey.name}</h2>
                <p className="text-[#2E2F32]/70">{selectedSurvey.description}</p>
              </div>
              <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                x
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 text-sm text-[#2E2F32]">
              <div><strong>Survey ID:</strong> {selectedSurvey.id}</div>
              <div><strong>Max Responses:</strong> {selectedSurvey.maxResponseNo.toLocaleString()}</div>
              <div><strong>Cost per Response:</strong> N{selectedSurvey.chargePerResponse}</div>
              <div><strong>Total Budget:</strong> N{(selectedSurvey.maxResponseNo * selectedSurvey.chargePerResponse).toLocaleString()}</div>
              <div><strong>Status:</strong> {selectedSurvey.isActive ? 'Active' : 'Inactive'}</div>
              <div><strong>Created:</strong> {formatDate(selectedSurvey.createdAt)}</div>
              {!selectedSurvey.isActive && (
                <button
                  onClick={() => handleFundSurvey(selectedSurvey.id)}
                  disabled={fundingSurveyId === selectedSurvey.id}
                  className="mt-2 bg-[#B3935E] text-white py-2 px-4 rounded text-sm hover:bg-[#A08549] transition-colors disabled:opacity-60"
                >
                  {fundingSurveyId === selectedSurvey.id ? 'Initializing...' : 'Fund with KoraPay'}
                </button>
              )}
              <button
                onClick={() => handleAnalyzeSurvey(selectedSurvey.id)}
                disabled={analysisLoading}
                className="mt-2 bg-[#2E2F32] text-white py-2 px-4 rounded text-sm hover:bg-[#1f2023] transition-colors disabled:opacity-60"
              >
                {analysisLoading ? 'Analyzing...' : 'AI Analyze'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAnalysis && analysisData && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-[#E7DFC6]">
            <div className="flex justify-between items-center p-6 border-b border-[#E7DFC6]">
              <div>
                <h2 className="text-xl font-bold text-[#2E2F32]">AI Analysis</h2>
                <p className="text-[#2E2F32]/70 text-sm">Survey insights and summary</p>
              </div>
              <button onClick={() => setShowAnalysis(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                x
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#2E2F32]">
              <div>
                <h3 className="font-semibold mb-1">Summary</h3>
                <p>{analysisData.summary || 'No summary available.'}</p>
              </div>
              {analysisData.keyFindings?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">Key Findings</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisData.keyFindings.map((finding: string, idx: number) => (
                      <li key={idx}>{finding}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysisData.averages && Object.keys(analysisData.averages).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">Averages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(analysisData.averages).map(([key, value]) => (
                      <div key={key} className="bg-[#FCFAF2] border border-[#E7DFC6] rounded px-3 py-2">
                        <div className="text-xs text-[#2E2F32]/60">{key}</div>
                        <div className="font-semibold">{Number(value).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analysisData.correlations?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">Correlations</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisData.correlations.map((item: any, idx: number) => (
                      <li key={idx}>
                        {item.fieldA} vs {item.fieldB}: {Number(item.correlation).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysisData.fullAnalysis && (
                <div>
                  <h3 className="font-semibold mb-1">Full Analysis</h3>
                  <p className="whitespace-pre-wrap">{analysisData.fullAnalysis}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyDashboard;
