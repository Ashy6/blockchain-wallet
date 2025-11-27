import { GraphQLClient } from 'graphql-request'

// Uniswap V3 endpoints - Multiple fallback options (ordered by priority)
// 使用支持 CORS 的公共端点
export const UNISWAP_V3_ENDPOINTS = [
  // Messari Uniswap V3 Subgraph - 公开支持 CORS
  'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-ethereum',
  // Community maintained endpoint - 支持 CORS
  'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph',
  // Legacy hosted service
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
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
    timeout: 15000, // 15 second timeout
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
