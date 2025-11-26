import { useState, useEffect } from 'react'
import { useAccount, useChainId, usePublicClient, useWatchContractEvent } from 'wagmi'
import { ERC20_ABI } from '../contracts/ERC20ABI'
import { getContractAddress } from '../config/contracts'
import { formatTokenAmount, formatAddress } from '../utils/format'
import { History, ArrowUpRight, ArrowDownLeft, ExternalLink, Loader2, RefreshCw } from 'lucide-react'

interface TransferEvent {
  from: string
  to: string
  value: bigint
  transactionHash: string
  blockNumber: bigint
  timestamp?: number
  type: 'sent' | 'received'
}

export function TransactionHistory() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const [transfers, setTransfers] = useState<TransferEvent[]>([])
  const [loading, setLoading] = useState(false)

  const usdtAddress = getContractAddress('usdt', chainId)

  // Watch for new Transfer events
  useWatchContractEvent({
    address: usdtAddress as `0x${string}`,
    abi: ERC20_ABI,
    eventName: 'Transfer',
    onLogs(logs) {
      if (!address) return

      const newTransfers = logs
        .filter((log: any) => {
          const from = log.args?.from as string
          const to = log.args?.to as string
          return from?.toLowerCase() === address.toLowerCase() || to?.toLowerCase() === address.toLowerCase()
        })
        .map((log: any) => {
          const from = log.args?.from as string
          const to = log.args?.to as string
          return {
            from,
            to,
            value: log.args?.value as bigint,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: Date.now(),
            type: from?.toLowerCase() === address.toLowerCase() ? 'sent' : 'received',
          } as TransferEvent
        })

      setTransfers((prev) => [...newTransfers, ...prev])
    },
    enabled: !!usdtAddress && !!address && isConnected,
  })

  // Fetch historical transfers
  const fetchTransfers = async () => {
    if (!address || !usdtAddress || !publicClient) return

    setLoading(true)
    try {
      const currentBlock = await publicClient.getBlockNumber()
      const fromBlock = currentBlock - 10000n // Last ~10k blocks

      // Fetch sent transfers
      const sentLogs = await publicClient.getLogs({
        address: usdtAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', indexed: true, name: 'from' },
            { type: 'address', indexed: true, name: 'to' },
            { type: 'uint256', indexed: false, name: 'value' },
          ],
        },
        args: {
          from: address,
        },
        fromBlock,
        toBlock: 'latest',
      })

      // Fetch received transfers
      const receivedLogs = await publicClient.getLogs({
        address: usdtAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', indexed: true, name: 'from' },
            { type: 'address', indexed: true, name: 'to' },
            { type: 'uint256', indexed: false, name: 'value' },
          ],
        },
        args: {
          to: address,
        },
        fromBlock,
        toBlock: 'latest',
      })

      const allLogs = [...sentLogs, ...receivedLogs]

      // Get timestamps for each transaction
      const transfersWithTimestamps = await Promise.all(
        allLogs.map(async (log) => {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
          const from = log.args.from as string
          return {
            from,
            to: log.args.to as string,
            value: log.args.value as bigint,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: Number(block.timestamp) * 1000,
            type: from.toLowerCase() === address.toLowerCase() ? 'sent' : 'received',
          } as TransferEvent
        })
      )

      // Sort by block number (newest first) and remove duplicates
      const uniqueTransfers = transfersWithTimestamps
        .sort((a, b) => Number(b.blockNumber - a.blockNumber))
        .filter((transfer, index, self) =>
          index === self.findIndex((t) => t.transactionHash === transfer.transactionHash)
        )

      setTransfers(uniqueTransfers.slice(0, 50)) // Keep last 50 transfers
    } catch (error) {
      console.error('Error fetching transfers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && address && usdtAddress) {
      fetchTransfers()
    }
  }, [isConnected, address, usdtAddress, chainId])

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
      <div className="card-glow rounded-lg p-6">
        <div className="text-center py-8">
          <History size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">Connect wallet to view transaction history</p>
        </div>
      </div>
    )
  }

  if (!usdtAddress) {
    return (
      <div className="card-glow rounded-lg p-6">
        <div className="text-center py-8">
          <History size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">Token not available on this network</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-glow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History size={24} className="text-neon-pink" />
          <div>
            <h2 className="text-xl font-bold text-white">Transaction History</h2>
            <p className="text-sm text-gray-400">Recent token transfers</p>
          </div>
        </div>
        <button
          onClick={fetchTransfers}
          disabled={loading}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh history"
        >
          <RefreshCw size={18} className={`text-gray-400 hover:text-neon-blue ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && transfers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-neon-blue" />
        </div>
      ) : transfers.length === 0 ? (
        <div className="text-center py-12">
          <History size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">No transactions found</p>
          <p className="text-sm text-gray-600 mt-2">
            Your token transfers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {transfers.map((transfer, index) => (
            <div
              key={`${transfer.transactionHash}-${index}`}
              className="p-4 bg-gray-900/50 border border-gray-800 hover:border-neon-blue/30 rounded-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transfer.type === 'sent'
                      ? 'bg-red-500/10 border border-red-500/30'
                      : 'bg-green-500/10 border border-green-500/30'
                  }`}>
                    {transfer.type === 'sent' ? (
                      <ArrowUpRight size={18} className="text-red-400" />
                    ) : (
                      <ArrowDownLeft size={18} className="text-green-400" />
                    )}
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      transfer.type === 'sent' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {transfer.type === 'sent' ? 'Sent' : 'Received'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transfer.type === 'sent' ? 'To: ' : 'From: '}
                      {formatAddress(transfer.type === 'sent' ? transfer.to : transfer.from)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {transfer.type === 'sent' ? '-' : '+'}
                    {formatTokenAmount(transfer.value, 6, 4)}
                  </div>
                  {transfer.timestamp && (
                    <div className="text-xs text-gray-500">
                      {new Date(transfer.timestamp).toLocaleDateString()}{' '}
                      {new Date(transfer.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-800">
                <a
                  href={getExplorerUrl(transfer.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-neon-blue flex items-center gap-1"
                >
                  <span className="truncate">Tx: {transfer.transactionHash}</span>
                  <ExternalLink size={10} className="flex-shrink-0" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
