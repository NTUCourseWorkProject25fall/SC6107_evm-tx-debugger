# System Architecture

## Overview

The EVM Transaction Debugger & Analyzer is a comprehensive platform for analyzing Ethereum transactions at the EVM level. The system consists of three main components working together to provide detailed transaction insights.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Trace View  │  │  Gas Profile │  │ State Diff  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Vulnerability Report View                  │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST API
┌───────────────────────▼─────────────────────────────────────┐
│                  API Layer (Next.js API Routes)             │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Transaction Analysis Service                │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│            Analysis Engine (Solidity Libraries)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │TraceAnalyzer │  │ GasProfiler  │  │StateDiff    │      │
│  └──────────────┘  └──────────────┘  │Analyzer     │      │
│  ┌────────────────────────────────────────────────────┐     │
│  │         VulnerabilityDetector                       │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Ethereum Node (RPC Interface)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │eth_getTx     │  │debug_trace   │  │eth_getCode  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Layer (Next.js)

**Technology Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Recharts (for visualizations)
- ethers.js v6

**Key Components:**
- `TransactionInput`: Accepts transaction hash input
- `TransactionAnalysis`: Main analysis display component
- `TraceView`: Displays execution trace with call hierarchy
- `GasProfileView`: Visualizes gas usage with charts
- `StateDiffView`: Shows state changes (storage, balances, transfers)
- `VulnerabilityReportView`: Displays detected vulnerabilities

**Responsibilities:**
- User interface and interaction
- Data visualization
- API communication
- Responsive design

### 2. API Layer (Next.js API Routes)

**Endpoints:**
- `GET /api/analyze?txHash=<hash>`: Analyzes a transaction

**Responsibilities:**
- Receive transaction hash from frontend
- Connect to Ethereum node
- Retrieve transaction trace
- Process trace through analysis libraries
- Return structured analysis results

**Future Enhancements:**
- Caching layer for frequently analyzed transactions
- Batch analysis support
- WebSocket for real-time updates

### 3. Analysis Engine (Solidity Libraries)

#### TraceAnalyzer

**Purpose:** Parse and structure transaction execution traces

**Key Functions:**
- `extractSelector(bytes memory data)`: Extract function selector
- `parseCallType(string memory traceType)`: Determine call type
- `analyzeCall(...)`: Analyze individual call
- `extractContracts(CallInfo[] memory calls)`: Get unique contracts
- `calculateTotalGas(CallInfo[] memory calls)`: Sum gas usage

**Data Structures:**
- `CallInfo`: Represents a single call in trace
- `EventLog`: Represents an event emission
- `TraceAnalysis`: Complete trace analysis result

#### GasProfiler

**Purpose:** Analyze gas usage patterns and provide optimization hints

**Key Functions:**
- `analyzeGasUsage(CallInfo[] memory calls)`: Main analysis function
- `_analyzeByFunction(...)`: Group analysis by function
- `_generateOptimizationHints(...)`: Generate suggestions
- `getTopGasConsumers(...)`: Identify most expensive functions

**Data Structures:**
- `GasBreakdown`: Gas usage by category
- `OptimizationHint`: Optimization suggestion
- `FunctionGasAnalysis`: Per-function analysis
- `GasProfile`: Complete gas profile

**Optimization Categories:**
- Storage operations (SSTORE/SLOAD)
- External calls (CALL/DELEGATECALL/STATICCALL)
- Memory operations
- Computation

#### StateDiffAnalyzer

**Purpose:** Track and analyze state changes

**Key Functions:**
- `recordStorageChange(...)`: Record storage slot change
- `recordBalanceChange(...)`: Record ETH balance change
- `recordTokenTransfer(...)`: Record token transfer
- `aggregateStateDiffs(...)`: Combine multiple diffs
- `filterByContract(...)`: Filter by contract address

**Data Structures:**
- `StorageChange`: Storage slot modification
- `BalanceChange`: ETH balance change
- `TokenTransfer`: Token transfer record
- `StateDiff`: Complete state diff

#### VulnerabilityDetector

**Purpose:** Detect common smart contract vulnerabilities

**Detection Rules:**

1. **Reentrancy Detection**
   - Pattern: External call → State change to same contract
   - Severity: HIGH
   - Recommendation: Apply checks-effects-interactions pattern

2. **Unchecked External Calls**
   - Pattern: External call with value but no return check
   - Severity: MEDIUM
   - Recommendation: Always check return values

