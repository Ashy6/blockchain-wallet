import { useState, useEffect } from 'react'

export function useEthPrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // 使用 CoinGecko 免费 API 获取 ETH 价格
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        )
        const data = await response.json()
        if (data.ethereum?.usd) {
          setPrice(data.ethereum.usd)
        }
      } catch (error) {
        console.error('Error fetching ETH price:', error)
        setPrice(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    // 每 60 秒更新一次价格
    const interval = setInterval(fetchPrice, 60000)

    return () => clearInterval(interval)
  }, [])

  return { price, loading }
}
