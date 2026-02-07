// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {GasProfiler} from "../src/analyzer/GasProfiler.sol";
import {TraceAnalyzer} from "../src/analyzer/TraceAnalyzer.sol";
import {TestContracts} from "../src/test/TestContracts.sol";

contract GasProfilerTest is Test {
    using GasProfiler for TraceAnalyzer.CallInfo[];
    
    TestContracts.VulnerableContract public vulnerableContract;
    TestContracts.SafeContract public safeContract;
    
    function setUp() public {
        vulnerableContract = new TestContracts.VulnerableContract();
        safeContract = new TestContracts.SafeContract();
    }
    
    function testAnalyzeGasUsage() public {
        vm.deal(address(this), 10 ether);
        
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](2);
        
        bytes memory depositData = abi.encodeWithSignature("deposit()");
        calls[0] = TraceAnalyzer.analyzeCall(
            address(this),
            address(vulnerableContract),
            1 ether,
            depositData,
            65000,
            true
        );
        
        bytes memory withdrawData = abi.encodeWithSignature("withdraw(uint256)", 0.5 ether);
        calls[1] = TraceAnalyzer.analyzeCall(
            address(this),
            address(vulnerableContract),
            0,
            withdrawData,
            85000,
            true
        );
        
        GasProfiler.GasProfile memory profile = GasProfiler.analyzeGasUsage(calls);
        
        assertEq(profile.totalGas, 150000);
        assertGt(profile.functionAnalyses.length, 0);
    }
    
    function testGetTopGasConsumers() public {
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](5);
        
        // Create calls with different gas usage
        for (uint256 i = 0; i < 5; i++) {
            bytes memory data = abi.encodeWithSignature("function(uint256)", i);
            calls[i] = TraceAnalyzer.analyzeCall(
                address(this),
                address(vulnerableContract),
                0,
                data,
                10000 * (i + 1), // Increasing gas
                true
            );
        }
        
        GasProfiler.GasProfile memory profile = GasProfiler.analyzeGasUsage(calls);
        GasProfiler.FunctionGasAnalysis[] memory top = GasProfiler.getTopGasConsumers(profile, 3);
        
        assertLe(top.length, 3);
        if (top.length > 1) {
            assertGe(top[0].totalGas, top[1].totalGas);
        }
    }
    
    function testGasOptimizationHints() public {
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](10);
        
        // Create many calls to trigger optimization hints
        for (uint256 i = 0; i < 10; i++) {
            bytes memory data = abi.encodeWithSignature("function()");
            calls[i] = TraceAnalyzer.analyzeCall(
                address(this),
                address(vulnerableContract),
                0,
                data,
                50000,
                true
            );
        }
        
        GasProfiler.GasProfile memory profile = GasProfiler.analyzeGasUsage(calls);
        
        // Should generate hints for high call count
        assertGt(profile.globalHints.length, 0);
    }
    
    function testFunctionGasBreakdown() public {
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](1);
        
        bytes memory data = abi.encodeWithSignature("deposit()");
        calls[0] = TraceAnalyzer.analyzeCall(
            address(this),
            address(vulnerableContract),
            1 ether,
            data,
            65000,
            true
        );
        calls[0].callType = TraceAnalyzer.CallType.CALL;
        
        GasProfiler.GasProfile memory profile = GasProfiler.analyzeGasUsage(calls);
        
        assertEq(profile.functionAnalyses.length, 1);
        assertGt(profile.functionAnalyses[0].totalGas, 0);
    }
}
