/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { gql } from 'graphql-request'
import { createFallbackClient, UNISWAP_V3_ENDPOINTS } from '../config/graph'
import { Database, TrendingUp, DollarSign, Activity, Loader2 } from 'lucide-react'

interface Token {
  id: string
  symbol: string
  name: string
  decimals: string
}

interface Pool {
  id: string
  token0: Token
  token1: Token
  feeTier: string
  liquidity: string
  volumeUSD: string
  token0Price: string
  token1Price: string
}

const POOLS_QUERY = gql`
  query GetTopPools {
    pools(first: 5, orderBy: volumeUSD, orderDirection: desc) {
      id
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
      feeTier
      liquidity
      volumeUSD
      token0Price
      token1Price
    }
  }
`

export function GraphDataDisplay() {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000

  useEffect(() => {
    fetchPools()
  }, [])

  const fetchPools = async (force = false) => {
    // Check cache - only fetch if cache expired or force refresh
    const now = Date.now()
    const cacheExpired = now - lastFetch > CACHE_DURATION

    if (!force && !cacheExpired && pools.length > 0) {
      console.log('使用缓存数据，距离下次刷新还有', Math.round((CACHE_DURATION - (now - lastFetch)) / 1000), '秒')
      return
    }

    try {
      if (force) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Use fallback mechanism to try multiple endpoints
      const data = await createFallbackClient<{ pools: Pool[] }>(
        UNISWAP_V3_ENDPOINTS,
        POOLS_QUERY
      )

      setPools(data.pools)
      setLastFetch(now)
    } catch (err) {
      const error = err as Error
      console.error('Error fetching pools:', error)

      // Provide specific error messages based on error type
      if (error.message.includes('所有端点都失败了')) {
        setError('无法连接到 The Graph。建议配置 API Key 以使用官方去中心化网络（每月 100K 免费查询）。')
      } else if (error.message.includes('429')) {
        setError('请求过于频繁，请等待后再试（速率限制）。建议配置 API Key。')
      } else if (error.message.includes('404')) {
        setError('Subgraph 端点未找到。旧的 Hosted Service 已关闭，请配置 API Key 使用新网络。')
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        setError('网络连接失败，请检查网络设置')
      } else if (error.message.includes('timeout')) {
        setError('请求超时，请稍后重试')
      } else {
        setError(`从 The Graph 获取数据失败: ${error.message || '未知错误'}`)
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const formatNumber = (num: string, decimals = 2) => {
    const value = parseFloat(num)
    if (value >= 1e9) return `$${(value / 1e9).toFixed(decimals)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(decimals)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(decimals)}K`
    return `$${value.toFixed(decimals)}`
  }

  const getCacheStatus = () => {
    if (lastFetch === 0) return ''
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetch
    const timeUntilNextRefresh = CACHE_DURATION - timeSinceLastFetch

    if (timeUntilNextRefresh > 0) {
      const minutes = Math.floor(timeUntilNextRefresh / 60000)
      const seconds = Math.floor((timeUntilNextRefresh % 60000) / 1000)
      return `缓存有效 (${minutes}:${seconds.toString().padStart(2, '0')})`
    }
    return '缓存已过期'
  }

  const handleRefresh = () => {
    fetchPools(true)
  }

  const refetchPools = (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="w-full mt-4 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-neon-blue/50 text-gray-300 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRefreshing ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          刷新中...
        </span>
      ) : (
        <span>{getCacheStatus() || '刷新数据'}</span>
      )}
    </button>
  )

  if (loading) {
    return (
      <div className="card-glow rounded-lg p-6 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    )
  }

  if (error && pools.length === 0) {
    return (
      <div className="card-glow rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-400 mb-4">
          <Activity size={24} />
          <div>
            <div className="font-semibold">无法获取数据</div>
            <div className="text-sm text-gray-500 mt-1">{error}</div>
          </div>
        </div>
        <div className="text-xs text-gray-400 bg-gray-900/50 border border-gray-800 rounded p-3 mb-4">
          💡 解决方案：获取免费 The Graph API Key
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>访问 <a href="https://thegraph.com/studio/apikeys/" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">The Graph Studio</a></li>
            <li>创建 API Key（每月 100K 免费查询）</li>
            <li>在项目根目录创建 .env 文件</li>
            <li>添加：VITE_GRAPH_API_KEY=你的key</li>
            <li>重启开发服务器</li>
          </ul>
        </div>
        {refetchPools}
      </div>
    )
  }

  return (
    <div className="card-glow rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database size={24} className="text-neon-blue" />
        <div>
          <h2 className="text-xl font-bold text-white">The Graph 数据</h2>
          <p className="text-sm text-gray-400">Uniswap V3 交易量排行</p>
        </div>
      </div>

      {/* Show error warning if there's an error but we have cached data */}
      {error && pools.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <Activity size={16} />
            <span>刷新失败，显示缓存数据：{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className="bg-gray-900/50 border border-gray-800 hover:border-neon-blue/30 rounded-lg p-4 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-white">
                  {pool.token0.symbol}/{pool.token1.symbol}
                </div>
                <div className="px-2 py-0.5 bg-neon-blue/10 border border-neon-blue/30 rounded text-xs text-neon-blue">
                  {parseInt(pool.feeTier) / 10000}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <DollarSign size={14} />
                  <span>24小时交易量</span>
                </div>
                <div className="text-lg font-semibold text-neon-green">
                  {formatNumber(pool.volumeUSD)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <TrendingUp size={14} />
                  <span>TVL</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {formatNumber(pool.liquidity)}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  1 {pool.token0.symbol} = {parseFloat(pool.token0Price).toFixed(6)} {pool.token1.symbol}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {refetchPools}
    </div>
  )
}
