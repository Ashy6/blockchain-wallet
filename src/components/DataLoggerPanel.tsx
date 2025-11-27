import { useState, useEffect } from 'react'
import { useAccount, useChainId, useWriteContract, useWatchContractEvent, useReadContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { DataLoggerABI } from '../contracts/DataLoggerABI'
import { getContractAddress } from '../config/contracts'
import { FileText, Send, Activity, Clock, User, Loader2, CheckCircle, ExternalLink, RefreshCw, Sparkles } from 'lucide-react'
import { formatAddress } from '../utils/format'

interface DataUpdatedEvent {
  user: string
  oldValue: string
  newValue: string
  timestamp: bigint
  transactionHash: string
  blockNumber: bigint
  displayTime?: string
}

const STORAGE_KEY = 'datalogger_history'

export function DataLoggerPanel() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const [newValue, setNewValue] = useState('')
  const [events, setEvents] = useState<DataUpdatedEvent[]>([])
  const [currentData, setCurrentData] = useState<string>('')
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const contractAddress = getContractAddress('dataLogger', chainId)

  // Read current data from contract
  const { data: dataValue, refetch: refetchData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: DataLoggerABI,
    functionName: 'readData',
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

  // Watch for real-time DataUpdated events
  useWatchContractEvent({
    address: contractAddress as `0x${string}`,
    abi: DataLoggerABI,
    eventName: 'DataUpdated',
    onLogs(logs) {
      const newEvents = logs.map((log) => ({
        user: log.args.user as string,
        oldValue: log.args.oldValue as string,
        newValue: log.args.newValue as string,
        timestamp: log.args.timestamp as bigint,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        displayTime: new Date(Number(log.args.timestamp) * 1000).toLocaleString('zh-CN'),
      }))
      setEvents((prev) => {
        const updated = [...newEvents, ...prev]
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 50)))
        return updated.slice(0, 50)
      })
      refetchData()
    },
    enabled: !!contractAddress && isConnected,
  })

  // Load historical events from blockchain
  const loadHistoricalEvents = async () => {
    if (!contractAddress || !publicClient || !isConnected) return

    setIsLoadingHistory(true)
    try {
      const currentBlock = await publicClient.getBlockNumber()
      const fromBlock = currentBlock - 10000n // Last ~10k blocks

      const logs = await publicClient.getLogs({
        address: contractAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'DataUpdated',
          inputs: [
            { type: 'address', indexed: true, name: 'user' },
            { type: 'string', indexed: false, name: 'oldValue' },
            { type: 'string', indexed: false, name: 'newValue' },
            { type: 'uint256', indexed: false, name: 'timestamp' },
          ],
        },
        fromBlock,
        toBlock: 'latest',
      })

      const historicalEvents = logs.map((log) => ({
        user: log.args.user as string,
        oldValue: log.args.oldValue as string,
        newValue: log.args.newValue as string,
        timestamp: log.args.timestamp as bigint,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        displayTime: new Date(Number(log.args.timestamp) * 1000).toLocaleString('zh-CN'),
      }))

      // Sort by timestamp (newest first)
      const sorted = historicalEvents.sort((a, b) => Number(b.timestamp - a.timestamp))
      setEvents(sorted.slice(0, 50))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted.slice(0, 50)))
    } catch (error) {
      console.error('Error loading historical events:', error)
      // Try to load from localStorage as fallback
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setEvents(JSON.parse(stored))
      }
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Load events on mount
  useEffect(() => {
    if (isConnected && contractAddress) {
      // First load from localStorage for instant display
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setEvents(JSON.parse(stored))
      }
      // Then fetch fresh data from blockchain
      loadHistoricalEvents()
    }
  }, [isConnected, contractAddress, chainId])

  useEffect(() => {
    if (dataValue !== undefined) {
      setCurrentData(dataValue as string)
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
    if (!newValue.trim() || !contractAddress) return

    try {
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: DataLoggerABI,
        functionName: 'updateData',
        args: [newValue],
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
    <div className="space-y-6">
      {/* Main Card */}
      <div className="card-glow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-neon-blue" />
            <div>
              <h2 className="text-xl font-bold text-white">DataLogger 合约</h2>
              <p className="text-sm text-gray-400">链上数据存储（支持中文、emoji）</p>
            </div>
          </div>
          <button
            onClick={loadHistoricalEvents}
            disabled={isLoadingHistory}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            title="刷新历史"
          >
            <RefreshCw size={18} className={`text-gray-400 hover:text-neon-blue ${isLoadingHistory ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Current Value Display */}
        <div className="mb-6 p-4 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-neon-blue" />
            <span className="text-sm text-gray-400">当前链上数据</span>
          </div>
          <div className="text-2xl font-bold text-white break-words">
            {currentData || <span className="text-gray-500">空</span>}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="text-xs text-gray-500">
              合约地址: {formatAddress(contractAddress)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              网络: Sepolia 测试网 (Chain ID: {chainId})
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdateData} className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            更新数据（支持任何文本、中文、emoji）
          </label>
          <div className="space-y-2">
            <textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="输入任何内容...例如：你好世界 🌍、Hello World、こんにちは"
              className="input-cyber w-full rounded-lg min-h-[100px] resize-y"
              disabled={isPending || isConfirming}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                字符数: {newValue.length}
              </span>
              <button
                type="submit"
                disabled={isPending || isConfirming || !newValue.trim()}
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
                    提交到链上
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Transaction Status */}
        {isSuccess && hash && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
            <CheckCircle size={20} className="text-neon-green flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-neon-green mb-1">
                {isConfirmed ? '✅ 交易已确认！数据已写入区块链' : '⏳ 交易已发送，等待确认...'}
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
      </div>

      {/* Event History Timeline */}
      <div className="card-glow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={18} className="text-neon-purple" />
          <h3 className="text-lg font-bold text-white">数据更新历史</h3>
          <span className="text-xs text-gray-500">({events.length} 条记录)</span>
        </div>

        {isLoadingHistory && events.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-neon-blue" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">暂无历史记录</p>
            <p className="text-sm">更新数据后，历史记录将在此显示</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {events.map((event, index) => (
              <div
                key={`${event.transactionHash}-${index}`}
                className="relative p-4 bg-gray-900/50 border border-gray-800 hover:border-neon-blue/30 rounded-lg transition-all duration-300 group"
              >
                {/* Timeline dot */}
                <div className="absolute -left-2 top-6 w-4 h-4 bg-neon-blue rounded-full border-4 border-gray-900 group-hover:scale-125 transition-transform" />

                {/* Event Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-neon-blue" />
                    <span className="text-sm font-mono text-gray-400">
                      {formatAddress(event.user)}
                    </span>
                    {address?.toLowerCase() === event.user.toLowerCase() && (
                      <span className="text-xs px-2 py-0.5 bg-neon-blue/10 border border-neon-blue/30 rounded text-neon-blue">
                        你
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{event.displayTime}</span>
                  </div>
                </div>

                {/* Value Change */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 mt-1 w-12">旧值:</span>
                    <div className="flex-1 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-sm text-gray-300 break-words">
                      {event.oldValue || <span className="text-gray-600 italic">空</span>}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 mt-1 w-12">新值:</span>
                    <div className="flex-1 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded text-sm text-white font-semibold break-words">
                      {event.newValue}
                    </div>
                  </div>
                </div>

                {/* Transaction Link */}
                <div className="pt-3 border-t border-gray-800">
                  <a
                    href={getExplorerUrl(event.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-neon-blue flex items-center gap-1 group"
                  >
                    <span className="truncate font-mono">Tx: {event.transactionHash}</span>
                    <ExternalLink size={10} className="flex-shrink-0 group-hover:scale-125 transition-transform" />
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
