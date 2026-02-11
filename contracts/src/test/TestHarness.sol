// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "../analyzer/TraceAnalyzer.sol";
import "../analyzer/GasProfiler.sol";
import "../analyzer/StateDiffAnalyzer.sol";
import "../analyzer/VulnerabilityDetector.sol";

/**
 * @title TestHarness
 * @notice A test harness contract that exposes library functions for testing
 * @dev This contract wraps internal library functions as external functions for Hardhat testing
 */
contract TraceAnalyzerHarness {
    using TraceAnalyzer for TraceAnalyzer.CallInfo[];

    /**
     * @notice Extracts function selector from call data
     * @param data The call data (must be at least 4 bytes)
     * @return selector The 4-byte function selector
     */
    function extractSelector(bytes memory data) external pure returns (bytes4) {
        return TraceAnalyzer.extractSelector(data);
    }

    /**
     * @notice Parses call type from string
     * @param traceType The trace type string
     * @return The corresponding CallType enum value as uint8
     */
    function parseCallType(
        string memory traceType
    ) external pure returns (uint8) {
        return uint8(TraceAnalyzer.parseCallType(traceType));
    }

    /**
     * @notice Analyzes a call trace entry
     */
    function analyzeCall(
        address from,
        address to,
        uint256 value,
        bytes memory data,
        uint256 gasUsed,
        bool success
    )
        external
        pure
        returns (
            address retFrom,
            address retTo,
            uint256 retValue,
            bytes4 retSelector,
            uint256 retGasUsed,
            bool retSuccess
        )
    {
        TraceAnalyzer.CallInfo memory callInfo = TraceAnalyzer.analyzeCall(
            from,
            to,
            value,
            data,
            gasUsed,
            success
        );
        return (
            callInfo.from,
            callInfo.to,
            callInfo.value,
            callInfo.selector,
            callInfo.gasUsed,
            callInfo.success
        );
    }

    /**
     * @notice Creates a CallInfo array and extracts unique contracts
     */
    function testExtractContracts(
        address[] memory froms,
        address[] memory tos
    ) external pure returns (address[] memory) {
        require(froms.length == tos.length, "Array length mismatch");

        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](
            froms.length
        );
        for (uint256 i = 0; i < froms.length; i++) {
            calls[i].from = froms[i];
            calls[i].to = tos[i];
        }

        return TraceAnalyzer.extractContracts(calls);
    }

    /**
     * @notice Calculates total gas from an array of gas values
     */
    function testCalculateTotalGas(
        uint256[] memory gasValues
    ) external pure returns (uint256) {
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](
            gasValues.length
        );
        for (uint256 i = 0; i < gasValues.length; i++) {
            calls[i].gasUsed = gasValues[i];
        }

        return TraceAnalyzer.calculateTotalGas(calls);
    }
}

/**
 * @title GasProfilerHarness
 * @notice Test harness for GasProfiler library
 */
contract GasProfilerHarness {
    using GasProfiler for GasProfiler.GasProfile;

    /**
     * @notice Analyzes gas usage for a set of calls
     */
    function analyzeGasUsage(
        address[] memory froms,
        address[] memory tos,
        uint256[] memory values,
        bytes4[] memory selectors,
        uint256[] memory gasUsed,
        uint8[] memory callTypes
    ) external pure returns (uint256 totalGas, uint256 functionCount) {
        require(froms.length == tos.length, "Array length mismatch");

        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](
            froms.length
        );
        for (uint256 i = 0; i < froms.length; i++) {
            calls[i].from = froms[i];
            calls[i].to = tos[i];
            calls[i].value = values[i];
            calls[i].selector = selectors[i];
            calls[i].gasUsed = gasUsed[i];
            calls[i].callType = TraceAnalyzer.CallType(callTypes[i]);
            calls[i].success = true;
        }

        GasProfiler.GasProfile memory profile = GasProfiler.analyzeGasUsage(
            calls
        );
        return (profile.totalGas, profile.functionAnalyses.length);
    }

    /**
     * @notice Gets top gas consumers
     */
    function testGetTopGasConsumers(
        bytes4[] memory selectors,
        uint256[] memory gasValues,
        uint256 topN
    ) external pure returns (uint256 resultCount) {
        require(selectors.length == gasValues.length, "Array length mismatch");

        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](
            selectors.length
        );
        for (uint256 i = 0; i < selectors.length; i++) {
            calls[i].selector = selectors[i];
            calls[i].gasUsed = gasValues[i];
            calls[i].success = true;
        }

        GasProfiler.GasProfile memory profile = GasProfiler.analyzeGasUsage(
            calls
        );
        GasProfiler.FunctionGasAnalysis[] memory top = GasProfiler
            .getTopGasConsumers(profile, topN);
        return top.length;
    }
}

