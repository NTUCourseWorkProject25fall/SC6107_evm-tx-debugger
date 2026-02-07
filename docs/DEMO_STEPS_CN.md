# EVM 交易调试与分析平台 — 中文演示操作步骤

**课程：** SC6107 Blockchain Development Fundamentals (Part 2)  
**项目：** Option 7 — EVM Transaction Debugger & Analyzer

---

## 一、环境准备（约 5 分钟）

### 1.1 前置要求

- **Node.js 18+**（已安装并加入 PATH）
- **Git**
- **Windows**：PowerShell 或命令提示符  
- **可选**：Foundry（若使用 WSL/Git Bash）；不装 Foundry 也可用 Hardhat 路径完成全部演示

### 1.2 安装项目依赖

在项目根目录打开终端，执行：

```powershell
# Windows PowerShell（推荐，无需 Foundry）
.\scripts\install.ps1
```

脚本会自动：

- 检测是否安装 Foundry  
  - **未安装**：走 Hardhat 路径，执行 `npm install` 和 `npx hardhat compile`  
  - **已安装**：走 Foundry 路径，安装 OpenZeppelin 并执行 `forge build`
- 安装前端依赖（`frontend` 目录下 `npm install`）

安装完成后，根目录会出现 `node_modules`、`artifacts`（或 `contracts/out`）等。

### 1.3 配置环境变量（可选，用于真实链上分析）

复制示例环境文件并编辑：

```powershell
copy .env.example .env
# 用记事本或 VS Code 打开 .env，设置：
# RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
# 若不设置，前端仍可运行，API 将返回演示用 Mock 数据
```

---

## 二、启动前端并演示分析（约 3 分钟）

### 2.1 启动开发服务器

在项目根目录执行：

```powershell
npm run frontend:dev
```

或：

```powershell
cd frontend
npm run dev
```

浏览器访问：**http://localhost:3000**。

### 2.2 页面说明

- 顶部标题：**EVM Transaction Debugger & Analyzer**
- 下方为说明文字与一个输入框：**Enter transaction hash (0x...)**
- 右侧有 **Analyze** 按钮

### 2.3 演示分析流程

**方式 A：无 RPC（演示模式，推荐先演示）**

1. 在输入框随意输入一个**合法格式**的交易哈希，例如：  
   `0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
2. 点击 **Analyze**。
3. 等待 1–2 秒，页面会展示 Mock 分析结果，包括：
   - **Transaction Analysis** 摘要（交易哈希、Gas 使用、漏洞数量）
   - **Execution Trace**（调用列表、类型、Gas）
   - **Gas Profile**（图表与优化建议）
   - **State Changes**（Storage / Balances / Transfers 标签）
   - **Vulnerability Report**（漏洞列表与建议）

**方式 B：有 RPC（真实链上分析）**

1. 确保 `.env` 中已设置 `RPC_URL`（如 Sepolia）。
2. 在输入框输入该链上的**真实交易哈希**（可从区块浏览器复制）。
3. 点击 **Analyze**。
4. 页面会显示基于 `debug_traceTransaction` 的真实追踪、Gas 与启发式漏洞提示。

### 2.4 导出报告（加分功能）

分析结果出现后，在 **Transaction Analysis** 标题右侧可见两个按钮：

- **Export JSON**：下载完整分析结果的 JSON 文件（如 `analysis-aaaaaaaaaaaa.json`）。
- **Export Markdown**：下载可读的 Markdown 报告（如 `analysis-aaaaaaaaaaaa.md`）。

可任选一个点击，确认浏览器下载即可完成演示。

---

## 三、运行测试（约 2 分钟）

### 3.1 前端测试（Jest）

在项目根目录或 `frontend` 目录执行：

```powershell
npm test
# 或
cd frontend
npm test
```

应看到多行 `PASS`，以及类似：

- **Test Suites: 9 passed, 9 total**
- **Tests: 50 passed, 50 total**

### 3.2 查看覆盖率

```powershell
cd frontend
npm run test:coverage
```

终端会输出各文件覆盖率；**Lines 约 87%+**，满足课程 80% 要求。

### 3.3 合约测试（若已安装 Foundry）

在项目根目录执行：

```powershell
forge test -vv
```

或使用 Hardhat：

```powershell
npx hardhat test
```

---

## 四、命令行分析脚本（可选，约 1 分钟）

若已配置 `RPC_URL` 或可提供 RPC URL，可在项目根目录执行：

```powershell
node scripts/analyze-transaction.js <交易哈希> [RPC_URL]
```

示例：

```powershell
node scripts/analyze-transaction.js 0x你的交易哈希 https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

脚本会输出交易基本信息、Trace 获取情况，并在 `output/` 目录下生成 trace 与 report 的 JSON 文件（若节点支持 `debug_traceTransaction`）。

---

## 五、本地 Fork 启动（可选）

若需在本地复现主网/Sepolia 状态并分析历史交易：

**使用 Hardhat（无需 Foundry）：**

1. 在 `.env` 中设置：  
   `RPC_URL=https://...`  
   `USE_FORK=true`
2. 在项目根目录执行：  
   `npm run fork`  
   或：  
   `node scripts/setup-local-fork.js --start --rpc-url "你的RPC_URL"`

本地节点默认在 **http://localhost:8545**。前端或脚本可将 RPC 指向该地址进行分析。

---

## 六、演示顺序建议（5 分钟版）

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 打开 http://localhost:3000 | 展示项目标题与输入框 |
| 2 | 输入示例哈希，点击 Analyze | 展示 Mock 分析结果 |
| 3 | 依次指出 Trace / Gas / State Diff / Vulnerability | 说明四大核心功能 |
| 4 | 点击 Export JSON 或 Export Markdown | 展示可导出报告 |
| 5 | 在终端运行 `npm test`（frontend） | 展示测试通过与覆盖率 |

---

## 七、常见问题

- **Analyze 后一直转圈或报错**  
  - 无 RPC：使用示例哈希 `0xaa...aa`（64 个 a）即可走 Mock。  
  - 有 RPC：检查 `.env` 中 `RPC_URL` 是否正确、网络是否可达。

- **install.ps1 提示找不到 forge**  
  - 正常。脚本会自动使用 Hardhat 路径，无需安装 Foundry。

- **Export 没反应**  
  - 检查浏览器是否拦截下载；允许该站点下载或换用无痕窗口重试。

- **端口 3000 被占用**  
  - 在 `frontend` 目录执行：`npm run dev -- -p 3001`，然后访问 http://localhost:3001。

---

**文档版本：** 1.0  
**最后更新：** 与项目 README 及 docs 保持一致。
