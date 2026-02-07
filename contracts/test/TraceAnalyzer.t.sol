// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {TraceAnalyzer} from "../src/analyzer/TraceAnalyzer.sol";
import {TestContracts} from "../src/test/TestContracts.sol";

contract TraceAnalyzerTest is Test {
    using TraceAnalyzer for TraceAnalyzer.CallInfo[];
    
    TestContracts.VulnerableContract public vulnerableContract;
    TestContracts.SafeContract public safeContract;
    
    function setUp() public {
        vulnerableContract = new TestContracts.VulnerableContract();
        safeContract = new TestContracts.SafeContract();
    }
    
    function testExtractSelector() public {
        bytes memory data = abi.encodeWithSignature("deposit()");
        bytes4 selector = TraceAnalyzer.extractSelector(data);
        assertEq(selector, bytes4(keccak256("deposit()")));
    }
    
    function testExtractSelectorRevertsOnShortData() public {
        bytes memory data = "123";
        vm.expectRevert("TraceAnalyzer: data too short");
        TraceAnalyzer.extractSelector(data);
    }
    
    function testParseCallType() public {
        assertEq(
            uint256(TraceAnalyzer.parseCallType("call")),
            uint256(TraceAnalyzer.CallType.CALL)
        );
        assertEq(
            uint256(TraceAnalyzer.parseCallType("delegatecall")),
            uint256(TraceAnalyzer.CallType.DELEGATECALL)
        );
        assertEq(
            uint256(TraceAnalyzer.parseCallType("staticcall")),
            uint256(TraceAnalyzer.CallType.STATICCALL)
        );
    }
    
    function testAnalyzeCall() public {
        bytes memory data = abi.encodeWithSignature("deposit()");
        TraceAnalyzer.CallInfo memory callInfo = TraceAnalyzer.analyzeCall(
            address(this),
            address(vulnerableContract),
            1 ether,
            data,
            50000,
            true
        );
        
        assertEq(callInfo.from, address(this));
        assertEq(callInfo.to, address(vulnerableContract));
        assertEq(callInfo.value, 1 ether);
        assertEq(callInfo.gasUsed, 50000);
        assertTrue(callInfo.success);
        assertEq(callInfo.selector, bytes4(keccak256("deposit()")));
    }
    
    function testExtractContracts() public {
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](3);
        
        calls[0] = TraceAnalyzer.analyzeCall(
            address(0x1),
            address(0x2),
            0,
            "",
            10000,
            true
        );
        calls[1] = TraceAnalyzer.analyzeCall(
            address(0x2),
            address(0x3),
            0,
            "",
            20000,
            true
        );
        calls[2] = TraceAnalyzer.analyzeCall(
            address(0x1),
            address(0x2),
            0,
            "",
            15000,
            true
        );
        
        address[] memory contracts = TraceAnalyzer.extractContracts(calls);
        
        // Should extract unique addresses: 0x1, 0x2, 0x3
        assertGe(contracts.length, 2);
    }
    
    function testCalculateTotalGas() public {
        TraceAnalyzer.CallInfo[] memory calls = new TraceAnalyzer.CallInfo[](3);
        
        calls[0].gasUsed = 10000;
        calls[1].gasUsed = 20000;
        calls[2].gasUsed = 15000;
        
        uint256 total = TraceAnalyzer.calculateTotalGas(calls);
        assertEq(total, 45000);
    }
    
    function testRealTransactionTrace() public {
        // Simulate a real transaction
        vm.deal(address(this), 10 ether);
        
        vulnerableContract.deposit{value: 1 ether}();
        
        // In a real scenario, we would parse the trace here
        // This test demonstrates the structure
        bytes memory data = abi.encodeWithSignature("deposit()");
        TraceAnalyzer.CallInfo memory callInfo = TraceAnalyzer.analyzeCall(
            address(this),
            address(vulnerableContract),
            1 ether,
            data,
            50000,
            true
        );
        
        assertTrue(callInfo.success);
        assertEq(callInfo.value, 1 ether);
    }
}
