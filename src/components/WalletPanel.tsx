import { useState } from 'react'
import { useAccount, useBalance, useChainId, useSendTransaction, useWriteContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import {
  Send,
  ArrowDownUp,
  History,
  Coins,
  TrendingUp,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react'

export function WalletPanel() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const { sendTransaction, isPending, isSuccess, isError, data: txHash } = useSendTransaction()

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'send' | 'swap' | 'history'>('send')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !amount) return

    try {
      sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      })
    } catch (error) {
      console.error('Send transaction error:', error)
    }
  }

  const getExplorerUrl = (hash: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      11155111: 'https://sepolia.etherscan.io/tx/',
      137: 'https://polygonscan.com/tx/',
      42161: 'https://arbiscan.io/tx/',
      10: 'https://optimistic.etherscan.io/tx/',
      8453: 'https://basescan.org/tx/',
    }
    return explorers[chainId] ? `${explorers[chainId]}${hash}` : '#'
  }

  if (!isConnected) {
    return (
      <div className="w-96 bg-gray-900/30 backdrop-blur-md border-l border-gray-800 p-6 flex items-center justify-center">
        <div className="text-center">
          <Coins size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">Connect your wallet to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-96 bg-gray-900/30 backdrop-blur-md border-l border-gray-800 flex flex-col">
      {/* Balance Section */}
      <div className="p-6 border-b border-gray-800">
        <div className="mb-2 text-sm text-gray-400">Total Balance</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-neon">
            {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000'}
          </span>
          <span className="text-lg text-gray-500">{balance?.symbol || 'ETH'}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <TrendingUp size={14} className="text-neon-green" />
          <span className="text-sm text-gray-400">≈ $0.00 USD</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {[
          { id: 'send', label: 'Send', icon: Send },
          { id: 'swap', label: 'Swap', icon: ArrowDownUp },
          { id: 'history', label: 'History', icon: History },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-all duration-300 ${
              activeTab === id
                ? 'bg-neon-blue/10 border-b-2 border-neon-blue text-neon-blue'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={18} />
            <span className="font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'send' && (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="input-cyber w-full rounded-lg"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount ({balance?.symbol || 'ETH'})
              </label>
              <input
                type="number"
                step="0.000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="input-cyber w-full rounded-lg"
                disabled={isPending}
              />
              {balance && (
                <button
                  type="button"
                  onClick={() => setAmount(formatEther(balance.value))}
                  className="text-xs text-neon-blue hover:text-neon-purple mt-1"
                >
                  Max: {parseFloat(formatEther(balance.value)).toFixed(6)}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || !recipient || !amount}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Send Transaction</span>
                </>
              )}
            </button>

            {/* Transaction Status */}
            {isSuccess && txHash && (
              <div className="flex items-start gap-3 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                <CheckCircle size={20} className="text-neon-green flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-neon-green mb-1">
                    Transaction Sent!
                  </div>
                  <a
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-neon-blue flex items-center gap-1 break-all"
                  >
                    <span className="truncate">{txHash}</span>
                    <ExternalLink size={12} className="flex-shrink-0" />
                  </a>
                </div>
              </div>
            )}

            {isError && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-400">
                    Transaction Failed
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Please try again or check your balance
                  </div>
                </div>
              </div>
            )}
          </form>
        )}

        {activeTab === 'swap' && (
          <div className="text-center py-12">
            <ArrowDownUp size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500">Swap feature coming soon</p>
            <p className="text-sm text-gray-600 mt-2">
              Integrate with Uniswap or other DEX protocols
            </p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="text-center py-12">
            <History size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500">No transaction history yet</p>
            <p className="text-sm text-gray-600 mt-2">
              Your transactions will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
