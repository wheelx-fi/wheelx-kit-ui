import { useQuery } from '@tanstack/react-query'

export interface HyperliquidBalanceRes {
  code?: number
  message?: string | unknown
  withdrawable: string | null
}

export const getHyperliquidBalance = async (
  address: `0x${string}` | undefined
): Promise<HyperliquidBalanceRes> => {
  const newUrl = `https://api.hyperliquid.xyz/info`
  try {
    const response = await fetch(`${newUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'clearinghouseState',
        user: address
      })
    })
    return await response.json()
  } catch (error: unknown) {
    return {
      code: 1,
      message: error,
      withdrawable: null
    }
  }
}

export const useHyperliquidBalance = (
  address: `0x${string}` | undefined,
  enabled: boolean
) => {
  return useQuery<HyperliquidBalanceRes, Error>({
    queryKey: ['getHyperliquidBalance', address],
    queryFn: () => getHyperliquidBalance(address),
    enabled: enabled && !!address,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchInterval: (query) => {
      if (query?.state?.data?.withdrawable === null) {
        return 1_000
      }
      return false
    }
  })
}
