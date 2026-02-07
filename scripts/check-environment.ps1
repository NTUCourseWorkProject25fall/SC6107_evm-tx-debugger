# Environment Check Script for Windows

Write-Host "🔍 Checking Development Environment" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Node.js not found" -ForegroundColor Red
    Write-Host "     Install from: https://nodejs.org/" -ForegroundColor Gray
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "  ✅ npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ npm not found" -ForegroundColor Red
    $allGood = $false
}

# Check Git
Write-Host "Checking Git..." -ForegroundColor Yellow
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Host "  ✅ Git installed: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Git not found" -ForegroundColor Red
    Write-Host "     Install from: https://git-scm.com/" -ForegroundColor Gray
    $allGood = $false
}

# Check Foundry
Write-Host "Checking Foundry..." -ForegroundColor Yellow
if (Get-Command forge -ErrorAction SilentlyContinue) {
    $forgeVersion = forge --version
    Write-Host "  ✅ Foundry installed: $forgeVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Foundry not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "  📦 Foundry Installation Options:" -ForegroundColor Yellow
    Write-Host "     1. Install WSL: wsl --install" -ForegroundColor White
    Write-Host "        Then in WSL: curl -L https://foundry.paradigm.xyz | bash" -ForegroundColor Gray
    Write-Host "     2. Use Git Bash and run the same command" -ForegroundColor White
    Write-Host "     3. See docs/INSTALLATION_WINDOWS.md for details" -ForegroundColor White
    $allGood = $false
}

# Check WSL (optional but recommended)
Write-Host "Checking WSL..." -ForegroundColor Yellow
if (Get-Command wsl -ErrorAction SilentlyContinue) {
    try {
        $wslVersion = wsl --version 2>&1
        Write-Host "  ✅ WSL is available" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  WSL may not be installed" -ForegroundColor Yellow
        Write-Host "     Recommended for Windows: wsl --install" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️  WSL not found (optional but recommended)" -ForegroundColor Yellow
    Write-Host "     Install with: wsl --install" -ForegroundColor Gray
}

# Check project structure
Write-Host "Checking project structure..." -ForegroundColor Yellow
$requiredDirs = @("contracts", "frontend", "scripts", "docs")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "  ✅ $dir/ exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $dir/ not found" -ForegroundColor Red
        $allGood = $false
    }
}

# Summary
Write-Host ""
if ($allGood) {
    Write-Host "✅ All checks passed! You're ready to proceed." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: .\scripts\install.ps1" -ForegroundColor White
    Write-Host "  2. Set up .env file (copy .env.example)" -ForegroundColor White
    Write-Host "  3. Run tests: cd contracts; forge test" -ForegroundColor White
} else {
    Write-Host "⚠️  Some checks failed. Please install missing dependencies." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For Windows-specific instructions, see:" -ForegroundColor Cyan
    Write-Host "  docs/INSTALLATION_WINDOWS.md" -ForegroundColor White
}
