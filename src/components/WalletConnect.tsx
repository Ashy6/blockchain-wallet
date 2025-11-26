import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, Power, Loader2 } from 'lucide-react'

export function WalletConnect() {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-lg">
          <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
          <span className="text-sm font-mono text-gray-300">
            {formatAddress(address)}
          </span>
          {connector && (
            <span className="text-xs text-gray-500">({connector.name})</span>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-300"
        >
          <Power size={16} />
          <span className="text-sm font-semibold">Disconnect</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-gray-400 mb-2">Connect your wallet:</div>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/30 hover:border-neon-blue hover:bg-neon-blue/20 text-white rounded-lg transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Wallet size={20} className="group-hover:scale-110 transition-transform" />
          )}
          <span className="font-semibold">{connector.name}</span>
        </button>
      ))}
    </div>
  )
}
