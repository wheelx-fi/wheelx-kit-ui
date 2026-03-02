import { useQuery } from '@tanstack/react-query'
import { BASE_API_URL } from './consts'
import axios from 'axios'
import { TokenInfoWithBalance } from './useChainsAndTokens'
import { normalizeAssetUrl } from './normalizeAssetUrl'

export interface TokenBalance {
  balance: string
  chain_id: number
  platform_id?: number
  price: string
  token: TokenInfoWithBalance
}

export async function getTokenBalance(address?: `0x${string}`) {
  const url = `${BASE_API_URL}/v1/token-balances`
  const res = await axios.get<TokenBalance[]>(url, {
    params: {
      address
    }
  })

  return res.data.map((item) => ({
    ...item,
    token: {
      ...item.token,
      logo: normalizeAssetUrl(item.token.logo),
      chain_icon: normalizeAssetUrl(item.token.chain_icon)
    }
  }))
}

export const useTokenBalance = (address?: `0x${string}`) => {
  const result = useQuery({
    queryKey: ['tokenBalance', address],
    queryFn: () => getTokenBalance(address),
    enabled: !!address
  })
  return result
}
