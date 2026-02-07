# Gas Optimization Guide

## Overview

This document explains the gas optimization analysis capabilities of the EVM Transaction Debugger & Analyzer, including optimization techniques, detection algorithms, and recommendations.

## Gas Cost Fundamentals

### EVM Gas Costs (EIP-150 and later)

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| SSTORE (new) | 20,000 | First write to storage slot |
| SSTORE (dirty) | 5,000 | Update existing non-zero value |
| SSTORE (reset) | -15,000 | Reset to zero (refund) |
| SLOAD | 2,100 | Read from storage |
| CALL | 700 | Base cost for external call |
| DELEGATECALL | 700 | Base cost for delegatecall |
| STATICCALL | 700 | Base cost for staticcall |
| Memory expansion | 3 per word | Per 32-byte word |
| LOG0 | 375 | Event without topics |
| LOG1 | 750 | Event with 1 topic |
| LOG2 | 1,125 | Event with 2 topics |
| LOG3 | 1,500 | Event with 3 topics |
| LOG4 | 1,875 | Event with 4 topics |

## Optimization Categories

### 1. Storage Optimization

#### Problem: Excessive Storage Operations

Storage is the most expensive operation in EVM. Each storage write costs 20,000 gas (first write) or 5,000 gas (update).

#### Detection

The GasProfiler identifies:
- High number of storage operations
- Redundant storage writes
- Storage reads that could use memory

#### Optimization Techniques

**A. Use Memory for Intermediate Values**

```solidity
// ❌ BAD: Multiple storage writes
function process(uint256 value) external {
    storageValue = value;
    storageValue = storageValue * 2;
    storageValue = storageValue + 1;
}

// ✅ GOOD: Use memory for calculations
function process(uint256 value) external {
    uint256 temp = value;
    temp = temp * 2;
    temp = temp + 1;
    storageValue = temp;  // Single storage write
}
```

**B. Pack Storage Variables**

```solidity
// ❌ BAD: Multiple storage slots
struct User {
    uint256 balance;      // Slot 0
    uint256 timestamp;    // Slot 1
    bool active;          // Slot 2
}

// ✅ GOOD: Packed into fewer slots
struct User {
    uint128 balance;      // Slot 0 (128 bits)
    uint64 timestamp;     // Slot 0 (64 bits)
    bool active;          // Slot 0 (8 bits)
    // 56 bits unused
}
```

**C. Use Events Instead of Storage**

```solidity
// ❌ BAD: Store historical data in storage
mapping(uint256 => uint256) public history;

// ✅ GOOD: Emit events for historical data
event HistoryUpdated(uint256 indexed index, uint256 value);
```

### 2. External Call Optimization

#### Problem: High Number of External Calls

Each external call has a base cost of 700 gas plus additional costs for data transfer.

#### Detection

The GasProfiler flags:
- Functions with >5 external calls
- Calls that could be batched
- Redundant calls to the same contract

#### Optimization Techniques

**A. Batch Calls**

```solidity
// ❌ BAD: Multiple separate calls
function transferMultiple(address[] memory recipients, uint256[] memory amounts) external {
    for (uint256 i = 0; i < recipients.length; i++) {
        token.transfer(recipients[i], amounts[i]);  // Multiple calls
    }
}

// ✅ GOOD: Single batch call
function transferMultiple(address[] memory recipients, uint256[] memory amounts) external {
    token.transferBatch(recipients, amounts);  // Single call
}
```

**B. Use Multicall Pattern**

```solidity
// ✅ GOOD: Multicall for multiple operations
function multicall(bytes[] calldata calls) external returns (bytes[] memory results) {
    results = new bytes[](calls.length);
    for (uint256 i = 0; i < calls.length; i++) {
        (bool success, bytes memory result) = address(this).delegatecall(calls[i]);
        require(success, "Multicall failed");
        results[i] = result;
    }
}
```

**C. Cache External Call Results**

```solidity
// ❌ BAD: Multiple calls to same function
function process() external {
    uint256 balance1 = token.balanceOf(user1);
    uint256 balance2 = token.balanceOf(user2);
    uint256 total = token.balanceOf(user1) + token.balanceOf(user2);  // Redundant call
}

// ✅ GOOD: Cache results
function process() external {
    uint256 balance1 = token.balanceOf(user1);
    uint256 balance2 = token.balanceOf(user2);
    uint256 total = balance1 + balance2;
}
```

### 3. Memory Optimization

#### Problem: Excessive Memory Operations

Memory expansion costs 3 gas per 32-byte word.

#### Detection

