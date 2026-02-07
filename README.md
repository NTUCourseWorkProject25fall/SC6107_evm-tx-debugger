# EVM Transaction Debugger & Analyzer

A sophisticated Ethereum transaction debugging and analysis platform that helps developers understand what happens inside a transaction at the EVM level.

## 🎯 Project Overview

This project implements a comprehensive transaction analysis system that:
- Parses Ethereum transaction execution traces
- Analyzes gas usage and identifies gas-intensive operations
- Visualizes state changes (storage, balances, token transfers)
- Detects common smart contract vulnerabilities
- Provides developer-friendly explanations and insights

## 🏗️ Architecture

The system consists of three main components:

1. **Backend Analysis Engine** (Foundry-based)
   - Transaction trace parsing
   - Gas profiling algorithms
   - State diff computation
   - Vulnerability detection rules

2. **API Layer** (Node.js)
   - RESTful API for transaction analysis
   - Integration with Ethereum RPC nodes
   - Trace retrieval and processing

3. **Frontend Interface** (Next.js)
   - Transaction hash input
   - Interactive visualization
   - Gas usage charts
   - State diff display
   - Vulnerability reports

## 📁 Project Structure

```
evm-transaction-debugger/
├── README.md
├── foundry.toml
├── hardhat.config.js
├── package.json
├── contracts/
│   ├── src/
│   │   ├── analyzer/
│   │   │   ├── TraceAnalyzer.sol
│   │   │   ├── GasProfiler.sol
│   │   │   ├── StateDiffAnalyzer.sol
│   │   │   └── VulnerabilityDetector.sol
│   │   └── test/
│   │       └── TestContracts.sol
│   ├── test/
│   │   ├── TraceAnalyzer.t.sol
│   │   ├── GasProfiler.t.sol
│   │   ├── StateDiffAnalyzer.t.sol
│   │   └── VulnerabilityDetector.t.sol
│   ├── test-hardhat/
│   │   └── TraceAnalyzer.test.js
│   └── script/
│       └── AnalyzeTransaction.s.sol
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
├── scripts/
│   ├── analyze-transaction.js
│   └── setup-local-fork.js
└── docs/
    ├── architecture.md
    ├── security-analysis.md
    └── gas-optimization.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- **Option A:** Foundry (forge, cast, anvil) — or **Option B:** Hardhat only (no Foundry; Windows-friendly)
- Git

### Installation

#### Quick Start (Linux/macOS)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd evm-transaction-debugger
   ```

2. **Run installation script**
   ```bash
   bash scripts/install.sh
   ```

#### Windows Installation

**Option B — Hardhat path (no Foundry, recommended on Windows):**

1. Open PowerShell in the project root.
2. Run:
   ```powershell
   .\scripts\install.ps1
   ```
   If Foundry is not installed, the script will use Hardhat: it installs Node dependencies, compiles contracts with Hardhat, and installs the frontend. No WSL or Git Bash required.

3. Copy `.env.example` to `.env` and set `RPC_URL`. Then run tests: `npm test`, or start the frontend: `npm run frontend:dev`.

**Option A — With Foundry (WSL/Git Bash):** See [Windows Installation Guide](docs/INSTALLATION_WINDOWS.md). If Foundry is installed, `.\scripts\install.ps1` will use Forge to build contracts instead of Hardhat.

#### Manual Installation

1. **Install Foundry** (if not already installed)
   - Linux/macOS: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
   - Windows: See [Windows Installation Guide](docs/INSTALLATION_WINDOWS.md)

2. **Install contract dependencies**
   ```bash
   cd contracts
   forge install OpenZeppelin/openzeppelin-contracts
   ```

3. **Build contracts**
   ```bash
   forge build
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

5. **Run tests**
   ```bash
   cd contracts
   forge test -vv
   ```

6. **Start local fork** (in separate terminal)
   ```bash
   anvil --fork-url https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   ```

7. **Start frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## 🧪 Testing

### Run All Tests
```bash
forge test -vv
```

### Run with Coverage
```bash
forge coverage --report lcov
```

### Run Gas Reports
```bash
forge test --gas-report
```

### Run Frontend Tests
```bash
npm run frontend:test
```

## 📊 Features

### Core Features

- ✅ **Transaction Trace Analysis**
  - External and internal calls
  - CALL / DELEGATECALL / STATICCALL relationships
  - Function selectors and decoded function names
  - Event logs (decoded)

- ✅ **Gas Profiling**
  - Per-call gas usage breakdown
  - Per-function gas analysis
  - Identification of gas-intensive operations
  - Optimization suggestions

- ✅ **State Diff Visualization**
  - Storage slot modifications
  - ETH balance changes
  - ERC-20 / ERC-721 / ERC-1155 transfers
  - Before/after state comparison

- ✅ **Vulnerability Detection**
  - Reentrancy pattern detection
  - Unchecked external calls
  - Missing access control
  - Dangerous delegatecall usage

- ✅ **Real Analysis** (when `RPC_URL` is set)
  - Fetches transaction and trace via `debug_traceTransaction`
  - Builds trace, gas profile, and heuristic vulnerability hints from live RPC
  - Without RPC, the API returns a mock result for demo

- ✅ **Exportable Reports**
  - Export analysis as **JSON** or **Markdown** from the analysis view
  - Use **Export JSON** / **Export Markdown** buttons after analyzing a transaction

## 🔒 Security

This project includes:
- Reentrancy protection patterns
- Integer overflow/underflow checks
- Access control verification
- Emergency pause mechanisms

See [docs/security-analysis.md](docs/security-analysis.md) for detailed security analysis.

## 📚 Documentation

- [Architecture Documentation](docs/architecture.md)
- [Security Analysis](docs/security-analysis.md)
- [Gas Optimization Guide](docs/gas-optimization.md)

## 🛠️ Development

### Code Style

- Solidity: Follow Foundry's default formatting
- TypeScript: ESLint + Prettier
- Commit messages: Conventional Commits

### Adding New Analysis Rules

1. Add detection logic in `contracts/src/analyzer/VulnerabilityDetector.sol`
2. Add corresponding test in `contracts/test/VulnerabilityDetector.t.sol`
3. Update frontend to display new vulnerability type
4. Document in security-analysis.md

## 📝 License

MIT License

## 🙏 Acknowledgments

- OpenZeppelin Contracts
- Foundry team
- Ethereum Foundation
