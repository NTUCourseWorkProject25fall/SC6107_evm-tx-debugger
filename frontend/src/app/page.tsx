'use client';

import { useState } from 'react';
import TransactionInput from '@/components/TransactionInput';
import TransactionAnalysis from '@/components/TransactionAnalysis';
import { TransactionAnalysisResult } from '@/types/analysis';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<TransactionAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (txHash: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analyze?txHash=${txHash}`);
      
      if (!response.ok) {
        throw new Error('Failed to analyze transaction');
      }
      
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            EVM Transaction Debugger & Analyzer
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Analyze Ethereum transactions at the EVM level with detailed trace analysis,
            gas profiling, state diffs, and vulnerability detection
          </p>
        </div>

        <TransactionInput onAnalyze={handleAnalyze} isLoading={isLoading} />

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {analysisResult && <TransactionAnalysis result={analysisResult} />}
      </div>
    </main>
  );
}
