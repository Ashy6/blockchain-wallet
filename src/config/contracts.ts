// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // DataLogger contract on Sepolia
  dataLogger: {
    11155111: '0x4Dd524d4F8fc441eC8844C4F8652AEBa6dD4d972', // Sepolia
  },

  // USDT contract addresses
  usdt: {
    1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum Mainnet
    11155111: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia (example, replace with actual)
    137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon
    42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum
    10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // Optimism
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base (USDC)
  }
} as const

// Get contract address by name and chain ID
export function getContractAddress(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  chainId: number
): string | undefined {
  const addresses = CONTRACT_ADDRESSES[contractName]
  return addresses[chainId as keyof typeof addresses]
}
