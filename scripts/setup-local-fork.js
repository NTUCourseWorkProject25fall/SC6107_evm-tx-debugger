#!/usr/bin/env node

/**
 * Local Fork Setup Script
 *
 * Supports two backends:
 * 1. Foundry (Anvil) - when `forge`/`anvil` is installed
 * 2. Hardhat - when Foundry is not installed (Windows-friendly)
 *
 * Usage:
 *   node scripts/setup-local-fork.js [--start] [--rpc-url <url>] [--block <number>]
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const DEFAULT_RPC_URL =
  process.env.RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo";
const DEFAULT_BLOCK = process.env.FORK_BLOCK || "latest";

function isAnvilInstalled() {
  try {
    execSync("anvil --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function isHardhatAvailable() {
  try {
    execSync("npx hardhat --version", { stdio: "ignore", cwd: path.join(__dirname, "..") });
    return true;
  } catch {
    return false;
  }
}

function startAnvil(rpcUrl, blockNumber) {
  console.log("Starting Anvil fork...\n");
  const command = `anvil --fork-url ${rpcUrl} --fork-block-number ${blockNumber}`;
  console.log(`Command: ${command}\n`);
  console.log("Anvil will run at: http://localhost:8545");
  console.log("Press Ctrl+C to stop\n");
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    if (error.signal === "SIGINT") {
      console.log("\nAnvil stopped");
    } else {
      console.error("\nError starting Anvil:", error.message);
      process.exit(1);
    }
  }
}

function startHardhatFork(rpcUrl, blockNumber) {
  console.log("Starting Hardhat node with fork (no Foundry required)...\n");
  const env = { ...process.env, RPC_URL: rpcUrl, USE_FORK: "true" };
  if (blockNumber !== "latest") {
    env.FORK_BLOCK = String(blockNumber);
  }
  const child = spawn("npx", ["hardhat", "node"], {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    shell: true,
    env,
  });
  child.on("error", (err) => {
    console.error("Error starting Hardhat:", err.message);
    process.exit(1);
  });
  child.on("close", (code, signal) => {
    if (signal === "SIGINT") console.log("\nHardhat node stopped");
    else if (code !== 0) process.exit(code || 1);
  });
}

function generateInstructions() {
  const instructions = `
# Local Fork Setup Instructions

## Prerequisites

- **Option A (Foundry):** Install Foundry, then use Anvil.
- **Option B (Hardhat, Windows-friendly):** No Foundry needed. Use \`npm install\` and Hardhat.

## Starting the Fork

### With Hardhat (recommended when Foundry is not installed)

1. Create \`.env\` in project root:
   \`\`\`
   RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   USE_FORK=true
   \`\`\`

2. Start node:
   \`\`\`bash
   node scripts/setup-local-fork.js --start --rpc-url <YOUR_RPC_URL>
   \`\`\`
   Or: \`npm run fork\` (with USE_FORK=true and RPC_URL in .env)

### With Foundry (Anvil)

\`\`\`bash
node scripts/setup-local-fork.js --start --rpc-url <YOUR_RPC_URL>
# or
anvil --fork-url <YOUR_RPC_URL> --fork-block-number latest
\`\`\`

## Using the Fork

- RPC: http://localhost:8545
- Analyze: \`node scripts/analyze-transaction.js <TX_HASH> http://localhost:8545\`
`;
  const outputPath = path.join(__dirname, "../docs/local-fork-setup.md");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, instructions.trim());
  console.log(`Instructions saved to: ${outputPath}\n`);
}

// Parse CLI
const args = process.argv.slice(2);
let shouldStart = false;
let rpcUrl = DEFAULT_RPC_URL;
let blockNumber = DEFAULT_BLOCK;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--start") shouldStart = true;
  else if (args[i] === "--rpc-url" && args[i + 1]) rpcUrl = args[++i];
  else if (args[i] === "--block" && args[i + 1]) blockNumber = args[++i];
}

console.log("Local Fork Setup\n");

if (shouldStart) {
  if (isAnvilInstalled()) {
    startAnvil(rpcUrl, blockNumber);
  } else if (isHardhatAvailable()) {
    startHardhatFork(rpcUrl, blockNumber);
  } else {
    console.error("Neither Anvil nor Hardhat is available.");
    console.log("Run from project root: npm install");
    console.log("Then run again: node scripts/setup-local-fork.js --start --rpc-url " + rpcUrl);
    process.exit(1);
  }
} else {
  generateInstructions();
  console.log("To start the fork, run:");
  console.log("  node scripts/setup-local-fork.js --start --rpc-url " + rpcUrl);
  console.log("");
}
