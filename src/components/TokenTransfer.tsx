/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { ERC20_ABI } from '../contracts/ERC20ABI'
import { getContractAddress } from '../config/contracts'
import { formatTokenAmount, formatAddress } from '../utils/format'
import { Coins, Send, Loader2, CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react'

export function TokenTransfer() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')

  const usdtAddress = getContractAddress('usdt', chainId)

  // Read token info
  const { data: tokenName } = useReadContract({
    address: usdtAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'name',
    query: {
      enabled: !!usdtAddress && isConnected,
    },
  })

  const { data: tokenSymbol } = useReadContract({
    address: usdtAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: {
      enabled: !!usdtAddress && isConnected,
    },
  })

  const { data: tokenDecimals } = useReadContract({
    address: usdtAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!usdtAddress && isConnected,
    },
  })

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdtAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!usdtAddress && !!address && isConnected,
    },
  })

  // Write contract
  const { data: hash, writeContract, isPending, isSuccess, isError, error } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConfirmed) {
      setRecipient('')
      setAmount('')
      refetchBalance()
    }
  }, [isConfirmed, refetchBalance])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !amount || !usdtAddress || !tokenDecimals) return

    try {
      const decimals = Number(tokenDecimals)
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 10 ** decimals))

      writeContract({
        address: usdtAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, amountInWei],
      })
    } catch (error) {
      console.error('Transfer error:', error)
    }
  }

  const setMaxAmount = () => {
    if (balance && tokenDecimals) {
      const maxAmount = formatTokenAmount(balance as bigint, Number(tokenDecimals), 6)
      setAmount(maxAmount)
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
          <Coins size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">连接钱包以转账代币</p>
        </div>
      </div>
    )
  }

  if (!usdtAddress) {
    return (
      <div className="card-glow rounded-lg p-6">
        <div className="text-center py-8">
          <Coins size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">USDT 在此网络上不可用</p>
          <p className="text-sm text-gray-600 mt-2">请切换到支持的网络</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-glow rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Coins size={24} className="text-neon-purple" />
        <div>
          <h2 className="text-xl font-bold text-white">代币转账</h2>
          <p className="text-sm text-gray-400">发送 ERC-20 代币</p>
        </div>
      </div>

      {/* Token Info */}
      <div className="mb-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-400">代币</div>
            <div className="text-lg font-bold text-white">
              {tokenName?.toString() || '加载中...'}
            </div>
            <div className="text-sm text-gray-500">
              {tokenSymbol?.toString() || '-'}
            </div>
          </div>
          <button
            onClick={() => refetchBalance()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="刷新余额"
          >
            <RefreshCw size={18} className="text-gray-400 hover:text-neon-blue" />
          </button>
        </div>
        <div className="pt-3 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-1">您的余额</div>
          <div className="text-2xl font-bold text-neon">
            {balance && tokenDecimals
              ? formatTokenAmount(balance as bigint, Number(tokenDecimals), 4)
              : '0.0000'}{' '}
            <span className="text-lg text-gray-500">{tokenSymbol?.toString() || ''}</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          合约地址: {formatAddress(usdtAddress)}
        </div>
      </div>

      {/* Transfer Form */}
      <form onSubmit={handleTransfer} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            收款地址
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="input-cyber w-full rounded-lg"
            disabled={isPending || isConfirming}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            数量 ({tokenSymbol?.toString() || '代币'})
          </label>
          <input
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="input-cyber w-full rounded-lg"
            disabled={isPending || isConfirming}
          />
          {balance && tokenDecimals !== undefined ? (
            <button
              type="button"
              onClick={setMaxAmount}
              className="text-xs text-neon-blue hover:text-neon-purple mt-1"
            >
              最大值: {formatTokenAmount(balance as bigint, Number(tokenDecimals), 6)}
            </button>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming || !recipient || !amount}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>{isPending ? '发送中...' : '确认中...'}</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>发送代币</span>
            </>
          )}
        </button>
      </form>

      {/* Transaction Status */}
      {isSuccess && hash && (
        <div className="mt-6 flex items-start gap-3 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
          <CheckCircle size={20} className="text-neon-green flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-neon-green mb-1">
              {isConfirmed ? '转账已确认！' : '交易已发送！'}
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

      {isError && (
        <div className="mt-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-red-400 mb-1">
              交易失败
            </div>
            <div className="text-xs text-gray-400">
              {(error as Error | null)?.message || '请重试或检查您的余额'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
