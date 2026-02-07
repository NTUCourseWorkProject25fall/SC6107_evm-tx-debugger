// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title StateDiffAnalyzer
 * @notice Analyzes state changes in Ethereum transactions
 * @dev Tracks storage modifications, balance changes, and token transfers
 */
library StateDiffAnalyzer {
    /// @notice Represents a storage slot change
    struct StorageChange {
        address contractAddress;
        bytes32 slot;
        bytes32 before;
        bytes32 valueAfter;
        string description;
    }

    /// @notice Represents an ETH balance change
    struct BalanceChange {
        address account;
        uint256 before;
        uint256 balanceAfter;
        int256 delta; // Can be negative
    }

    /// @notice Represents a token transfer
    struct TokenTransfer {
        address token;
        address from;
        address to;
        uint256 amount;
        TokenType tokenType;
    }

    /// @notice Types of tokens
    enum TokenType {
        ETH,
        ERC20,
        ERC721,
        ERC1155
    }

    /// @notice Complete state diff analysis
    struct StateDiff {
        StorageChange[] storageChanges;
        BalanceChange[] balanceChanges;
        TokenTransfer[] tokenTransfers;
        uint256 totalStorageChanges;
        uint256 totalBalanceChanges;
        uint256 totalTransfers;
    }

    /**
     * @notice Records a storage slot change
     * @param contractAddr The contract address
     * @param slot The storage slot
     * @param beforeValue The value before the transaction
     * @param afterValue The value after the transaction
     * @return change The storage change record
     */
    function recordStorageChange(
        address contractAddr,
        bytes32 slot,
        bytes32 beforeValue,
        bytes32 afterValue
    ) internal pure returns (StorageChange memory change) {
        change.contractAddress = contractAddr;
        change.slot = slot;
        change.before = beforeValue;
        change.valueAfter = afterValue;
        change.description = _describeStorageChange(slot, beforeValue, afterValue);
    }

    /**
     * @notice Records an ETH balance change
     * @param account The account address
     * @param beforeBalance The balance before
     * @param afterBalance The balance after
     * @return change The balance change record
     */
    function recordBalanceChange(
        address account,
        uint256 beforeBalance,
        uint256 afterBalance
    ) internal pure returns (BalanceChange memory change) {
        change.account = account;
        change.before = beforeBalance;
        change.balanceAfter = afterBalance;
        
        if (afterBalance >= beforeBalance) {
            change.delta = int256(afterBalance - beforeBalance);
        } else {
            change.delta = -int256(beforeBalance - afterBalance);
        }
    }

    /**
     * @notice Records a token transfer
     * @param token The token contract address (address(0) for ETH)
     * @param from The sender address
     * @param to The recipient address
     * @param amount The transfer amount
     * @param tokenType The type of token
     * @return transfer The token transfer record
     */
    function recordTokenTransfer(
        address token,
        address from,
        address to,
        uint256 amount,
        TokenType tokenType
    ) internal pure returns (TokenTransfer memory transfer) {
        transfer.token = token;
        transfer.from = from;
        transfer.to = to;
        transfer.amount = amount;
        transfer.tokenType = tokenType;
    }

    /**
     * @notice Describes a storage change in human-readable format
     * @param slot The storage slot
     * @param before The value before
     * @param afterVal The value after
     * @return description Human-readable description
     */
    function _describeStorageChange(
        bytes32 slot,
        bytes32 before,
        bytes32 afterVal
    ) private pure returns (string memory description) {
        // In production, this would decode based on contract ABI
        // For now, return a generic description
        if (before == bytes32(0) && afterVal != bytes32(0)) {
            return "Storage slot initialized";
        } else if (before != bytes32(0) && afterVal == bytes32(0)) {
            return "Storage slot cleared";
        } else {
            return "Storage slot updated";
        }
    }

    /**
     * @notice Aggregates multiple state diffs
     * @param diffs Array of state diffs to aggregate
     * @return aggregated The combined state diff
     */
    function aggregateStateDiffs(
        StateDiff[] memory diffs
    ) internal pure returns (StateDiff memory aggregated) {
        uint256 totalStorage = 0;
        uint256 totalBalance = 0;
        uint256 totalTransfer = 0;
        
        for (uint256 i = 0; i < diffs.length; i++) {
            totalStorage += diffs[i].storageChanges.length;
            totalBalance += diffs[i].balanceChanges.length;
            totalTransfer += diffs[i].tokenTransfers.length;
        }
        
        aggregated.storageChanges = new StorageChange[](totalStorage);
        aggregated.balanceChanges = new BalanceChange[](totalBalance);
        aggregated.tokenTransfers = new TokenTransfer[](totalTransfer);
        
        uint256 storageIdx = 0;
        uint256 balanceIdx = 0;
        uint256 transferIdx = 0;
        
        for (uint256 i = 0; i < diffs.length; i++) {
            for (uint256 j = 0; j < diffs[i].storageChanges.length; j++) {
                aggregated.storageChanges[storageIdx++] = diffs[i].storageChanges[j];
            }
            for (uint256 j = 0; j < diffs[i].balanceChanges.length; j++) {
                aggregated.balanceChanges[balanceIdx++] = diffs[i].balanceChanges[j];
            }
            for (uint256 j = 0; j < diffs[i].tokenTransfers.length; j++) {
                aggregated.tokenTransfers[transferIdx++] = diffs[i].tokenTransfers[j];
            }
        }
        
        aggregated.totalStorageChanges = totalStorage;
        aggregated.totalBalanceChanges = totalBalance;
        aggregated.totalTransfers = totalTransfer;
    }

    /**
     * @notice Filters state diff by contract address
     * @param diff The state diff to filter
     * @param contractAddr The contract address to filter by
     * @return filtered The filtered state diff
     */
    function filterByContract(
        StateDiff memory diff,
        address contractAddr
    ) internal pure returns (StateDiff memory filtered) {
        uint256 storageCount = 0;
        uint256 transferCount = 0;
        
        // Count matching entries
        for (uint256 i = 0; i < diff.storageChanges.length; i++) {
            if (diff.storageChanges[i].contractAddress == contractAddr) {
                storageCount++;
            }
        }
        
        for (uint256 i = 0; i < diff.tokenTransfers.length; i++) {
            if (diff.tokenTransfers[i].token == contractAddr) {
                transferCount++;
            }
        }
        
        // Allocate arrays
        filtered.storageChanges = new StorageChange[](storageCount);
        filtered.balanceChanges = diff.balanceChanges; // Balance changes are per account, not contract
        filtered.tokenTransfers = new TokenTransfer[](transferCount);
        
        // Copy matching entries
        uint256 storageIdx = 0;
        uint256 transferIdx = 0;
        
        for (uint256 i = 0; i < diff.storageChanges.length; i++) {
            if (diff.storageChanges[i].contractAddress == contractAddr) {
                filtered.storageChanges[storageIdx++] = diff.storageChanges[i];
            }
        }
        
        for (uint256 i = 0; i < diff.tokenTransfers.length; i++) {
            if (diff.tokenTransfers[i].token == contractAddr) {
                filtered.tokenTransfers[transferIdx++] = diff.tokenTransfers[i];
            }
        }
        
        filtered.totalStorageChanges = storageCount;
        filtered.totalBalanceChanges = diff.totalBalanceChanges;
        filtered.totalTransfers = transferCount;
    }
}
