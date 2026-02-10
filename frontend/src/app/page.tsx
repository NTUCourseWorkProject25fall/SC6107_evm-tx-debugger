'use client';

import { useState } from 'react';
import TransactionInput from '@/components/TransactionInput';
import TransactionAnalysis from '@/components/TransactionAnalysis';
import AnalysisHistory, { addToHistory } from '@/components/AnalysisHistory';
import ThemeToggle from '@/components/ThemeToggle';
import { TransactionAnalysisResult } from '@/types/analysis';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<TransactionAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTxHash, setCurrentTxHash] = useState<string>('');

  const handleAnalyze = async (txHash: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentTxHash(txHash);

    try {
      const response = await fetch(`/api/analyze?txHash=${txHash}`);

      if (!response.ok) {
        throw new Error('Failed to analyze transaction');
      }

      const data = await response.json();
      setAnalysisResult(data);

      // 保存到历史记录
      addToHistory({
        txHash,
        timestamp: Date.now(),
        gasUsed: data.gasProfile?.totalGas,
        vulnerabilityCount: data.vulnerabilityReport?.totalIssues || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <span className="font-bold text-gray-900 dark:text-white hidden sm:inline">
              EVM Debugger
            </span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

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

        {/* 历史记录组件 */}
        <AnalysisHistory
          onSelectHistory={handleAnalyze}
          currentTxHash={currentTxHash}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-2xl mx-auto">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {analysisResult && <TransactionAnalysis result={analysisResult} />}
      </div>
    </main>
  );
}
