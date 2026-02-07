'use client';

import { StateDiff } from '@/types/analysis';
import { Database, Coins, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface StateDiffViewProps {
  stateDiff: StateDiff;
}

export default function StateDiffView({ stateDiff }: StateDiffViewProps) {
  const [activeTab, setActiveTab] = useState<'storage' | 'balance' | 'transfers'>('storage');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        State Changes
      </h3>

      <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${
            activeTab === 'storage'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Database size={16} className="inline mr-2" />
          Storage ({stateDiff.storageChanges.length})
        </button>
        <button
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${
            activeTab === 'balance'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Coins size={16} className="inline mr-2" />
          Balances ({stateDiff.balanceChanges.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${
            activeTab === 'transfers'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ArrowRight size={16} className="inline mr-2" />
          Transfers ({stateDiff.tokenTransfers.length})
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'storage' && (
          <div className="space-y-2">
            {stateDiff.storageChanges.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No storage changes detected
              </p>
            ) : (
              stateDiff.storageChanges.map((change, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {change.contractAddress}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Slot: {change.slot}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                      {change.description}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Before</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                        {change.before}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">After</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                        {change.after}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'balance' && (
          <div className="space-y-2">
            {stateDiff.balanceChanges.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No balance changes detected
              </p>
            ) : (
              stateDiff.balanceChanges.map((change, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <p className="text-sm font-mono text-gray-900 dark:text-white mb-3">
                    {change.account}
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Before</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {parseFloat(change.before).toFixed(4)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">After</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {parseFloat(change.after).toFixed(4)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Delta</p>
                      <p
                        className={`text-sm font-semibold ${
                          parseFloat(change.delta) >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {parseFloat(change.delta) >= 0 ? '+' : ''}
                        {parseFloat(change.delta).toFixed(4)} ETH
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'transfers' && (
          <div className="space-y-2">
            {stateDiff.tokenTransfers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No token transfers detected
              </p>
            ) : (
              stateDiff.tokenTransfers.map((transfer, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                      {transfer.tokenType}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {parseFloat(transfer.amount).toFixed(4)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {transfer.from.slice(0, 10)}...
                    </p>
                    <ArrowRight size={16} className="text-gray-400" />
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {transfer.to.slice(0, 10)}...
                    </p>
                  </div>
                  {transfer.token !== '0x0000000000000000000000000000000000000000' && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-mono">
                      Token: {transfer.token}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