The GasProfiler identifies:
- Large memory allocations
- Unnecessary memory copies
- Arrays that could be calldata

#### Optimization Techniques

**A. Use Calldata for Arrays**

```solidity
// ❌ BAD: Memory array (copies data)
function process(uint256[] memory data) external {
    // data is copied to memory
}

// ✅ GOOD: Calldata array (no copy)
function process(uint256[] calldata data) external {
    // data is read directly from calldata
}
```

**B. Avoid Unnecessary Copies**

```solidity
// ❌ BAD: Unnecessary memory copy
function process(bytes memory data) external {
    bytes memory copy = data;  // Unnecessary copy
    // process copy
}

// ✅ GOOD: Use original
function process(bytes calldata data) external {
    // process data directly
}
```

### 4. Computation Optimization

#### Problem: Expensive Computations

Complex calculations can consume significant gas.

#### Detection

The GasProfiler flags:
- Functions with high computation gas usage
- Loops that could be optimized
- Redundant calculations

#### Optimization Techniques

**A. Use Unchecked Blocks**

```solidity
// ❌ BAD: Automatic overflow checks (costs gas)
function increment(uint256 x) external pure returns (uint256) {
    return x + 1;  // Automatic overflow check
}

// ✅ GOOD: Unchecked for known-safe operations
function increment(uint256 x) external pure returns (uint256) {
    unchecked {
        return x + 1;  // No overflow check
    }
}
```

**B. Optimize Loops**

```solidity
// ❌ BAD: Multiple storage reads in loop
function sum() external view returns (uint256) {
    uint256 total = 0;
    for (uint256 i = 0; i < array.length; i++) {
        total += array[i];  // Storage read in loop
    }
    return total;
}

// ✅ GOOD: Cache array length
function sum() external view returns (uint256) {
    uint256 length = array.length;  // Cache length
    uint256 total = 0;
    for (uint256 i = 0; i < length; i++) {
        total += array[i];
    }
    return total;
}
```

**C. Use Bitwise Operations**

```solidity
// ❌ BAD: Division
function divide(uint256 x) external pure returns (uint256) {
    return x / 2;
}

// ✅ GOOD: Bit shift (cheaper)
function divide(uint256 x) external pure returns (uint256) {
    return x >> 1;  // Right shift by 1 = divide by 2
}
```

## Gas Profiling Analysis

### Function-Level Analysis

The GasProfiler provides per-function analysis:

1. **Total Gas**: Sum of all gas used by function calls
2. **Call Count**: Number of times function was called
3. **Breakdown**: Gas usage by category (storage, calls, memory, computation)
4. **Hints**: Optimization suggestions specific to the function

### Global Analysis

The GasProfiler identifies:

1. **Top Gas Consumers**: Functions using the most gas
2. **Optimization Opportunities**: Global patterns that could be optimized
3. **Efficiency Metrics**: Gas usage efficiency percentage

## Optimization Hints

### Storage Hints

- **High Storage Operations**: "Consider using memory variables for intermediate calculations"
- **Redundant Writes**: "Multiple writes to same slot detected - batch into single write"
- **Unused Storage**: "Storage variable never read - consider removing"

### External Call Hints

- **High Call Count**: "Consider batching calls or using multicall pattern"
- **Redundant Calls**: "Same function called multiple times - cache result"
- **Expensive Calls**: "External call in loop - consider batching"

### Memory Hints

- **Large Allocations**: "Large memory array - consider using calldata"
- **Unnecessary Copies**: "Memory copy detected - use calldata if possible"

### Computation Hints

- **Expensive Operations**: "Complex calculation detected - consider optimization"
- **Loop Optimization**: "Loop with storage reads - cache values outside loop"
- **Unchecked Opportunities**: "Safe arithmetic operation - consider unchecked block"

## Best Practices

1. **Profile First**: Always profile before optimizing
2. **Measure Impact**: Verify gas savings after optimization
3. **Test Thoroughly**: Ensure optimizations don't break functionality
4. **Document Changes**: Document why optimizations were made
5. **Balance Readability**: Don't sacrifice code clarity for minor gas savings

## Tools and Resources

- **Foundry Gas Reports**: `forge test --gas-report`
- **Hardhat Gas Reporter**: Plugin for gas reporting
- **Tenderly**: Gas profiling and optimization
- **Eth Gas Station**: Current gas prices

## References

- [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf)
- [EIP-150](https://eips.ethereum.org/EIPS/eip-150)
- [Gas Optimization Techniques](https://docs.soliditylang.org/en/latest/gas-optimization.html)
- [OpenZeppelin Gas Optimization](https://docs.openzeppelin.com/contracts/security)
