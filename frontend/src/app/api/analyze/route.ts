import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { runAnalysis } from '@/lib/analyzeTransaction';
import type { TransactionAnalysisResult } from '@/types/analysis';

function getMockResult(txHash: string): TransactionAnalysisResult {
  return {
    txHash,
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
      ],
      events: [],
      totalGasUsed: 65000,
      depth: 1,
      contractsInvolved: [
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      ],
    },
    gasProfile: {
      totalGas: 65000,
      gasLimit: 100000,
      gasUsed: 65000,
      efficiency: 65,
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
          description: 'Consider using memory variables for intermediate calculations',
          estimatedSavings: 5000,
          recommendation: 'Use memory instead of storage for temporary values',
        },
      ],
    },
    stateDiff: {
      storageChanges: [
        {
          contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          slot: '0x0000000000000000000000000000000000000000000000000000000000000000',
          before: '0x0000000000000000000000000000000000000000000000000000000000000000',
          after: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
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
        {
          account: '0x9876543210987654321098765432109876543210',
          before: '0',
          after: '1000000000000000000',
          delta: '1000000000000000000',
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
      totalBalanceChanges: 2,
      totalTransfers: 1,
    },
    vulnerabilityReport: {
      vulnerabilities: [
        {
          id: 'REENTRANCY',
          name: 'Potential Reentrancy',
          severity: 'HIGH',
          description: 'External call followed by state change detected',
          recommendation:
            'Apply checks-effects-interactions pattern. Update state before external calls.',
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
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const txHash = searchParams.get('txHash');
  const rpcUrl = searchParams.get('rpcUrl') || process.env.RPC_URL;

  if (!txHash || !ethers.isHexString(txHash, 32)) {
    return NextResponse.json(
      { error: 'Invalid transaction hash' },
      { status: 400 }
    );
  }

  try {
    if (rpcUrl) {
      const result = await runAnalysis(txHash, rpcUrl);
      return NextResponse.json(result);
    }
    return NextResponse.json(getMockResult(txHash));
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze transaction';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
