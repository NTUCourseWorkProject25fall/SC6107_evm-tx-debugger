#!/bin/bash

# Installation script for EVM Transaction Debugger & Analyzer

set -e

echo "🚀 Installing EVM Transaction Debugger & Analyzer"
echo ""

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo "📦 Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    foundryup
else
    echo "✅ Foundry is already installed"
fi

# Install OpenZeppelin contracts
echo ""
echo "📦 Installing OpenZeppelin contracts..."
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Build contracts
echo ""
echo "🔨 Building contracts..."
forge build

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Set up your .env file (see .env.example)"
echo "2. Start local fork: node scripts/setup-local-fork.js --start"
echo "3. Run tests: forge test"
echo "4. Start frontend: npm run frontend:dev"
