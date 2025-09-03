// app/components/AIAppetitePredictor.tsx
'use client';

import { useState } from 'react';

interface Prediction {
  carrierName: string;
  quoteProbability: number;
  reasoning: string;
  concerns: string[];
  tips: string[];
}

interface AIAppetitePredictorProps {
  placement: any;
}

export function AIAppetitePredictor({ placement }: AIAppetitePredictorProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);

  const getPredictions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/appetite-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(placement),
      });
      
      const data = await response.json();
      if (data.success && data.predictions?.topCarriers) {
        setPredictions(data.predictions.topCarriers);
        setShowPredictions(true);
      }
    } catch (error) {
      console.error('Error getting AI predictions:', error);
    }
    setLoading(false);
  };

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🤖 AI Carrier Predictions</h3>
        <button
          onClick={getPredictions}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Get AI Predictions'}
        </button>
      </div>

      {showPredictions && predictions.length > 0 && (
        <div className="space-y-4">
          {predictions.map((pred, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">{pred.carrierName}</h4>
                <div className="flex items-center">
                  <span className={`text-2xl font-bold ${
                    pred.quoteProbability >= 80 ? 'text-green-600' : 
                    pred.quoteProbability >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {pred.quoteProbability}%
                  </span>
                  <span className="ml-2 text-sm text-gray-600">likely to quote</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-2">{pred.reasoning}</p>
              
              {pred.concerns.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm font-semibold text-orange-600">⚠️ Concerns:</span>
                  <ul className="text-sm text-gray-600 ml-4">
                    {pred.concerns.map((concern, i) => (
                      <li key={i}>• {concern}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {pred.tips.length > 0 && (
                <div>
                  <span className="text-sm font-semibold text-green-600">💡 Tips:</span>
                  <ul className="text-sm text-gray-600 ml-4">
                    {pred.tips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
