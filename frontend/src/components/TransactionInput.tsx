'use client';

import { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';

interface TransactionInputProps {
  onAnalyze: (txHash: string) => void;
  isLoading: boolean;
}

// 验证交易哈希格式: 0x + 64位十六进制字符
function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export default function TransactionInput({ onAnalyze, isLoading }: TransactionInputProps) {
  const [txHash, setTxHash] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // 实时验证输入
  useEffect(() => {
    if (!txHash.trim()) {
      setValidationError(null);
      return;
    }

    if (!txHash.startsWith('0x')) {
      setValidationError('Transaction hash must start with 0x');
    } else if (txHash.length !== 66) {
      setValidationError(`Invalid length: ${txHash.length}/66 characters`);
    } else if (!isValidTxHash(txHash)) {
      setValidationError('Invalid characters: only 0-9 and a-f allowed');
    } else {
      setValidationError(null);
    }
  }, [txHash]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txHash.trim() && !isLoading && isValidTxHash(txHash.trim())) {
      onAnalyze(txHash.trim());
    }
  };

  const isValid = isValidTxHash(txHash.trim());

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Enter transaction hash (0x...)"
            className={`w-full px-4 py-3 rounded-lg border 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:border-transparent transition-colors
                     ${validationError
                ? 'border-red-400 focus:ring-red-500'
                : isValid
                  ? 'border-green-400 focus:ring-green-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'}`}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold
                   hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2 transition-colors"
          aria-label="Analyze transaction"
        >
          <Search size={20} aria-hidden="true" />
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {/* 验证错误提示 */}
      {validationError ? (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-500">
          <AlertCircle size={14} />
          <span>{validationError}</span>
        </div>
      ) : isValid ? (
        <p className="mt-2 text-sm text-green-500">
          ✓ Valid transaction hash format
        </p>
      ) : (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter a valid Ethereum transaction hash (0x + 64 hex characters)
        </p>
      )}
    </div>
  );
}
