import { GraphQLClient } from 'graphql-request'

// Example subgraph endpoints - Replace with your actual subgraph URLs
export const GRAPH_ENDPOINTS = {
  uniswapV3: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  aave: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3',
  compound: 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2',
  // Add more subgraph endpoints as needed
}

export const createGraphClient = (endpoint: string) => {
  return new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// Default client for Uniswap V3
export const uniswapClient = createGraphClient(GRAPH_ENDPOINTS.uniswapV3)
export const aaveClient = createGraphClient(GRAPH_ENDPOINTS.aave)
