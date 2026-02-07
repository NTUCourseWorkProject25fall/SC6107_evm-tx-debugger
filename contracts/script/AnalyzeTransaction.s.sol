// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {TraceAnalyzer} from "../src/analyzer/TraceAnalyzer.sol";
import {GasProfiler} from "../src/analyzer/GasProfiler.sol";
import {StateDiffAnalyzer} from "../src/analyzer/StateDiffAnalyzer.sol";
import {VulnerabilityDetector} from "../src/analyzer/VulnerabilityDetector.sol";

/**
 * @title AnalyzeTransaction
 * @notice Script to analyze a transaction using the analysis libraries
 * @dev This script demonstrates how to use the analysis libraries
 */
contract AnalyzeTransaction is Script {
    function run() external {
        // This is a demonstration script
        // In production, you would:
        // 1. Retrieve transaction trace from RPC node
        // 2. Parse trace into CallInfo[] format
        // 3. Run analysis libraries
        // 4. Output results
        
        console.log("Transaction Analysis Script");
        console.log("===========================");
        console.log("");
        console.log("This script demonstrates the analysis libraries.");
        console.log("In production, connect to an RPC node to retrieve");
        console.log("real transaction traces for analysis.");
        console.log("");
        console.log("Example usage:");
        console.log("  forge script script/AnalyzeTransaction.s.sol");
        console.log("");
    }
}
