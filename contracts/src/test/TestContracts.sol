// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title TestContracts
 * @notice Test contracts for demonstrating various transaction patterns
 * @dev These contracts are used for testing the analyzer functionality
 */

/**
 * @title VulnerableContract
 * @notice A contract with intentional vulnerabilities for testing
 */
contract VulnerableContract {
    mapping(address => uint256) public balances;
    address public owner;
    bool public paused;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Deposit function - safe
     */
    function deposit() external payable {
        require(!paused, "Contract is paused");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @notice Withdraw function - VULNERABLE to reentrancy
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // VULNERABILITY: State change after external call
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount;
        emit Withdraw(msg.sender, amount);
    }
    
    /**
     * @notice Unchecked external call - VULNERABLE
     * @param target Target address
     * @param data Call data
     */
    function unsafeCall(address target, bytes calldata data) external {
        // VULNERABILITY: Unchecked call
        target.call(data);
    }
    
    /**
     * @notice Dangerous delegatecall - VULNERABLE
     * @param target Target address
     * @param data Call data
     */
    function dangerousDelegatecall(address target, bytes calldata data) external {
        // VULNERABILITY: Delegatecall without access control
        target.delegatecall(data);
    }
    
    /**
     * @notice Access control issue - VULNERABLE
     * @param newOwner New owner address
     */
    function setOwner(address newOwner) external {
        // VULNERABILITY: Missing access control
        owner = newOwner;
    }
    
    /**
     * @notice Pause function - has access control
     */
    function pause() external {
        require(msg.sender == owner, "Not owner");
        paused = true;
    }
    
    /**
     * @notice Unpause function - has access control
     */
    function unpause() external {
        require(msg.sender == owner, "Not owner");
        paused = false;
    }
}

/**
 * @title SafeContract
 * @notice A contract with proper security patterns
 */
contract SafeContract {
    mapping(address => uint256) public balances;
    address public owner;
    bool public paused;
    bool private locked;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Deposit function - safe
     */
    function deposit() external payable whenNotPaused {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @notice Withdraw function - SECURE with reentrancy guard
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // SECURE: State change before external call (checks-effects-interactions)
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdraw(msg.sender, amount);
    }
    
    /**
     * @notice Safe external call with return value check
     * @param target Target address
     * @param data Call data
     * @return success Whether the call succeeded
     */
    function safeCall(address target, bytes calldata data) external onlyOwner returns (bool success) {
        (success, ) = target.call(data);
        require(success, "Call failed");
    }
    
    /**
     * @notice Transfer ownership - SECURE with access control
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    /**
     * @notice Pause function - SECURE with access control
     */
    function pause() external onlyOwner {
        paused = true;
    }
    
    /**
     * @notice Unpause function - SECURE with access control
     */
    function unpause() external onlyOwner {
        paused = false;
    }
}

/**
 * @title TokenContract
 * @notice Simple ERC-20-like token for testing transfers
 */
contract TokenContract {
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    constructor(uint256 _totalSupply) {
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = _totalSupply;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