/**
 * @title StateDiffAnalyzerHarness
 * @notice Test harness for StateDiffAnalyzer library
 */
contract StateDiffAnalyzerHarness {
    /**
     * @notice Records a storage slot change
     */
    function recordStorageChange(
        address contractAddr,
        bytes32 slot,
        bytes32 beforeValue,
        bytes32 afterValue
    )
        external
        pure
        returns (
            address retContract,
            bytes32 retSlot,
            bytes32 retBefore,
            bytes32 retAfter,
            string memory retDescription
        )
    {
        StateDiffAnalyzer.StorageChange memory change = StateDiffAnalyzer
            .recordStorageChange(contractAddr, slot, beforeValue, afterValue);
        return (
            change.contractAddress,
            change.slot,
            change.before,
            change.valueAfter,
            change.description
        );
    }

    /**
     * @notice Records an ETH balance change
     */
    function recordBalanceChange(
        address account,
        uint256 beforeBalance,
        uint256 afterBalance
    )
        external
        pure
        returns (
            address retAccount,
            uint256 retBefore,
            uint256 retAfter,
            int256 retDelta
        )
    {
        StateDiffAnalyzer.BalanceChange memory change = StateDiffAnalyzer
            .recordBalanceChange(account, beforeBalance, afterBalance);
        return (
            change.account,
            change.before,
            change.balanceAfter,
            change.delta
        );
    }

    /**
     * @notice Records a token transfer
     */
    function recordTokenTransfer(
        address token,
        address from,
        address to,
        uint256 amount,
        uint8 tokenType
    )
        external
        pure
        returns (
            address retToken,
            address retFrom,
            address retTo,
            uint256 retAmount,
            uint8 retType
        )
    {
        StateDiffAnalyzer.TokenTransfer memory transfer = StateDiffAnalyzer
            .recordTokenTransfer(
                token,
                from,
                to,
                amount,
                StateDiffAnalyzer.TokenType(tokenType)
            );
        return (
            transfer.token,
            transfer.from,
            transfer.to,
            transfer.amount,
            uint8(transfer.tokenType)
        );
    }

    /**
     * @notice Aggregates multiple state diffs
     */
    function aggregateStateDiffs(
        uint256 numDiffs
    )
        external
        pure
        returns (
            uint256 totalStorageChanges,
            uint256 totalBalanceChanges,
            uint256 totalTransfers
        )
    {
        // Create test diffs with some data
        StateDiffAnalyzer.StateDiff[]
            memory diffs = new StateDiffAnalyzer.StateDiff[](numDiffs);

        for (uint256 i = 0; i < numDiffs; i++) {
            diffs[i].storageChanges = new StateDiffAnalyzer.StorageChange[](1);
            diffs[i].balanceChanges = new StateDiffAnalyzer.BalanceChange[](1);
            diffs[i].tokenTransfers = new StateDiffAnalyzer.TokenTransfer[](1);
        }

        StateDiffAnalyzer.StateDiff memory aggregated = StateDiffAnalyzer
            .aggregateStateDiffs(diffs);
        return (
            aggregated.totalStorageChanges,
            aggregated.totalBalanceChanges,
            aggregated.totalTransfers
        );
    }

    /**
     * @notice Filters state diff by contract address
     */
    function filterByContract(
        address[] memory contractAddresses,
        address filterAddr
    )
        external
        pure
        returns (uint256 filteredStorageChanges, uint256 filteredTransfers)
    {
        // Create a test diff with storage changes and transfers
        StateDiffAnalyzer.StateDiff memory diff;
        diff.storageChanges = new StateDiffAnalyzer.StorageChange[](
            contractAddresses.length
        );
        diff.tokenTransfers = new StateDiffAnalyzer.TokenTransfer[](
            contractAddresses.length
        );
        diff.balanceChanges = new StateDiffAnalyzer.BalanceChange[](0);

        for (uint256 i = 0; i < contractAddresses.length; i++) {
            diff.storageChanges[i].contractAddress = contractAddresses[i];
            diff.tokenTransfers[i].token = contractAddresses[i];
        }

        diff.totalStorageChanges = contractAddresses.length;
        diff.totalBalanceChanges = 0;
        diff.totalTransfers = contractAddresses.length;

        StateDiffAnalyzer.StateDiff memory filtered = StateDiffAnalyzer
            .filterByContract(diff, filterAddr);
        return (filtered.totalStorageChanges, filtered.totalTransfers);
    }
}

