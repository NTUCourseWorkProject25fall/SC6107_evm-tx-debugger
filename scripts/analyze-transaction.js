#!/usr/bin/env node

/**
 * Transaction Analysis Script
 * 
 * This script analyzes an Ethereum transaction using the analysis libraries.
 * It connects to an Ethereum node, retrieves the transaction trace, and
 * processes it through the analysis engine.
 * 
 * Usage:
 *   node scripts/analyze-transaction.js <txHash> [rpcUrl]
 * 
 * Example:
 *   node scripts/analyze-transaction.js 0x1234... https://eth-sepolia.g.alchemy.com/v2/KEY
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const OUTPUT_DIR = path.join(__dirname, '../output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Main analysis function
 */
async function analyzeTransaction(txHash, rpcUrl = DEFAULT_RPC_URL) {
  console.log(`\n🔍 Analyzing transaction: ${txHash}`);
  console.log(`📡 Connecting to RPC: ${rpcUrl}\n`);

  try {
    // Connect to Ethereum node
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Verify transaction exists
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    console.log('✅ Transaction found');
    console.log(`   From: ${tx.from}`);
    console.log(`   To: ${tx.to || 'Contract Creation'}`);
    console.log(`   Value: ${ethers.formatEther(tx.value)} ETH`);
    console.log(`   Gas Limit: ${tx.gasLimit.toString()}`);

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      throw new Error('Transaction receipt not found (transaction may be pending)');
    }

    console.log(`\n✅ Transaction receipt retrieved`);
    console.log(`   Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`   Block Number: ${receipt.blockNumber}`);

    // Get trace (this requires a node that supports debug_traceTransaction)
    console.log(`\n📊 Retrieving execution trace...`);
    
    try {
      const trace = await provider.send('debug_traceTransaction', [
        txHash,
        {
          tracer: 'callTracer',
          tracerConfig: {
            onlyTopCall: false,
            withLog: true,
          },
        },
      ]);

      console.log('✅ Trace retrieved');
      
      // Process trace (in production, this would use the Solidity libraries)
      // For now, we'll output the raw trace
      const outputPath = path.join(OUTPUT_DIR, `trace-${txHash.slice(2, 10)}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(trace, null, 2));
      console.log(`\n💾 Trace saved to: ${outputPath}`);

      // Basic analysis
      console.log('\n📈 Basic Analysis:');
      console.log(`   Gas Efficiency: ${((receipt.gasUsed * 100) / tx.gasLimit).toFixed(2)}%`);
      console.log(`   Logs Emitted: ${receipt.logs.length}`);
      
      if (trace.calls) {
        console.log(`   Internal Calls: ${countCalls(trace)}`);
      }

      // Generate report
      const report = {
        txHash,
        timestamp: new Date().toISOString(),
        transaction: {
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          gasLimit: tx.gasLimit.toString(),
        },
        receipt: {
          status: receipt.status,
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
          logsCount: receipt.logs.length,
        },
        trace: {
          callCount: trace.calls ? countCalls(trace) : 0,
          gasEfficiency: ((receipt.gasUsed * 100) / tx.gasLimit).toFixed(2),
        },
      };

      const reportPath = path.join(OUTPUT_DIR, `report-${txHash.slice(2, 10)}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`💾 Report saved to: ${reportPath}`);

      console.log('\n✅ Analysis complete!\n');
      
    } catch (traceError) {
      console.error('\n❌ Error retrieving trace:', traceError.message);
      console.log('\n💡 Note: debug_traceTransaction requires a full node or archive node.');
      console.log('   Try using:');
      console.log('   - Local Anvil fork: anvil --fork-url <RPC_URL>');
      console.log('   - Alchemy/Infura archive node');
      console.log('   - Local Geth/Erigon node with --gcmode=archive\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Count total calls in trace
 */
function countCalls(trace) {
  let count = 1; // Count the root call
  if (trace.calls) {
    for (const call of trace.calls) {
      count += countCalls(call);
    }
  }
  return count;
}

// Main execution
const txHash = process.argv[2];
const rpcUrl = process.argv[3];

if (!txHash) {
  console.error('Usage: node scripts/analyze-transaction.js <txHash> [rpcUrl]');
  process.exit(1);
}

if (!ethers.isHexString(txHash, 32)) {
  console.error('Error: Invalid transaction hash');
  process.exit(1);
}

analyzeTransaction(txHash, rpcUrl).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
