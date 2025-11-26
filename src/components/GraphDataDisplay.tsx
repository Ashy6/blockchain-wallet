import { useState, useEffect } from 'react'
import { gql } from 'graphql-request'
import { uniswapClient } from '../config/graph'
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

  useEffect(() => {
    fetchPools()
  }, [])

  const fetchPools = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await uniswapClient.request<{ pools: Pool[] }>(POOLS_QUERY)
      setPools(data.pools)
    } catch (err) {
      console.error('Error fetching pools:', err)
      setError('Failed to fetch data from The Graph')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: string, decimals = 2) => {
    const value = parseFloat(num)
    if (value >= 1e9) return `$${(value / 1e9).toFixed(decimals)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(decimals)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(decimals)}K`
    return `$${value.toFixed(decimals)}`
  }

  if (loading) {
    return (
      <div className="card-glow rounded-lg p-6 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-glow rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-400">
          <Activity size={24} />
          <div>
            <div className="font-semibold">Unable to fetch data</div>
            <div className="text-sm text-gray-500 mt-1">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-glow rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database size={24} className="text-neon-blue" />
        <div>
          <h2 className="text-xl font-bold text-white">The Graph Data</h2>
          <p className="text-sm text-gray-400">Top Uniswap V3 Pools by Volume</p>
        </div>
      </div>

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
                  <span>24h Volume</span>
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

      <button
        onClick={fetchPools}
        className="w-full mt-4 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-neon-blue/50 text-gray-300 rounded-lg transition-all duration-300"
      >
        Refresh Data
      </button>
    </div>
  )
}
