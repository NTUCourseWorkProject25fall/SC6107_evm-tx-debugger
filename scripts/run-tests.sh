#!/bin/bash

# Test runner script for EVM Transaction Debugger & Analyzer

set -e

echo "🧪 Running Tests for EVM Transaction Debugger & Analyzer"
echo ""

# Run Foundry tests
echo "📋 Running Foundry tests..."
cd contracts
forge test -vv

# Generate coverage report
echo ""
echo "📊 Generating coverage report..."
forge coverage --report lcov

# Generate gas report
echo ""
echo "⛽ Generating gas report..."
forge test --gas-report > gas-report.txt 2>&1 || true

echo ""
echo "✅ Tests complete!"
echo ""
echo "Coverage report: contracts/coverage/lcov.info"
echo "Gas report: contracts/gas-report.txt"
