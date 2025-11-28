import { GraphQLClient } from 'graphql-request'

// The Graph API Key - 从环境变量获取
// 获取免费 API key (100K 查询/月): https://thegraph.com/studio/apikeys/
const GRAPH_API_KEY = import.meta.env.VITE_GRAPH_API_KEY || ''

// Uniswap V3 Official Subgraph ID (Ethereum Mainnet)
const UNISWAP_V3_SUBGRAPH_ID = '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV'

// Uniswap V3 endpoints - 使用 The Graph 去中心化网络
// 注意：旧的 Hosted Service 已于 2023 年关闭
export const UNISWAP_V3_ENDPOINTS = GRAPH_API_KEY
  ? [
      // 主网关（需要 API key）
      `https://gateway.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${UNISWAP_V3_SUBGRAPH_ID}`,
      // Arbitrum 网关（需要 API key）
      `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${UNISWAP_V3_SUBGRAPH_ID}`,
    ]
  : [
      // 无 API key 时使用公共查询端点（有速率限制）
      // 注意：这些端点可能不稳定或速率限制更严格
      `https://api.studio.thegraph.com/query/48211/uniswap-v3-mainnet/version/latest`,
    ]

export const GRAPH_ENDPOINTS = {
  aave: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3',
  compound: 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2',
}

export const createGraphClient = (endpoint: string) => {
  return new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    fetch: (url, options) => {
      // 自定义 fetch 以确保正确的 CORS 配置
      return fetch(url, {
        ...options,
        mode: 'cors',
        credentials: 'omit',
      })
    },
  })
}

// Create a client with automatic fallback support
export const createFallbackClient = async <T>(
  endpoints: string[],
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  const errors: Array<{ endpoint: string; error: Error }> = []

  for (const endpoint of endpoints) {
    try {
      console.log(`尝试端点: ${endpoint}`)
      const client = createGraphClient(endpoint)
      const data = await client.request<T>(query, variables)
      console.log(`✓ 成功连接到: ${endpoint}`)
      return data
    } catch (error) {
      const err = error as Error
      console.warn(`✗ 端点失败 (${endpoint}):`, err.message)
      errors.push({ endpoint, error: err })
      // Continue to next endpoint
      continue
    }
  }

  // All endpoints failed
  const errorMessages = errors.map(e => `${e.endpoint}: ${e.error.message}`).join('\n')
  throw new Error(`所有端点都失败了:\n${errorMessages}`)
}

// Legacy clients for backward compatibility
export const uniswapClient = createGraphClient(UNISWAP_V3_ENDPOINTS[0])
export const aaveClient = createGraphClient(GRAPH_ENDPOINTS.aave)
