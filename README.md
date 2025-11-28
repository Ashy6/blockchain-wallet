# Blockchain Wallet DApp

一个功能完整的区块链钱包 DApp，支持智能合约交互、ERC-20 代币转账、交易历史查询和 The Graph 数据集成。

## 功能特性

### 1. 合约事件监听（DataLogger）

- **实时事件监听**：监听 DataLogger 合约的 `DataUpdated` 事件
- **合约交互**：调用 `updateData()` 函数更新链上数据
- **事件历史**：显示最近的数据更新记录
- **合约地址（Sepolia）**：`0x4Dd524d4F8fc441eC8844C4F8652AEBa6dD4d972`

### 2. ERC-20 代币转账（USDT）

- **代币余额查询**：实时显示 USDT 余额
- **代币转账**：支持发送 USDT 到任意地址
- **交易状态跟踪**：实时显示交易状态（pending、confirmed、failed）
- **多链支持**：支持 Ethereum、Sepolia、Polygon、Arbitrum、Optimism、Base

### 3. 交易历史查询

- **历史记录**：查询钱包地址的 ERC-20 代币转账历史
- **实时更新**：监听新的转账事件并自动更新列表
- **详细信息**：显示发送方、接收方、金额、时间戳
- **区块浏览器链接**：点击查看详细交易信息

### 4. The Graph 集成

- **Uniswap 数据**：查询 Uniswap V3 热门交易对数据
- **实时价格**：显示代币对的实时价格和流动性
- **Subgraph 指南**：提供完整的 Subgraph 创建教程

## 技术栈

- **React 19** - 前端框架
- **TypeScript** - 类型安全
- **Viem** - 以太坊交互库
- **Wagmi** - React Hooks for Ethereum
- **TanStack Query** - 数据获取和缓存
- **Tailwind CSS** - 样式框架
- **GraphQL** - The Graph 查询
- **Lucide React** - 图标库

## 开始使用

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 配置环境变量（可选但推荐）

为了使用 The Graph 数据查询功能，建议配置 API Key：

1. 复制环境变量模板：
\`\`\`bash
cp .env.example .env
\`\`\`

2. 获取免费 The Graph API Key：
   - 访问 [The Graph Studio](https://thegraph.com/studio/apikeys/)
   - 创建账户并生成 API Key
   - 每月可免费查询 100,000 次

3. 在 \`.env\` 文件中填入你的 API Key：
\`\`\`
VITE_GRAPH_API_KEY=your_api_key_here
\`\`\`

> **注意**：旧的 The Graph Hosted Service 已于 2023 年关闭。现在必须使用去中心化网络，需要 API Key 才能稳定访问。

### 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

## 使用指南

### 1. 连接钱包

点击页面右上角的 "Connect Wallet" 按钮，选择 MetaMask 或其他支持的钱包。

### 2. 切换网络

在 "Overview" 标签页的 "Networks" 卡片中点击想要切换的网络。

### 3. 使用 DataLogger 合约

1. 切换到 "DataLogger" 标签页
2. 确保已连接到 Sepolia 测试网
3. 输入新的数值并点击 "Update"
4. 在 MetaMask 中确认交易

### 4. 转账 ERC-20 代币

1. 切换到 "Token Transfer" 标签页
2. 输入接收地址和转账金额
3. 点击 "Send Tokens" 并确认交易

### 5. 查看交易历史

切换到 "History" 标签页查看最近的交易记录。

### 6. 创建 The Graph Subgraph

切换到 "Subgraph" 标签页查看完整的创建指南。

## 项目结构

\`\`\`
src/
├── components/          # React 组件
│   ├── DataLoggerPanel.tsx
│   ├── TokenTransfer.tsx
│   ├── TransactionHistory.tsx
│   └── SubgraphGuide.tsx
├── contracts/          # 合约 ABI
├── config/             # 配置文件
└── utils/              # 工具函数
\`\`\`

## 相关链接

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [The Graph Documentation](https://thegraph.com/docs/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
