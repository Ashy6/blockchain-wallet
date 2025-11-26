import { useChainId, useSwitchChain } from 'wagmi'
import { Network, Check } from 'lucide-react'

const chainNames: Record<number, string> = {
  1: 'Ethereum',
  11155111: 'Sepolia',
  137: 'Polygon',
  42161: 'Arbitrum',
  10: 'Optimism',
  8453: 'Base',
}

const chainColors: Record<number, string> = {
  1: 'from-blue-500 to-blue-600',
  11155111: 'from-purple-500 to-purple-600',
  137: 'from-purple-600 to-violet-600',
  42161: 'from-cyan-500 to-blue-600',
  10: 'from-red-500 to-red-600',
  8453: 'from-blue-600 to-blue-700',
}

export function NetworkSwitch() {
  const chainId = useChainId()
  const { chains, switchChain } = useSwitchChain()

  return (
    <div className="card-glow rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Network size={24} className="text-neon-blue" />
        <div>
          <h3 className="text-lg font-bold text-white">Networks</h3>
          <p className="text-sm text-gray-400">Switch between chains</p>
        </div>
      </div>

      <div className="space-y-2">
        {chains.map((chain) => {
          const isActive = chain.id === chainId
          return (
            <button
              key={chain.id}
              onClick={() => switchChain({ chainId: chain.id })}
              disabled={isActive}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r ' + (chainColors[chain.id] || 'from-gray-700 to-gray-800') + ' border-transparent'
                  : 'bg-gray-900/50 border-gray-800 hover:border-neon-blue/50 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-white' : 'bg-gray-600'
                }`} />
                <span className={`font-semibold ${
                  isActive ? 'text-white' : 'text-gray-300'
                }`}>
                  {chainNames[chain.id] || chain.name}
                </span>
              </div>
              {isActive && <Check size={18} className="text-white" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
