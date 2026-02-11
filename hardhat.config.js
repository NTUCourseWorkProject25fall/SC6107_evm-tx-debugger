require("dotenv/config");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");

const RPC_URL = process.env.RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo";
const FORK_BLOCK = process.env.FORK_BLOCK ? parseInt(process.env.FORK_BLOCK, 10) : undefined;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
    },
  },
  paths: {
    sources: "./contracts/src",
    tests: "./contracts/test-hardhat",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: process.env.USE_FORK === "true" ? {
        url: RPC_URL,
        blockNumber: FORK_BLOCK,
      } : undefined,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: RPC_URL,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};
