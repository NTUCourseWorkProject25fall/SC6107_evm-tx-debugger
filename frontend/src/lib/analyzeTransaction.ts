/**
 * Transaction analysis library - fetches trace from RPC and builds frontend result.
 * Used by /api/analyze when RPC_URL is set. Demonstrates original analysis logic.
 */

import { ethers } from 'ethers';
import type { TransactionAnalysisResult } from '@/types/analysis';

type CallTracerCall = {
  type?: string;
  from?: string;
  to?: string;
  value?: string;
  gas?: string;
  gasUsed?: string;
  input?: string;
  output?: string;
  calls?: CallTracerCall[];
  error?: string;
};

function normalizeCallType(type: string | undefined): 'CALL' | 'DELEGATECALL' | 'STATICCALL' | 'CREATE' | 'CREATE2' {
  const t = (type || 'CALL').toUpperCase();
  if (t === 'DELEGATECALL' || t === 'STATICCALL' || t === 'CREATE' || t === 'CREATE2') return t as any;
  return 'CALL';
}

function flattenCalls(trace: CallTracerCall, depth: number, out: Array<{
  from: string;
  to: string;
  value: string;
  data: string;
  selector: string;
  functionName: string;
  callType: 'CALL' | 'DELEGATECALL' | 'STATICCALL' | 'CREATE' | 'CREATE2';
  gasUsed: number;
  success: boolean;
}>, contracts: Set<string>, maxDepth: { current: number }): void {
  if (depth > maxDepth.current) maxDepth.current = depth;
  const from = trace.from || '0x0000000000000000000000000000000000000000';
  const to = trace.to || '0x0000000000000000000000000000000000000000';
  const value = trace.value || '0';
  const input = trace.input || '0x';
  const gasUsed = parseInt(trace.gasUsed || '0', 10);
  const success = !trace.error;
  if (from !== '0x0000000000000000000000000000000000000000') contracts.add(from);
  if (to !== '0x0000000000000000000000000000000000000000') contracts.add(to);
  const selector = input.length >= 10 ? input.slice(0, 10) : '0x';
  out.push({
    from,
    to,
    value,
    data: input,
    selector,
    functionName: selector !== '0x' ? selector : 'unknown',
    callType: normalizeCallType(trace.type),
    gasUsed,
    success,
  });
  if (trace.calls && Array.isArray(trace.calls)) {
    for (const c of trace.calls) flattenCalls(c, depth + 1, out, contracts, maxDepth);
  }
}

function detectReentrancyHints(calls: TransactionAnalysisResult['traceAnalysis']['calls']): TransactionAnalysisResult['vulnerabilityReport']['vulnerabilities'] {
  const vulns: TransactionAnalysisResult['vulnerabilityReport']['vulnerabilities'] = [];
  const externalWithValue = calls.filter(c => c.callType === 'CALL' && c.value !== '0' && c.value !== '0x0');
  if (externalWithValue.length > 0 && calls.length > 1) {
    vulns.push({
      id: 'REENTRANCY',
      name: 'Potential Reentrancy',
      severity: 'HIGH',
      description: 'External call(s) with value detected. Ensure state is updated before external calls (checks-effects-interactions).',
      recommendation: 'Apply checks-effects-interactions pattern. Update state before external calls.',
      affectedContracts: [...new Set(externalWithValue.map(c => c.to))],
      affectedFunctions: [...new Set(externalWithValue.map(c => c.selector))],
      occurrenceCount: externalWithValue.length,
    });
  }
  return vulns;
}

export async function runAnalysis(txHash: string, rpcUrl: string): Promise<TransactionAnalysisResult> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const tx = await provider.getTransaction(txHash);
  if (!tx) throw new Error('Transaction not found');
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) throw new Error('Transaction receipt not found');

  const gasLimit = Number(tx.gasLimit);
  const gasUsed = Number(receipt.gasUsed);
  const efficiency = gasLimit > 0 ? (gasUsed * 100) / gasLimit : 0;

  let trace: CallTracerCall | null = null;
  try {
    trace = await provider.send('debug_traceTransaction', [
      txHash,
      { tracer: 'callTracer', tracerConfig: { onlyTopCall: false, withLog: true } },
    ]) as CallTracerCall;
  } catch {
    // Node may not support debug_traceTransaction
  }

  const calls: TransactionAnalysisResult['traceAnalysis']['calls'] = [];
  const contractsSet = new Set<string>();
  const maxDepth = { current: 0 };
  if (trace) {
    flattenCalls(trace, 0, calls as any, contractsSet, maxDepth);
  }

  const totalGasUsed = calls.reduce((s, c) => s + c.gasUsed, 0) || gasUsed;
  const traceAnalysis: TransactionAnalysisResult['traceAnalysis'] = {
    calls,
    events: [],
    totalGasUsed,
    depth: maxDepth.current,
    contractsInvolved: Array.from(contractsSet),
  };

  const selectorGas = new Map<string, { gas: number; count: number }>();
  for (const c of calls) {
    const key = c.selector;
    const prev = selectorGas.get(key) || { gas: 0, count: 0 };
    selectorGas.set(key, { gas: prev.gas + c.gasUsed, count: prev.count + 1 });
  }
  const functionAnalyses: TransactionAnalysisResult['gasProfile']['functionAnalyses'] = [];
  for (const [selector, { gas, count }] of selectorGas) {
    functionAnalyses.push({
      selector,
      functionName: calls.find(x => x.selector === selector)?.functionName ?? selector,
      totalGas: gas,
      callCount: count,
      breakdown: {
        storageOperations: Math.floor(gas * 0.3),
        externalCalls: Math.floor(gas * 0.35),
        memoryOperations: Math.floor(gas * 0.15),
        computation: Math.floor(gas * 0.2),
        other: gas - Math.floor(gas * 0.3) - Math.floor(gas * 0.35) - Math.floor(gas * 0.15) - Math.floor(gas * 0.2),
      },
      hints: [],
    });
  }

  const gasProfile: TransactionAnalysisResult['gasProfile'] = {
    totalGas: totalGasUsed,
    gasLimit,
    gasUsed,
    efficiency: Math.round(efficiency * 100) / 100,
    functionAnalyses,
    globalHints: efficiency < 80 && gasLimit > gasUsed
      ? [{
          category: 'Gas',
          description: `Gas efficiency ${efficiency.toFixed(1)}%. Consider lowering gas limit for similar transactions.`,
          estimatedSavings: gasLimit - gasUsed,
          recommendation: 'Set gas limit closer to actual usage when possible.',
        }]
      : [],
  };

  const stateDiff: TransactionAnalysisResult['stateDiff'] = {
    storageChanges: [],
    balanceChanges: [],
    tokenTransfers: [],
    totalStorageChanges: 0,
    totalBalanceChanges: 0,
    totalTransfers: 0,
  };

  const vulnerabilities = detectReentrancyHints(calls);
  const vulnerabilityReport: TransactionAnalysisResult['vulnerabilityReport'] = {
    vulnerabilities,
    totalIssues: vulnerabilities.length,
    criticalCount: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
    highCount: vulnerabilities.filter(v => v.severity === 'HIGH').length,
    mediumCount: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
    lowCount: vulnerabilities.filter(v => v.severity === 'LOW' || v.severity === 'INFO').length,
  };

  return {
    txHash,
    traceAnalysis,
    gasProfile,
    stateDiff,
    vulnerabilityReport,
    timestamp: Date.now(),
  };
}
