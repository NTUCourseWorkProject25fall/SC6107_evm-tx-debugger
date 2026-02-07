export interface CallInfo {
  from: string;
  to: string;
  value: string;
  data: string;
  selector: string;
  functionName: string;
  callType: 'CALL' | 'DELEGATECALL' | 'STATICCALL' | 'CREATE' | 'CREATE2';
  gasUsed: number;
  success: boolean;
}

export interface EventLog {
  contractAddress: string;
  topics: string[];
  data: string;
  eventName: string;
  decodedParams: string[];
}

export interface TraceAnalysis {
  calls: CallInfo[];
  events: EventLog[];
  totalGasUsed: number;
  depth: number;
  contractsInvolved: string[];
}

export interface GasBreakdown {
  storageOperations: number;
  externalCalls: number;
  memoryOperations: number;
  computation: number;
  other: number;
}

export interface OptimizationHint {
  category: string;
  description: string;
  estimatedSavings: number;
  recommendation: string;
}

export interface FunctionGasAnalysis {
  selector: string;
  functionName: string;
  totalGas: number;
  callCount: number;
  breakdown: GasBreakdown;
  hints: OptimizationHint[];
}

export interface GasProfile {
  totalGas: number;
  gasLimit: number;
  gasUsed: number;
  efficiency: number;
  functionAnalyses: FunctionGasAnalysis[];
  globalHints: OptimizationHint[];
}

export interface StorageChange {
  contractAddress: string;
  slot: string;
  before: string;
  after: string;
  description: string;
}

export interface BalanceChange {
  account: string;
  before: string;
  after: string;
  delta: string;
}

export interface TokenTransfer {
  token: string;
  from: string;
  to: string;
  amount: string;
  tokenType: 'ETH' | 'ERC20' | 'ERC721' | 'ERC1155';
}

export interface StateDiff {
  storageChanges: StorageChange[];
  balanceChanges: BalanceChange[];
  tokenTransfers: TokenTransfer[];
  totalStorageChanges: number;
  totalBalanceChanges: number;
  totalTransfers: number;
}

export interface Vulnerability {
  id: string;
  name: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  recommendation: string;
  affectedContracts: string[];
  affectedFunctions: string[];
  occurrenceCount: number;
}

export interface VulnerabilityReport {
  vulnerabilities: Vulnerability[];
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface TransactionAnalysisResult {
  txHash: string;
  traceAnalysis: TraceAnalysis;
  gasProfile: GasProfile;
  stateDiff: StateDiff;
  vulnerabilityReport: VulnerabilityReport;
  timestamp: number;
}
