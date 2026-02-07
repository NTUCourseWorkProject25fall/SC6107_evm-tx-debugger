// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {StateDiffAnalyzer} from "../src/analyzer/StateDiffAnalyzer.sol";
import {TestContracts} from "../src/test/TestContracts.sol";

contract StateDiffAnalyzerTest is Test {
    using StateDiffAnalyzer for StateDiffAnalyzer.StateDiff;
    
    TestContracts.VulnerableContract public vulnerableContract;
    TestContracts.SafeContract public safeContract;
    TestContracts.TokenContract public tokenContract;
    
    function setUp() public {
        vulnerableContract = new TestContracts.VulnerableContract();
        safeContract = new TestContracts.SafeContract();
        tokenContract = new TestContracts.TokenContract(1000000 ether);
    }
    
    function testRecordStorageChange() public {
        bytes32 slot = keccak256(abi.encode(address(this), uint256(0)));
        bytes32 before = bytes32(0);
        bytes32 afterVal = bytes32(uint256(1 ether));
        
        StateDiffAnalyzer.StorageChange memory change = StateDiffAnalyzer.recordStorageChange(
            address(vulnerableContract),
            slot,
            before,
            afterVal
        );
        
        assertEq(change.contractAddress, address(vulnerableContract));
        assertEq(change.slot, slot);
        assertEq(change.before, before);
        assertEq(change.valueAfter, afterVal);
    }
    
    function testRecordBalanceChange() public {
        uint256 before = 0;
        uint256 afterBal = 1 ether;
        
        StateDiffAnalyzer.BalanceChange memory change = StateDiffAnalyzer.recordBalanceChange(
            address(this),
            before,
            afterBal
        );
        
        assertEq(change.account, address(this));
        assertEq(change.before, before);
        assertEq(change.balanceAfter, afterBal);
        assertEq(change.delta, int256(1 ether));
    }
    
    function testRecordBalanceChangeNegative() public {
        uint256 before = 2 ether;
        uint256 afterBal = 1 ether;
        
        StateDiffAnalyzer.BalanceChange memory change = StateDiffAnalyzer.recordBalanceChange(
            address(this),
            before,
            afterBal
        );
        
        assertEq(change.delta, -int256(1 ether));
    }
    
    function testRecordTokenTransfer() public {
        StateDiffAnalyzer.TokenTransfer memory transfer = StateDiffAnalyzer.recordTokenTransfer(
            address(tokenContract),
            address(this),
            address(0x1),
            100 ether,
            StateDiffAnalyzer.TokenType.ERC20
        );
        
        assertEq(transfer.token, address(tokenContract));
        assertEq(transfer.from, address(this));
        assertEq(transfer.to, address(0x1));
        assertEq(transfer.amount, 100 ether);
        assertEq(uint256(transfer.tokenType), uint256(StateDiffAnalyzer.TokenType.ERC20));
    }
    
    function testAggregateStateDiffs() public {
        StateDiffAnalyzer.StateDiff[] memory diffs = new StateDiffAnalyzer.StateDiff[](2);
        
        // First diff
        diffs[0].storageChanges = new StateDiffAnalyzer.StorageChange[](1);
        diffs[0].storageChanges[0] = StateDiffAnalyzer.recordStorageChange(
            address(vulnerableContract),
            bytes32(uint256(0)),
            bytes32(0),
            bytes32(uint256(1))
        );
        
        diffs[0].balanceChanges = new StateDiffAnalyzer.BalanceChange[](1);
        diffs[0].balanceChanges[0] = StateDiffAnalyzer.recordBalanceChange(
            address(this),
            0,
            1 ether
        );
        
        // Second diff
        diffs[1].storageChanges = new StateDiffAnalyzer.StorageChange[](1);
        diffs[1].storageChanges[0] = StateDiffAnalyzer.recordStorageChange(
            address(safeContract),
            bytes32(uint256(0)),
            bytes32(0),
            bytes32(uint256(2))
        );
        
        diffs[1].tokenTransfers = new StateDiffAnalyzer.TokenTransfer[](1);
        diffs[1].tokenTransfers[0] = StateDiffAnalyzer.recordTokenTransfer(
            address(tokenContract),
            address(this),
            address(0x1),
            100 ether,
            StateDiffAnalyzer.TokenType.ERC20
        );
        
        StateDiffAnalyzer.StateDiff memory aggregated = StateDiffAnalyzer.aggregateStateDiffs(diffs);
        
        assertEq(aggregated.storageChanges.length, 2);
        assertEq(aggregated.balanceChanges.length, 1);
        assertEq(aggregated.tokenTransfers.length, 1);
    }
    
    function testFilterByContract() public {
        StateDiffAnalyzer.StateDiff memory diff;
        
        diff.storageChanges = new StateDiffAnalyzer.StorageChange[](3);
        diff.storageChanges[0] = StateDiffAnalyzer.recordStorageChange(
            address(vulnerableContract),
            bytes32(uint256(0)),
            bytes32(0),
            bytes32(uint256(1))
        );
        diff.storageChanges[1] = StateDiffAnalyzer.recordStorageChange(
            address(safeContract),
            bytes32(uint256(0)),
            bytes32(0),
            bytes32(uint256(2))
        );
        diff.storageChanges[2] = StateDiffAnalyzer.recordStorageChange(
            address(vulnerableContract),
            bytes32(uint256(1)),
            bytes32(0),
            bytes32(uint256(3))
        );
        
        diff.tokenTransfers = new StateDiffAnalyzer.TokenTransfer[](2);
        diff.tokenTransfers[0] = StateDiffAnalyzer.recordTokenTransfer(
            address(vulnerableContract),
            address(this),
            address(0x1),
            100 ether,
            StateDiffAnalyzer.TokenType.ERC20
        );
        diff.tokenTransfers[1] = StateDiffAnalyzer.recordTokenTransfer(
            address(safeContract),
            address(this),
            address(0x2),
            200 ether,
            StateDiffAnalyzer.TokenType.ERC20
        );
        
        StateDiffAnalyzer.StateDiff memory filtered = StateDiffAnalyzer.filterByContract(
            diff,
            address(vulnerableContract)
        );
        
        assertEq(filtered.storageChanges.length, 2);
        assertEq(filtered.tokenTransfers.length, 1);
    }
    
    function testRealTransactionStateDiff() public {
        vm.deal(address(this), 10 ether);
        
        uint256 beforeBalance = address(vulnerableContract).balance;
        vulnerableContract.deposit{value: 1 ether}();
        uint256 afterBalance = address(vulnerableContract).balance;
        
        StateDiffAnalyzer.BalanceChange memory balanceChange = StateDiffAnalyzer.recordBalanceChange(
            address(vulnerableContract),
            beforeBalance,
            afterBalance
        );
        
        assertEq(balanceChange.delta, int256(1 ether));
    }
}
