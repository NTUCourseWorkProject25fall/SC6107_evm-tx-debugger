# Installation script for EVM Transaction Debugger & Analyzer (PowerShell)
# Supports both Foundry and Hardhat. When Foundry is not installed, uses Hardhat path.

Write-Host "Installing EVM Transaction Debugger & Analyzer" -ForegroundColor Cyan
Write-Host ""

$useHardhat = $false

# Check if Foundry is installed
if (Get-Command forge -ErrorAction SilentlyContinue) {
    Write-Host "Foundry is already installed" -ForegroundColor Green
    $forgeVersion = forge --version 2>$null
    if ($forgeVersion) { Write-Host "   Version: $forgeVersion" -ForegroundColor Gray }
    Write-Host ""
} else {
    Write-Host "Foundry is not installed. Using Hardhat path (no Foundry required)." -ForegroundColor Yellow
    Write-Host ""
    $useHardhat = $true
}

# Root directory: install Node dependencies (required for both paths)
Write-Host "Installing root dependencies (Hardhat, ethers, OpenZeppelin)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install root dependencies." -ForegroundColor Red
    exit 1
}
Write-Host ""

if ($useHardhat) {
    # --- Hardhat path: compile contracts with Hardhat ---
    Write-Host "Compiling contracts with Hardhat..." -ForegroundColor Yellow
    npx hardhat compile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Hardhat compile failed. Check contracts in contracts/src." -ForegroundColor Red
        exit 1
    }
    Write-Host ""
} else {
    # --- Foundry path: install OpenZeppelin and build with Forge ---
    Write-Host "Installing OpenZeppelin contracts (Foundry)..." -ForegroundColor Yellow
    Set-Location contracts
    forge install OpenZeppelin/openzeppelin-contracts --no-commit 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Note: OpenZeppelin may already be installed." -ForegroundColor Gray
    }
    Write-Host "Building contracts with Forge..." -ForegroundColor Yellow
    forge build
    Set-Location ..
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Forge build failed." -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend install failed." -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy .env.example to .env and set RPC_URL (e.g. Sepolia or mainnet fork)"
Write-Host "2. Start local fork:"
if ($useHardhat) {
    Write-Host "   Set USE_FORK=true and RPC_URL in .env, then: npm run fork"
    Write-Host "   Or: node scripts/setup-local-fork.js --start"
} else {
    Write-Host "   node scripts/setup-local-fork.js --start"
}
Write-Host "3. Run tests:"
if ($useHardhat) {
    Write-Host "   npm test          (Hardhat)"
} else {
    Write-Host "   npm run test:foundry   (Forge) or npm test (Hardhat)"
}
Write-Host "4. Analyze a transaction: npm run analyze <txHash> [rpcUrl]"
Write-Host "5. Start frontend: npm run frontend:dev"
Write-Host ""
