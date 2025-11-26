# 🚀 Cyber Wallet - Blockchain DeFi Wallet

A modern, cyberpunk-styled blockchain wallet built with React, TypeScript, wagmi, and The Graph.

## ✨ Features

- 🔐 **Multi-Wallet Support**: Connect with MetaMask, WalletConnect, or any injected wallet
- 🌐 **Multi-Chain**: Support for Ethereum, Polygon, Arbitrum, Optimism, Base, and Sepolia
- 💸 **Send Transactions**: Easy-to-use interface for sending tokens
- 📊 **The Graph Integration**: Real-time DeFi data from Uniswap V3 subgraphs
- 🎨 **Cyberpunk UI**: Dark theme with neon accents and smooth animations
- ⚡ **Fast & Secure**: Built on wagmi and viem for optimal performance

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Blockchain**: wagmi 3.x + viem 2.x
- **Data**: The Graph (GraphQL)
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Build Tool**: Vite

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### WalletConnect Project ID

To use WalletConnect, update the `projectId` in `src/config/wagmi.ts`:

```typescript
const projectId = 'YOUR_PROJECT_ID' // Get from https://cloud.walletconnect.com
```

### The Graph Subgraphs

Configure subgraph endpoints in `src/config/graph.ts`:

```typescript
export const GRAPH_ENDPOINTS = {
  uniswapV3: 'YOUR_SUBGRAPH_URL',
  aave: 'YOUR_AAVE_SUBGRAPH_URL',
  // Add more subgraphs as needed
}
```

## 🎯 Key Components

### WalletConnect
- Handles wallet connection/disconnection
- Displays connected address
- Shows connection status

### WalletPanel (Right Sidebar)
- Display balance
- Send transactions
- Transaction history (coming soon)
- Token swap interface (coming soon)

### NetworkSwitch
- Switch between supported chains
- Visual network status indicators
- One-click chain switching

### GraphDataDisplay
- Real-time data from The Graph
- Displays top Uniswap V3 pools
- Volume and TVL information
- Auto-refresh capability

## 🎨 UI Theme

The app features a cyberpunk aesthetic with:
- Dark background with animated grid pattern
- Neon color palette (blue, purple, pink, green)
- Glowing effects and smooth transitions
- Custom scrollbar styling
- Responsive design

## 🔐 Supported Networks

- Ethereum Mainnet
- Sepolia Testnet
- Polygon
- Arbitrum
- Optimism
- Base

## 📝 Usage

1. **Connect Wallet**: Click on a wallet provider in the header
2. **Switch Networks**: Use the network switcher to change chains
3. **View Balance**: Check your balance in the right sidebar
4. **Send Tokens**: Fill in recipient and amount, then send
5. **View DeFi Data**: Explore real-time data from The Graph

## 🚧 Future Enhancements

- [ ] Token swap functionality
- [ ] Transaction history with filtering
- [ ] Multi-token support
- [ ] NFT gallery
- [ ] Portfolio analytics
- [ ] Gas optimization suggestions
- [ ] Contract interaction interface
- [ ] More The Graph integrations

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using wagmi, viem, and The Graph
