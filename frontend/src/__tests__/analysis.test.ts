/**
 * Unit tests for analysis types and shape validation
 */
import type {
  TransactionAnalysisResult,
  TraceAnalysis,
  GasProfile,
  StateDiff,
  VulnerabilityReport,
} from '@/types/analysis';

describe('Analysis types', () => {
  it('accepts valid TraceAnalysis shape', () => {
    const trace: TraceAnalysis = {
      calls: [],
      events: [],
      totalGasUsed: 21000,
      depth: 0,
      contractsInvolved: [],
    };
    expect(trace.totalGasUsed).toBe(21000);
    expect(trace.calls).toHaveLength(0);
  });

  it('accepts valid GasProfile shape', () => {
    const profile: GasProfile = {
      totalGas: 100000,
      gasLimit: 200000,
      gasUsed: 95000,
      efficiency: 47.5,
      functionAnalyses: [],
      globalHints: [],
    };
    expect(profile.efficiency).toBe(47.5);
    expect(profile.gasUsed).toBe(95000);
  });

  it('accepts valid StateDiff shape', () => {
    const diff: StateDiff = {
      storageChanges: [],
      balanceChanges: [],
      tokenTransfers: [],
      totalStorageChanges: 0,
      totalBalanceChanges: 0,
      totalTransfers: 0,
    };
    expect(diff.totalStorageChanges).toBe(0);
  });

  it('accepts valid VulnerabilityReport shape', () => {
    const report: VulnerabilityReport = {
      vulnerabilities: [],
      totalIssues: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
    };
    expect(report.totalIssues).toBe(0);
  });

  it('accepts full TransactionAnalysisResult shape', () => {
    const result: TransactionAnalysisResult = {
      txHash: '0x' + 'a'.repeat(64),
      traceAnalysis: { calls: [], events: [], totalGasUsed: 0, depth: 0, contractsInvolved: [] },
      gasProfile: {
        totalGas: 0,
        gasLimit: 0,
        gasUsed: 0,
        efficiency: 0,
        functionAnalyses: [],
        globalHints: [],
      },
      stateDiff: {
        storageChanges: [],
        balanceChanges: [],
        tokenTransfers: [],
        totalStorageChanges: 0,
        totalBalanceChanges: 0,
        totalTransfers: 0,
      },
      vulnerabilityReport: {
        vulnerabilities: [],
        totalIssues: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
      },
      timestamp: Date.now(),
    };
    expect(result.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(result.timestamp).toBeGreaterThan(0);
  });
});
