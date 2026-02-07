# Windows Installation Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- Windows 10/11

---

## Option 2: Hardhat Path (No Foundry Required)

You can run the full project on Windows **without installing Foundry**, using Hardhat and Node.js only.

### Steps

1. **Install dependencies (PowerShell, from project root):**
   ```powershell
   .\scripts\install.ps1
   ```
   The script will detect that Foundry is not installed and will:
   - Run `npm install` (Hardhat, ethers, OpenZeppelin)
   - Compile contracts with `npx hardhat compile`
   - Install frontend dependencies

2. **Configure environment:**
   ```powershell
   copy .env.example .env
   ```
   Edit `.env` and set `RPC_URL` (e.g. Sepolia or Alchemy/Infura URL).

3. **Run tests:**
   ```powershell
   npm test
   ```
   (Runs Hardhat tests in `contracts/test-hardhat/`.)

4. **Start local fork (optional):**
   ```powershell
   node scripts/setup-local-fork.js --start --rpc-url "https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
   ```
   Or set `USE_FORK=true` and `RPC_URL` in `.env`, then:
   ```powershell
   npm run fork
   ```

5. **Analyze a transaction:**
   ```powershell
   node scripts/analyze-transaction.js <TX_HASH> [RPC_URL]
   ```

6. **Start frontend:**
   ```powershell
   npm run frontend:dev
   ```

### Scripts (Hardhat path)

| Command | Description |
|--------|-------------|
| `npm run build` | Compile contracts (Hardhat) |
| `npm test` | Run Hardhat tests |
| `npm run analyze <txHash>` | Analyze transaction (needs RPC) |
| `npm run fork` | Start Hardhat node (with fork if USE_FORK=true) |
| `npm run frontend:dev` | Start Next.js frontend |

---

## Option 1: Installing Foundry on Windows

Foundry cannot be installed directly in PowerShell or Command Prompt. You need to use one of the following methods:

### Method 1: Using WSL (Windows Subsystem for Linux) - Recommended

**Step 1: Install WSL**

Open PowerShell as Administrator and run:
```powershell
wsl --install
```

Restart your computer when prompted.

**Step 2: Open WSL Terminal**

After restart, open Ubuntu (or your WSL distribution) from the Start menu.

**Step 3: Install Foundry**

In the WSL terminal, run:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Step 4: Verify Installation**

```bash
forge --version
cast --version
anvil --version
```

**Step 5: Add to Windows PATH (Optional)**

If you want to use Foundry from PowerShell, add WSL to your PATH or create aliases.

### Method 2: Using Git Bash

**Step 1: Open Git Bash**

Right-click in your project folder and select "Git Bash Here"

**Step 2: Install Foundry**

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Step 3: Verify Installation**

```bash
forge --version
```

**Note:** You'll need to use Git Bash for all Foundry commands.

### Method 3: Manual Download

**Step 1: Download Foundry**

Visit: https://github.com/foundry-rs/foundry/releases

Download the latest Windows release (foundry_nightly_windows_amd64.tar.gz)

**Step 2: Extract**

Extract the archive to a folder (e.g., `C:\foundry`)

**Step 3: Add to PATH**

1. Open System Properties → Environment Variables
2. Edit the `Path` variable
3. Add the path to the extracted folder (e.g., `C:\foundry`)
4. Click OK

**Step 4: Verify**

Open a new PowerShell window:
```powershell
forge --version
```

## Installing Project Dependencies

### Option A: Using PowerShell (After Foundry is installed)

```powershell
.\scripts\install.ps1
```

### Option B: Manual Installation

**1. Install OpenZeppelin Contracts**

If using WSL or Git Bash:
```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

**2. Build Contracts**

```bash
cd contracts
forge build
```

**3. Install Frontend Dependencies**

```powershell
cd frontend
npm install
```

## Running the Project

### Start Local Fork (WSL/Git Bash)

```bash
anvil --fork-url https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

### Run Tests (WSL/Git Bash)

```bash
cd contracts
forge test -vv
```

### Start Frontend (PowerShell)

```powershell
cd frontend
npm run dev
```

## Troubleshooting

### "forge: command not found"

- Make sure Foundry is installed and in your PATH
- If using WSL, make sure you're in the WSL terminal
- If using Git Bash, make sure you installed Foundry in Git Bash

### "Permission denied"

- Make sure you have write permissions in the project directory
- Try running as Administrator (if needed)

### "Cannot connect to RPC"

- Check your RPC URL in `.env` file
- Make sure your API key is valid
- For local fork, make sure Anvil is running

## Recommended Setup

For the best experience on Windows:

1. **Install WSL** and use it for all Foundry commands
2. **Use PowerShell** for Node.js/npm commands
3. **Use VS Code** with Remote-WSL extension for seamless development

## VS Code Integration

1. Install the "Remote - WSL" extension
2. Open your project folder in WSL: `File → Open Folder in WSL`
3. Install the "Solidity" extension for syntax highlighting
4. All Foundry commands will work seamlessly

## Next Steps

After installation:

1. Copy `.env.example` to `.env` and fill in your RPC URL
2. Run tests: `forge test`
3. Start frontend: `npm run frontend:dev`
4. Start local fork: `anvil --fork-url <YOUR_RPC_URL>`
