/**
 * ============================================
 * FILE: /app/components/AIAppetitePredictor.tsx
 * LOCATION: Replace ENTIRE file at /app/components/AIAppetitePredictor.tsx
 * PURPOSE: AI predictions component with onPredictions callback
 * FIX: Added onPredictions prop to interface and calls it when predictions are received
 * ============================================
 */

'use client';

import React, { useState } from 'react';

interface Placement {
  businessName: string;
  province: string;
  naicsCode: string;
  revenue: number;
  employees: number;
  yearsInBusiness: number;
  lossHistory: string;
}

interface CarrierPrediction {
  carrierName: string;
  quoteProbability: number;
  reasoning: string;
  concerns: string[];
  tips: string[];
}

interface AIAppetitePredictorProps {
  placement: Placement;
  onPredictions?: (predictions: any) => void;  // ADDED THIS LINE
}

export default function AIAppetitePredictor({ placement, onPredictions }: AIAppetitePredictorProps) {
  const [predictions, setPredictions] = useState<CarrierPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const getPredictions = async () => {
    setLoading(true);
    setError(null);
    setIsExpanded(true);
    
    try {
      const response = await fetch('/api/ai/appetite-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(placement)
      });

      if (!response.ok) {
        throw new Error(`Failed to get predictions: ${response.statusText}`);
      }

      const data = await response.json();
      setPredictions(data.topCarriers || []);
      
      // ADDED: Call the onPredictions callback if provided
      if (onPredictions) {
        onPredictions(data);
      }
    } catch (err) {
      console.error('AI Prediction error:', err);
      setError('Failed to get AI predictions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🤖</span>
          <h3 className="text-base sm:text-lg font-semibold">AI Carrier Predictions</h3>
        </div>
        <button
          onClick={getPredictions}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm sm:text-base font-medium"
        >
          {loading ? 'Analyzing...' : predictions.length > 0 ? 'Refresh Predictions' : 'Get AI Predictions'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
          {error}
        </div>
      )}

      {predictions.length > 0 && isExpanded && (
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">
              Top {predictions.length} carrier recommendations based on your business profile:
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:underline sm:hidden"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          
          {predictions.map((pred, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 overflow-hidden">
              {/* Mobile-optimized header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h4 className="font-semibold text-base break-words flex-shrink-0">
                      {pred.carrierName}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${
                      pred.quoteProbability >= 80 ? 'bg-green-100 text-green-700' :
                      pred.quoteProbability >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {pred.quoteProbability}% likely
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 break-words">
                    {pred.reasoning}
                  </p>
                </div>
              </div>

              {/* Concerns section - mobile optimized */}
              {pred.concerns && pred.concerns.length > 0 && (
                <div className="mt-2 overflow-hidden">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm">⚠️</span>
                    <span className="text-sm font-medium text-amber-700">Concerns:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-0.5 pl-2">
                    {pred.concerns.map((concern, i) => (
                      <li key={i} className="break-words line-clamp-2">{concern}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips section - mobile optimized */}
              {pred.tips && pred.tips.length > 0 && (
                <div className="mt-2 overflow-hidden">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm">💡</span>
                    <span className="text-sm font-medium text-green-700">Tips:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-0.5 pl-2">
                    {pred.tips.map((tip, i) => (
                      <li key={i} className="break-words line-clamp-2">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-600">Analyzing your business profile...</span>
        </div>
      )}

      {/* Info text when no predictions yet */}
      {!loading && predictions.length === 0 && !error && (
        <p className="text-sm text-gray-600">
          Click "Get AI Predictions" to receive personalized carrier recommendations based on your business profile.
        </p>
      )}
    </div>
  );
}