import { useState, useEffect } from 'react'
import { useAccount, useChainId, useWriteContract, useWatchContractEvent, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { DataLoggerABI } from '../contracts/DataLoggerABI'
import { getContractAddress } from '../config/contracts'
import { FileText, Send, Activity, Clock, User, Loader2, CheckCircle, ExternalLink } from 'lucide-react'
import { formatAddress } from '../utils/format'

interface DataUpdatedEvent {
  user: string
  oldValue: bigint
  newValue: bigint
  transactionHash: string
  blockNumber: bigint
  timestamp?: number
}

export function DataLoggerPanel() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [newValue, setNewValue] = useState('')
  const [events, setEvents] = useState<DataUpdatedEvent[]>([])
  const [currentData, setCurrentData] = useState<bigint | null>(null)

  const contractAddress = getContractAddress('dataLogger', chainId)

  // Read current data from contract
  const { data: dataValue, refetch: refetchData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: DataLoggerABI,
    functionName: 'data',
    query: {
      enabled: !!contractAddress && isConnected,
    },
  })

  // Write contract
  const { data: hash, writeContract, isPending, isSuccess } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Watch for DataUpdated events
  useWatchContractEvent({
    address: contractAddress as `0x${string}`,
    abi: DataLoggerABI,
    eventName: 'DataUpdated',
    onLogs(logs) {
      const newEvents = logs.map((log) => ({
        user: log.args.user as string,
        oldValue: log.args.oldValue as bigint,
        newValue: log.args.newValue as bigint,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: Date.now(),
      }))
      setEvents((prev) => [...newEvents, ...prev].slice(0, 10))
      refetchData()
    },
    enabled: !!contractAddress && isConnected,
  })

  useEffect(() => {
    if (dataValue !== undefined) {
      setCurrentData(dataValue as bigint)
    }
  }, [dataValue])

  useEffect(() => {
    if (isConfirmed) {
      setNewValue('')
      refetchData()
    }
  }, [isConfirmed, refetchData])

  const handleUpdateData = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newValue || !contractAddress) return

    try {
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: DataLoggerABI,
        functionName: 'updateData',
        args: [BigInt(newValue)],
      })
    } catch (error) {
      console.error('Update data error:', error)
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
      <div className="card-glow rounded-lg p-6">
        <div className="text-center py-8">
          <FileText size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">连接钱包以与 DataLogger 合约交互</p>
        </div>
      </div>
    )
  }

  if (!contractAddress) {
    return (
      <div className="card-glow rounded-lg p-6">
        <div className="text-center py-8">
          <FileText size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">DataLogger 合约在此网络上不可用</p>
          <p className="text-sm text-gray-600 mt-2">请切换到 Sepolia 测试网</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-glow rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText size={24} className="text-neon-blue" />
        <div>
          <h2 className="text-xl font-bold text-white">DataLogger 合约</h2>
          <p className="text-sm text-gray-400">追踪和更新链上数据</p>
        </div>
      </div>

      {/* Current Value Display */}
      <div className="mb-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">当前数值</div>
        <div className="text-3xl font-bold text-neon">
          {currentData !== null ? currentData.toString() : '-'}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          合约地址: {formatAddress(contractAddress)}
        </div>
      </div>

      {/* Update Form */}
      <form onSubmit={handleUpdateData} className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          更新数值
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="输入新数值"
            className="input-cyber flex-1 rounded-lg"
            disabled={isPending || isConfirming}
          />
          <button
            type="submit"
            disabled={isPending || isConfirming || !newValue}
            className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {isPending ? '发送中...' : '确认中...'}
              </>
            ) : (
              <>
                <Send size={18} />
                更新
              </>
            )}
          </button>
        </div>
      </form>

      {/* Transaction Status */}
      {isSuccess && hash && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
          <CheckCircle size={20} className="text-neon-green flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-neon-green mb-1">
              {isConfirmed ? '交易已确认！' : '交易已发送！'}
            </div>
            <a
              href={getExplorerUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-neon-blue flex items-center gap-1 break-all"
            >
              <span className="truncate">{hash}</span>
              <ExternalLink size={12} className="flex-shrink-0" />
            </a>
          </div>
        </div>
      )}

      {/* Event History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-neon-purple" />
          <h3 className="text-lg font-bold text-white">最近事件</h3>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无事件。更新数据后将在此显示事件。</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event, index) => (
              <div
                key={`${event.transactionHash}-${index}`}
                className="p-4 bg-gray-900/50 border border-gray-800 hover:border-neon-blue/30 rounded-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-neon-blue" />
                    <span className="text-sm text-gray-400">
                      {formatAddress(event.user)}
                    </span>
                  </div>
                  {event.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">旧值:</span>{' '}
                    <span className="text-white font-semibold">
                      {event.oldValue.toString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">新值:</span>{' '}
                    <span className="text-neon-green font-semibold">
                      {event.newValue.toString()}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-800">
                  <a
                    href={getExplorerUrl(event.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-neon-blue flex items-center gap-1"
                  >
                    <span className="truncate">Tx: {event.transactionHash}</span>
                    <ExternalLink size={10} className="flex-shrink-0" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
