'use client';

import { TraceAnalysis } from '@/types/analysis';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface TraceViewProps {
  traceAnalysis: TraceAnalysis;
}

export default function TraceView({ traceAnalysis }: TraceViewProps) {
  const [expandedCall, setExpandedCall] = useState<number | null>(null);

  const getCallTypeColor = (callType: string) => {
    switch (callType) {
      case 'CALL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DELEGATECALL':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'STATICCALL':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Execution Trace
      </h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Calls:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {traceAnalysis.calls.length}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Contracts Involved:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {traceAnalysis.contractsInvolved.length}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Max Depth:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {traceAnalysis.depth}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {traceAnalysis.calls.map((call, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedCall(expandedCall === index ? null : index)}
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={16}
                  className={`transition-transform ${
                    expandedCall === index ? 'rotate-90' : ''
                  }`}
                />
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {call.functionName || call.selector}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getCallTypeColor(
                    call.callType
                  )}`}
                >
                  {call.callType}
                </span>
                {!call.success && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    FAILED
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {call.gasUsed.toLocaleString()} gas
              </span>
            </div>

            {expandedCall === index && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">From:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">
                    {call.from}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">To:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">
                    {call.to}
                  </span>
                </div>
                {call.value !== '0' && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Value:</span>
                    <span className="ml-2 font-mono text-gray-900 dark:text-white">
                      {call.value} ETH
                    </span>
                  </div>
                )}
                {call.data && call.data !== '0x' && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Data:</span>
                    <span className="ml-2 font-mono text-xs text-gray-900 dark:text-white break-all">
                      {call.data}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
