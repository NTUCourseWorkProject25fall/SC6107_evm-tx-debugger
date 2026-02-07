// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./TraceAnalyzer.sol";

/**
 * @title GasProfiler
 * @notice Analyzes gas usage patterns and identifies optimization opportunities
 * @dev Provides gas profiling and optimization suggestions
 */
library GasProfiler {
    using TraceAnalyzer for TraceAnalyzer.CallInfo[];

    /// @notice Gas usage breakdown by operation type
    struct GasBreakdown {
        uint256 storageOperations;
        uint256 externalCalls;
        uint256 memoryOperations;
        uint256 computation;
        uint256 other;
    }

    /// @notice Gas optimization suggestion
    struct OptimizationHint {
        string category;
        string description;
        uint256 estimatedSavings;
        string recommendation;
    }

    /// @notice Per-function gas analysis
    struct FunctionGasAnalysis {
        bytes4 selector;
        string functionName;
        uint256 totalGas;
        uint256 callCount;
        GasBreakdown breakdown;
        OptimizationHint[] hints;
    }

    /// @notice Complete gas profile
    struct GasProfile {
        uint256 totalGas;
        uint256 gasLimit;
        uint256 gasUsed;
        uint256 efficiency; // percentage (0-100)
        FunctionGasAnalysis[] functionAnalyses;
        OptimizationHint[] globalHints;
    }

    // Gas costs (EIP-150 and later)
    uint256 private constant GAS_COST_SSTORE = 20000; // Initial storage write
    uint256 private constant GAS_COST_SLOAD = 2100;
    uint256 private constant GAS_COST_CALL = 700;
    uint256 private constant GAS_COST_DELEGATECALL = 700;
    uint256 private constant GAS_COST_STATICCALL = 700;
    uint256 private constant GAS_COST_MEMORY = 3; // per word

    /**
     * @notice Analyzes gas usage for a set of calls
     * @param calls Array of call information
     * @return profile The complete gas profile
     */
    function analyzeGasUsage(
        TraceAnalyzer.CallInfo[] memory calls
    ) internal pure returns (GasProfile memory profile) {
        profile.totalGas = calls.calculateTotalGas();
        
        // Group by function selector
        profile.functionAnalyses = _analyzeByFunction(calls);
        
        // Generate optimization hints
        profile.globalHints = _generateOptimizationHints(calls, profile);
        
        // Calculate efficiency (simplified)
        if (profile.gasLimit > 0) {
            profile.efficiency = (profile.gasUsed * 100) / profile.gasLimit;
        }
    }

    /**
     * @notice Analyzes gas usage grouped by function
     * @param calls Array of call information
     * @return analyses Array of function-level analyses
     */
    function _analyzeByFunction(
        TraceAnalyzer.CallInfo[] memory calls
    ) private pure returns (FunctionGasAnalysis[] memory analyses) {
        // Count unique functions
        uint256 uniqueCount = 0;
        bytes4[] memory selectors = new bytes4[](calls.length);
        
        for (uint256 i = 0; i < calls.length; i++) {
            if (calls[i].selector == bytes4(0)) continue;
            
            bool found = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (selectors[j] == calls[i].selector) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                selectors[uniqueCount++] = calls[i].selector;
            }
        }
        
        analyses = new FunctionGasAnalysis[](uniqueCount);
        
        for (uint256 i = 0; i < uniqueCount; i++) {
            analyses[i] = _analyzeFunction(calls, selectors[i]);
        }
    }

    /**
     * @notice Analyzes gas usage for a specific function
     * @param calls Array of all calls
     * @param selector The function selector to analyze
     * @return analysis The function-specific analysis
     */
    function _analyzeFunction(
        TraceAnalyzer.CallInfo[] memory calls,
        bytes4 selector
    ) private pure returns (FunctionGasAnalysis memory analysis) {
        analysis.selector = selector;
        analysis.breakdown = GasBreakdown(0, 0, 0, 0, 0);
        
        for (uint256 i = 0; i < calls.length; i++) {
            if (calls[i].selector != selector) continue;
            
            analysis.callCount++;
            analysis.totalGas += calls[i].gasUsed;
            
            // Categorize gas usage (simplified - real implementation would parse opcodes)
            if (calls[i].callType == TraceAnalyzer.CallType.CALL ||
                calls[i].callType == TraceAnalyzer.CallType.DELEGATECALL ||
                calls[i].callType == TraceAnalyzer.CallType.STATICCALL) {
                analysis.breakdown.externalCalls += calls[i].gasUsed;
            } else {
                analysis.breakdown.computation += calls[i].gasUsed;
            }
        }
        
        analysis.hints = _generateFunctionHints(analysis);
    }

    /**
     * @notice Generates optimization hints for a function
     * @param analysis The function analysis
     * @return hints Array of optimization suggestions
     */
    function _generateFunctionHints(
        FunctionGasAnalysis memory analysis
    ) private pure returns (OptimizationHint[] memory hints) {
        uint256 hintCount = 0;
        OptimizationHint[] memory temp = new OptimizationHint[](10);
        
        // Check for high external call count
        if (analysis.callCount > 5) {
            temp[hintCount++] = OptimizationHint({
                category: "External Calls",
                description: "High number of external calls detected",
                estimatedSavings: analysis.callCount * 1000, // Rough estimate
                recommendation: "Consider batching calls or using multicall pattern"
            });
        }
        
        // Check for high gas usage
        if (analysis.totalGas > 100000) {
            temp[hintCount++] = OptimizationHint({
                category: "Gas Optimization",
                description: "Function uses significant gas",
                estimatedSavings: analysis.totalGas / 10, // 10% potential savings
                recommendation: "Review storage operations and consider using memory where possible"
            });
        }
        
        hints = new OptimizationHint[](hintCount);
        for (uint256 i = 0; i < hintCount; i++) {
            hints[i] = temp[i];
        }
    }

    /**
     * @notice Generates global optimization hints
     * @param calls Array of all calls
     * @param profile The gas profile
     * @return hints Array of global optimization suggestions
     */
    function _generateOptimizationHints(
        TraceAnalyzer.CallInfo[] memory calls,
        GasProfile memory profile
    ) private pure returns (OptimizationHint[] memory hints) {
        uint256 hintCount = 0;
        OptimizationHint[] memory temp = new OptimizationHint[](10);
        
        // Check for redundant storage writes
        uint256 storageOps = _countStorageOperations(calls);
        if (storageOps > 10) {
            temp[hintCount++] = OptimizationHint({
                category: "Storage",
                description: "Many storage operations detected",
                estimatedSavings: storageOps * 5000,
                recommendation: "Consider using memory variables and writing to storage once"
            });
        }
        
        // Check for delegatecall usage
        for (uint256 i = 0; i < calls.length; i++) {
            if (calls[i].callType == TraceAnalyzer.CallType.DELEGATECALL) {
                temp[hintCount++] = OptimizationHint({
                    category: "Security",
                    description: "DELEGATECALL detected - ensure proper access control",
                    estimatedSavings: 0,
                    recommendation: "Review delegatecall usage for security implications"
                });
                break;
            }
        }
        
        hints = new OptimizationHint[](hintCount);
        for (uint256 i = 0; i < hintCount; i++) {
            hints[i] = temp[i];
        }
    }

    /**
     * @notice Counts storage operations (simplified)
     * @param calls Array of calls
     * @return count Estimated number of storage operations
     */
    function _countStorageOperations(
        TraceAnalyzer.CallInfo[] memory calls
    ) private pure returns (uint256 count) {
        // In a real implementation, this would parse opcodes
        // For now, estimate based on gas usage patterns
        for (uint256 i = 0; i < calls.length; i++) {
            if (calls[i].gasUsed > GAS_COST_SSTORE) {
                count += (calls[i].gasUsed / GAS_COST_SSTORE);
            }
        }
    }

    /**
     * @notice Identifies the most gas-intensive functions
     * @param profile The gas profile
     * @param topN Number of top functions to return
     * @return topFunctions Array of top gas-consuming functions
     */
    function getTopGasConsumers(
        GasProfile memory profile,
        uint256 topN
    ) internal pure returns (FunctionGasAnalysis[] memory topFunctions) {
        // Simple selection - in production, use proper sorting
        uint256 count = topN < profile.functionAnalyses.length 
            ? topN 
            : profile.functionAnalyses.length;
        
        topFunctions = new FunctionGasAnalysis[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 maxIndex = i;
            for (uint256 j = i + 1; j < profile.functionAnalyses.length; j++) {
                if (profile.functionAnalyses[j].totalGas > 
                    profile.functionAnalyses[maxIndex].totalGas) {
                    maxIndex = j;
                }
            }
            
            if (maxIndex != i) {
                FunctionGasAnalysis memory temp = profile.functionAnalyses[i];
                profile.functionAnalyses[i] = profile.functionAnalyses[maxIndex];
                profile.functionAnalyses[maxIndex] = temp;
            }
            
            topFunctions[i] = profile.functionAnalyses[i];
        }
    }
}
