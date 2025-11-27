import { GraphQLClient } from 'graphql-request'

// Subgraph endpoints - Using multiple fallback options
export const GRAPH_ENDPOINTS = {
  // Uniswap V3 endpoints (ordered by reliability)
  uniswapV3Primary: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  uniswapV3Fallback: 'https://gateway.thegraph.com/api/[api-key]/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
  uniswapV3Ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph',
  aave: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3',
  compound: 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2',
}

export const createGraphClient = (endpoint: string) => {
  return new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 second timeout
  })
}

// Default client for Uniswap V3 - Using primary endpoint
export const uniswapClient = createGraphClient(GRAPH_ENDPOINTS.uniswapV3Primary)
export const aaveClient = createGraphClient(GRAPH_ENDPOINTS.aave)
