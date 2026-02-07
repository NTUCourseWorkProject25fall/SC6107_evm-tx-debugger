// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title TraceAnalyzer
 * @notice Analyzes Ethereum transaction execution traces
 * @dev Parses trace data to extract call relationships, function selectors, and event logs
 */
library TraceAnalyzer {
    /// @notice Represents a call in the execution trace
    struct CallInfo {
        address from;
        address to;
        uint256 value;
        bytes data;
        bytes4 selector;
        string functionName;
        CallType callType;
        uint256 gasUsed;
        bool success;
    }

    /// @notice Types of calls in EVM
    enum CallType {
        CALL,
        DELEGATECALL,
        STATICCALL,
        CREATE,
        CREATE2
    }

    /// @notice Represents an event log
    struct EventLog {
        address contractAddress;
        bytes32[] topics;
        bytes data;
        string eventName;
        string[] decodedParams;
    }

    /// @notice Represents a complete trace analysis
    struct TraceAnalysis {
        CallInfo[] calls;
        EventLog[] events;
        uint256 totalGasUsed;
        uint256 depth;
        address[] contractsInvolved;
    }

    /**
     * @notice Extracts function selector from call data
     * @param data The call data (must be at least 4 bytes)
     * @return selector The 4-byte function selector
     */
    function extractSelector(bytes memory data) internal pure returns (bytes4 selector) {
        require(data.length >= 4, "TraceAnalyzer: data too short");
        assembly {
            selector := mload(add(data, 0x20))
        }
    }

    /**
     * @notice Determines call type from trace data
     * @param traceType The trace type string
     * @return callType The corresponding CallType enum
     */
    function parseCallType(string memory traceType) internal pure returns (CallType) {
        bytes memory typeBytes = bytes(traceType);
        
        if (keccak256(typeBytes) == keccak256("call")) {
            return CallType.CALL;
        } else if (keccak256(typeBytes) == keccak256("delegatecall")) {
            return CallType.DELEGATECALL;
        } else if (keccak256(typeBytes) == keccak256("staticcall")) {
            return CallType.STATICCALL;
        } else if (keccak256(typeBytes) == keccak256("create")) {
            return CallType.CREATE;
        } else if (keccak256(typeBytes) == keccak256("create2")) {
            return CallType.CREATE2;
        }
        
        revert("TraceAnalyzer: unknown call type");
    }

    /**
     * @notice Analyzes a call trace entry
     * @param from The address making the call
     * @param to The address being called
     * @param value The ETH value being sent
     * @param data The call data
     * @param gasUsed The gas used by this call
     * @param success Whether the call succeeded
     * @return callInfo The analyzed call information
     */
    function analyzeCall(
        address from,
        address to,
        uint256 value,
        bytes memory data,
        uint256 gasUsed,
        bool success
    ) internal pure returns (CallInfo memory callInfo) {
        callInfo.from = from;
        callInfo.to = to;
        callInfo.value = value;
        callInfo.data = data;
        callInfo.gasUsed = gasUsed;
        callInfo.success = success;
        
        if (data.length >= 4) {
            callInfo.selector = extractSelector(data);
        }
        
        // Function name decoding would be done off-chain with ABI
        // This is a placeholder for the analysis framework
        callInfo.functionName = "";
    }

    /**
     * @notice Counts unique contracts involved in a trace
     * @param calls Array of call information
     * @return contracts Array of unique contract addresses
     */
    function extractContracts(CallInfo[] memory calls) internal pure returns (address[] memory contracts) {
        // Simple implementation - in production, use a Set-like structure
        address[] memory temp = new address[](calls.length * 2);
        uint256 count = 0;
        
        for (uint256 i = 0; i < calls.length; i++) {
            bool foundFrom = false;
            bool foundTo = false;
            
            for (uint256 j = 0; j < count; j++) {
                if (temp[j] == calls[i].from) foundFrom = true;
                if (temp[j] == calls[i].to) foundTo = true;
            }
            
            if (!foundFrom && calls[i].from != address(0)) {
                temp[count++] = calls[i].from;
            }
            if (!foundTo && calls[i].to != address(0)) {
                temp[count++] = calls[i].to;
            }
        }
        
        contracts = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            contracts[i] = temp[i];
        }
    }

    /**
     * @notice Calculates total gas used from all calls
     * @param calls Array of call information
     * @return total The sum of all gas used
     */
    function calculateTotalGas(CallInfo[] memory calls) internal pure returns (uint256 total) {
        for (uint256 i = 0; i < calls.length; i++) {
            total += calls[i].gasUsed;
        }
    }
}
