export function formatAddress(address: string | undefined, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatNumber(num: string | number, decimals = 2): string {
  const value = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(value)) return '0'
  if (value >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`
  return value.toFixed(decimals)
}

export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  displayDecimals = 4
): string {
  const divisor = BigInt(10 ** decimals)
  const integerPart = amount / divisor
  const fractionalPart = amount % divisor
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const displayFractional = fractionalStr.slice(0, displayDecimals)
  return `${integerPart}.${displayFractional}`
}
