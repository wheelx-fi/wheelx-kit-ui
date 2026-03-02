import { useQuery } from '@tanstack/react-query'
import { BASE_API_URL } from './consts'
import axios from 'axios'
interface UsdPriceRequest {
  chain_index: string
  token: `0x${string}`
}

interface UsdPriceResponse {
  chainIndex: string
  tokenAddress: `0x${string}`
  time: string
  price: string
}

async function getUsdPrice(
  tokens?: UsdPriceRequest[]
): Promise<UsdPriceResponse[]> {
  const url = `${BASE_API_URL}/v1/token-price`
  const res = await axios.post<UsdPriceResponse[]>(url, tokens)

  return res.data
}

export const useUsdPrice = (tokens?: UsdPriceRequest[]) => {
  return useQuery({
    queryKey: ['usdPrice', tokens],
    queryFn: () => getUsdPrice(tokens),
    enabled: !!tokens,
    retry: 4,
    retryDelay: 1_000
  })
}
