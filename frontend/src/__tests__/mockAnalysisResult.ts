import type { TransactionAnalysisResult } from '@/types/analysis';

export const mockAnalysisResult: TransactionAnalysisResult = {
  txHash: '0x' + 'a'.repeat(64),
  traceAnalysis: {
    calls: [
      {
        from: '0x1234567890123456789012345678901234567890',
        to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: '1000000000000000000',
        data: '0x12345678',
        selector: '0x12345678',
        functionName: 'transfer(address,uint256)',
        callType: 'CALL',
        gasUsed: 65000,
        success: true,
      },
      {
        from: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        to: '0x1111111111111111111111111111111111111111',
        value: '0',
        data: '0x',
        selector: '0x00000000',
        functionName: 'unknown',
        callType: 'DELEGATECALL',
        gasUsed: 5000,
        success: false,
      },
    ],
    events: [],
    totalGasUsed: 70000,
    depth: 2,
    contractsInvolved: [
      '0x1234567890123456789012345678901234567890',
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    ],
  },
  gasProfile: {
    totalGas: 70000,
    gasLimit: 100000,
    gasUsed: 70000,
    efficiency: 70,
    functionAnalyses: [
      {
        selector: '0x12345678',
        functionName: 'transfer(address,uint256)',
        totalGas: 65000,
        callCount: 1,
        breakdown: {
          storageOperations: 20000,
          externalCalls: 21000,
          memoryOperations: 10000,
          computation: 14000,
          other: 0,
        },
        hints: [],
      },
    ],
    globalHints: [
      {
        category: 'Storage',
        description: 'Use memory for temp values',
        estimatedSavings: 5000,
        recommendation: 'Use memory instead of storage',
      },
    ],
  },
  stateDiff: {
    storageChanges: [
      {
        contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        slot: '0x00',
        before: '0x00',
        after: '0x01',
        description: 'Storage slot updated',
      },
    ],
    balanceChanges: [
      {
        account: '0x1234567890123456789012345678901234567890',
        before: '2000000000000000000',
        after: '1000000000000000000',
        delta: '-1000000000000000000',
      },
    ],
    tokenTransfers: [
      {
        token: '0x0000000000000000000000000000000000000000',
        from: '0x1234567890123456789012345678901234567890',
        to: '0x9876543210987654321098765432109876543210',
        amount: '1000000000000000000',
        tokenType: 'ETH',
      },
    ],
    totalStorageChanges: 1,
    totalBalanceChanges: 1,
    totalTransfers: 1,
  },
  vulnerabilityReport: {
    vulnerabilities: [
      {
        id: 'REENTRANCY',
        name: 'Potential Reentrancy',
        severity: 'HIGH',
        description: 'External call followed by state change',
        recommendation: 'Apply checks-effects-interactions',
        affectedContracts: ['0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'],
        affectedFunctions: ['0x12345678'],
        occurrenceCount: 1,
      },
    ],
    totalIssues: 1,
    criticalCount: 0,
    highCount: 1,
    mediumCount: 0,
    lowCount: 0,
  },
  timestamp: Date.now(),
};
