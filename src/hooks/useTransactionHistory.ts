import { useState, useEffect, useCallback } from 'react'
import { useAccount, useChainId } from 'wagmi'

export interface Transaction {
  hash: string
  type: 'eth_transfer' | 'token_transfer' | 'contract_interaction'
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  chainId: number
  from: string
  to?: string
  value?: string
  tokenSymbol?: string
  description?: string
  explorerUrl?: string
}

const STORAGE_KEY = 'wallet_transaction_history'

// Get explorer URL for a transaction hash
const getExplorerUrl = (hash: string, chainId: number): string => {
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

export function useTransactionHistory() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Load transactions from localStorage
  useEffect(() => {
    if (!address) return

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${address.toLowerCase()}`)
      if (stored) {
        const parsed = JSON.parse(stored) as Transaction[]

        // Remove duplicates based on transaction hash
        const uniqueMap = new Map<string, Transaction>()
        parsed.forEach(tx => {
          // Keep the most recent version of each transaction (by timestamp)
          const existing = uniqueMap.get(tx.hash)
          if (!existing || tx.timestamp > existing.timestamp) {
            uniqueMap.set(tx.hash, tx)
          }
        })

        // Convert back to array and filter by chain
        const unique = Array.from(uniqueMap.values())
        const filtered = unique
          .filter(tx => tx.chainId === chainId)
          .sort((a, b) => b.timestamp - a.timestamp)

        setTransactions(filtered)

        // Save cleaned data back to localStorage
        localStorage.setItem(`${STORAGE_KEY}_${address.toLowerCase()}`, JSON.stringify(unique))
      }
    } catch (error) {
      console.error('Error loading transaction history:', error)
    }
  }, [address, chainId])

  // Save a new transaction
  const addTransaction = useCallback((tx: Omit<Transaction, 'timestamp' | 'chainId' | 'explorerUrl'>) => {
    if (!address) return

    const newTx: Transaction = {
      ...tx,
      timestamp: Date.now(),
      chainId,
      explorerUrl: getExplorerUrl(tx.hash, chainId),
    }

    setTransactions(prev => {
      // Check if transaction already exists to prevent duplicates
      if (prev.some(t => t.hash === tx.hash)) {
        console.log('Transaction already exists, skipping:', tx.hash)
        return prev
      }

      const updated = [newTx, ...prev]

      // Remove duplicates and keep only last 100 transactions
      const uniqueMap = new Map<string, Transaction>()
      updated.forEach(t => {
        const existing = uniqueMap.get(t.hash)
        if (!existing || t.timestamp > existing.timestamp) {
          uniqueMap.set(t.hash, t)
        }
      })
      const unique = Array.from(uniqueMap.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 100)

      // Load all chains data, update this chain, and save back
      try {
        const allStored = localStorage.getItem(`${STORAGE_KEY}_${address.toLowerCase()}`)
        const allTxs = allStored ? JSON.parse(allStored) as Transaction[] : []

        // Remove old transactions for this chain and add new ones
        const otherChainsTxs = allTxs.filter(t => t.chainId !== chainId)
        const merged = [...unique, ...otherChainsTxs]

        localStorage.setItem(`${STORAGE_KEY}_${address.toLowerCase()}`, JSON.stringify(merged))
      } catch (error) {
        console.error('Error saving transaction:', error)
      }

      return unique
    })

    return newTx
  }, [address, chainId])

  // Update transaction status
  const updateTransactionStatus = useCallback((hash: string, status: Transaction['status']) => {
    if (!address) return

    setTransactions(prev => {
      // Find and update the transaction
      const txIndex = prev.findIndex(tx => tx.hash === hash)
      if (txIndex === -1) {
        console.warn('Transaction not found for status update:', hash)
        return prev
      }

      const updated = [...prev]
      updated[txIndex] = { ...updated[txIndex], status }

      // Save to localStorage with all chains data
      try {
        const allStored = localStorage.getItem(`${STORAGE_KEY}_${address.toLowerCase()}`)
        const allTxs = allStored ? JSON.parse(allStored) as Transaction[] : []

        // Update the transaction in all chains data
        const otherChainsTxs = allTxs.filter(t => t.chainId !== chainId)
        const merged = [...updated, ...otherChainsTxs]

        localStorage.setItem(`${STORAGE_KEY}_${address.toLowerCase()}`, JSON.stringify(merged))
      } catch (error) {
        console.error('Error updating transaction:', error)
      }

      return updated
    })
  }, [address, chainId])

  // Clear all transactions
  const clearTransactions = useCallback(() => {
    if (!address) return

    setTransactions([])
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${address.toLowerCase()}`)
    } catch (error) {
      console.error('Error clearing transactions:', error)
    }
  }, [address])

  // Clean up duplicates in existing data
  const cleanupDuplicates = useCallback(() => {
    if (!address) return

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${address.toLowerCase()}`)
      if (!stored) return

      const parsed = JSON.parse(stored) as Transaction[]

      // Remove duplicates
      const uniqueMap = new Map<string, Transaction>()
      parsed.forEach(tx => {
        const existing = uniqueMap.get(tx.hash)
        if (!existing || tx.timestamp > existing.timestamp) {
          uniqueMap.set(tx.hash, tx)
        }
      })

      const unique = Array.from(uniqueMap.values())
        .sort((a, b) => b.timestamp - a.timestamp)

      // Save cleaned data
      localStorage.setItem(`${STORAGE_KEY}_${address.toLowerCase()}`, JSON.stringify(unique))

      // Update state with current chain data
      const filtered = unique
        .filter(tx => tx.chainId === chainId)
        .sort((a, b) => b.timestamp - a.timestamp)

      setTransactions(filtered)

      console.log(`Cleaned up duplicates: ${parsed.length} → ${unique.length} transactions`)
      return { before: parsed.length, after: unique.length }
    } catch (error) {
      console.error('Error cleaning up duplicates:', error)
    }
  }, [address, chainId])

  return {
    transactions,
    addTransaction,
    updateTransactionStatus,
    clearTransactions,
    cleanupDuplicates,
  }
}
