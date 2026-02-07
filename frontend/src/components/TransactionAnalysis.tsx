'use client';

import { TransactionAnalysisResult } from '@/types/analysis';
import TraceView from './TraceView';
import GasProfileView from './GasProfileView';
import StateDiffView from './StateDiffView';
import VulnerabilityReportView from './VulnerabilityReportView';
import { exportAsJson, exportAsMarkdown, downloadBlob } from '@/lib/exportReport';
import { FileJson, FileText } from 'lucide-react';

interface TransactionAnalysisProps {
  result: TransactionAnalysisResult;
}

export default function TransactionAnalysis({ result }: TransactionAnalysisProps) {
  const handleExportJson = () => {
    const content = exportAsJson(result);
    const filename = `analysis-${result.txHash.slice(2, 14)}.json`;
    downloadBlob(content, filename, 'application/json');
  };
  const handleExportMarkdown = () => {
    const content = exportAsMarkdown(result);
    const filename = `analysis-${result.txHash.slice(2, 14)}.md`;
    downloadBlob(content, filename, 'text/markdown');
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction Analysis
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <FileJson size={18} />
              Export JSON
            </button>
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <FileText size={18} />
              Export Markdown
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Hash</p>
            <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
              {result.txHash}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Gas Used</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {result.gasProfile.gasUsed.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Vulnerabilities Found</p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {result.vulnerabilityReport.totalIssues}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TraceView traceAnalysis={result.traceAnalysis} />
        <GasProfileView gasProfile={result.gasProfile} />
      </div>

      <StateDiffView stateDiff={result.stateDiff} />
      <VulnerabilityReportView report={result.vulnerabilityReport} />
    </div>
  );
}