3. **Dangerous Delegatecall**
   - Pattern: Delegatecall usage detected
   - Severity: CRITICAL
   - Recommendation: Ensure proper access control

4. **Access Control Issues**
   - Pattern: State modification without access control
   - Severity: MEDIUM
   - Recommendation: Add access control modifiers

5. **Integer Overflow/Underflow**
   - Pattern: Large state changes (heuristic)
   - Severity: LOW (Solidity 0.8+ has built-in checks)
   - Recommendation: Use SafeMath for older versions

**Data Structures:**
- `Vulnerability`: Single vulnerability record
- `VulnerabilityReport`: Complete vulnerability analysis

## Data Flow

1. **User Input**: User enters transaction hash in frontend
2. **API Request**: Frontend sends GET request to `/api/analyze`
3. **Trace Retrieval**: API connects to Ethereum node and calls `debug_traceTransaction`
4. **Trace Processing**: Raw trace is processed through TraceAnalyzer
5. **Analysis Execution**:
   - GasProfiler analyzes gas usage
   - StateDiffAnalyzer computes state changes
   - VulnerabilityDetector runs detection rules
6. **Result Aggregation**: All analyses are combined into single result
7. **Response**: Structured JSON response sent to frontend
8. **Visualization**: Frontend renders analysis results in various views

## Design Decisions

### Why Solidity Libraries?

- **Type Safety**: Solidity provides strong typing for EVM data
- **Reusability**: Libraries can be used in other projects
- **Testing**: Can be tested with Foundry's comprehensive testing framework
- **Performance**: Native EVM operations are efficient

### Why Next.js?

- **Full-Stack**: API routes and frontend in one framework
- **TypeScript**: Type safety across the stack
- **Performance**: Server-side rendering and static generation
- **Developer Experience**: Excellent tooling and ecosystem

### Why Foundry?

- **Speed**: Fast compilation and testing
- **Gas Reports**: Built-in gas profiling
- **Fuzz Testing**: Advanced testing capabilities
- **Modern Tooling**: Best-in-class developer experience

## Known Limitations

1. **RPC Requirements**: Real analysis (when `RPC_URL` is set) requires a node that supports `debug_traceTransaction` (e.g. Geth, Erigon, or Alchemy/Infura archive nodes). Public RPC endpoints often do not support this; use a local fork (Anvil/Hardhat) or an archive RPC.
2. **State Diff**: When using real RPC analysis, state diff (storage/balance changes) is not populated from trace; it would require additional RPC calls (e.g. `debug_traceTransaction` with prestate/poststate tracer). Mock/demo mode shows sample state diff.
3. **Function Names**: Without contract ABIs, function names are shown as selectors (e.g. `0x12345678`). Decoding human-readable names would require ABI resolution per contract.
4. **Vulnerability Detection**: Current rule-based detection (e.g. reentrancy hints) is heuristic only; it does not replace a full audit or tools like Slither/Mythril.
5. **Single Transaction**: One transaction per request; no batch or comparison across transactions.

## Scalability Considerations

### Current Limitations

1. **Single Transaction Analysis**: One transaction at a time
2. **No Caching**: Every request triggers full analysis
3. **Synchronous Processing**: Blocking API calls

### Future Improvements

1. **Batch Processing**: Analyze multiple transactions
2. **Caching Layer**: Redis for frequently accessed transactions
3. **Async Processing**: Queue system for long-running analyses
4. **Database**: Store analysis results for historical queries
5. **Real-time Updates**: WebSocket support for live monitoring
6. **Prestate/Poststate Tracer**: Populate state diff from RPC when supported
7. **ABI Registry**: Decode function and event names using known ABIs

## Security Considerations

1. **Input Validation**: All transaction hashes are validated
2. **Rate Limiting**: API endpoints should have rate limits
3. **Error Handling**: Graceful error handling without exposing internals
4. **Access Control**: Future: Add authentication for sensitive operations

## Testing Strategy

1. **Unit Tests**: Each library function has comprehensive tests
2. **Integration Tests**: Test with real transaction traces
3. **Fuzz Tests**: Test analysis functions with random inputs
4. **Frontend Tests**: Component and integration tests
5. **E2E Tests**: Full workflow testing

## Deployment Architecture

### Development
- Local Anvil fork of Ethereum mainnet/Sepolia
- Next.js dev server
- Direct RPC connection

### Production (Future)
- Ethereum node (Infura/Alchemy)
- Next.js on Vercel/self-hosted
- Database for caching
- CDN for static assets