/**
 * @title VulnerabilityDetectorHarness
 * @notice Test harness for VulnerabilityDetector library
 */
contract VulnerabilityDetectorHarness {
    /**
     * @notice Detects reentrancy patterns
     */
    function detectReentrancy(
        address[] memory tos,
        uint256[] memory values,
        uint8[] memory callTypes,
        address[] memory storageContracts
    ) external pure returns (uint256 occurrenceCount) {
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](
            tos.length
        );
        for (uint256 i = 0; i < tos.length; i++) {
            calls[i].to = tos[i];
            calls[i].value = values[i];
            calls[i].callType = TraceAnalyzer.CallType(callTypes[i]);
            calls[i].success = true;
        }

        StateDiffAnalyzer.StateDiff memory stateDiff;
        stateDiff.storageChanges = new StateDiffAnalyzer.StorageChange[](
            storageContracts.length
        );
        for (uint256 i = 0; i < storageContracts.length; i++) {
            stateDiff.storageChanges[i].contractAddress = storageContracts[i];
        }

        VulnerabilityDetector.Vulnerability memory vuln = VulnerabilityDetector
            .detectReentrancy(calls, stateDiff);
        return vuln.occurrenceCount;
    }

    /**
     * @notice Detects unchecked external calls
     */
    function detectUncheckedCalls(
        address[] memory tos,
        uint256[] memory values,
        bool[] memory successes
    ) external pure returns (uint256 occurrenceCount) {
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](
            tos.length
        );
        for (uint256 i = 0; i < tos.length; i++) {
            calls[i].to = tos[i];
            calls[i].value = values[i];
            calls[i].success = successes[i];
            calls[i].callType = TraceAnalyzer.CallType.CALL;
        }

        VulnerabilityDetector.Vulnerability memory vuln = VulnerabilityDetector
            .detectUncheckedCalls(calls);
        return vuln.occurrenceCount;
    }

    /**
     * @notice Detects dangerous delegatecall
     */
    function detectDangerousDelegatecall(
        address[] memory tos,
        uint8[] memory callTypes
    ) external pure returns (uint256 occurrenceCount) {
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](
            tos.length
        );
        for (uint256 i = 0; i < tos.length; i++) {
            calls[i].to = tos[i];
            calls[i].callType = TraceAnalyzer.CallType(callTypes[i]);
        }

        VulnerabilityDetector.Vulnerability memory vuln = VulnerabilityDetector
            .detectDangerousDelegatecall(calls);
        return vuln.occurrenceCount;
    }

    /**
     * @notice Full vulnerability analysis
     */
    function analyzeVulnerabilities(
        address[] memory tos,
        uint256[] memory values,
        uint8[] memory callTypes,
        bool[] memory successes,
        address[] memory storageContracts
    )
        external
        pure
        returns (
            uint256 totalIssues,
            uint256 criticalCount,
            uint256 highCount,
            uint256 mediumCount,
            uint256 lowCount
        )
    {
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](
            tos.length
        );
        for (uint256 i = 0; i < tos.length; i++) {
            calls[i].to = tos[i];
            calls[i].value = values[i];
            calls[i].callType = TraceAnalyzer.CallType(callTypes[i]);
            calls[i].success = successes[i];
        }

        StateDiffAnalyzer.StateDiff memory stateDiff;
        stateDiff.storageChanges = new StateDiffAnalyzer.StorageChange[](
            storageContracts.length
        );
        for (uint256 i = 0; i < storageContracts.length; i++) {
            stateDiff.storageChanges[i].contractAddress = storageContracts[i];
        }
        stateDiff.balanceChanges = new StateDiffAnalyzer.BalanceChange[](0);
        stateDiff.tokenTransfers = new StateDiffAnalyzer.TokenTransfer[](0);

        VulnerabilityDetector.VulnerabilityReport
            memory report = VulnerabilityDetector.analyzeVulnerabilities(
                calls,
                stateDiff
            );
        return (
            report.totalIssues,
            report.criticalCount,
            report.highCount,
            report.mediumCount,
            report.lowCount
        );
    }
}
