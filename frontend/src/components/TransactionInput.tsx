'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface TransactionInputProps {
  onAnalyze: (txHash: string) => void;
  isLoading: boolean;
}

export default function TransactionInput({ onAnalyze, isLoading }: TransactionInputProps) {
  const [txHash, setTxHash] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txHash.trim() && !isLoading) {
      onAnalyze(txHash.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Enter transaction hash (0x...)"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !txHash.trim()}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold
                   hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2 transition-colors"
        >
          <Search size={20} />
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Enter a valid Ethereum transaction hash to analyze
      </p>
    </div>
  );
}
