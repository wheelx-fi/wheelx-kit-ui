import { useQuery } from '@tanstack/react-query'
import { BASE_API_URL } from './consts'
import axios from 'axios'
import { TokenInfo } from './useChainsAndTokens'
import { isAddress } from 'viem'
import { normalizeAssetUrl } from './normalizeAssetUrl'

export async function getTokenInfo(value?: string, chainId?: number) {
  const url = `${BASE_API_URL}/v1/token-info`
  const res = await axios.get<TokenInfo[]>(url, {
    params: {
      address: value,
      chain_id: chainId,
      limit: 50
    }
  })

  return res.data.map((token) => ({
    ...token,
    logo: normalizeAssetUrl(token.logo),
    chain_icon: normalizeAssetUrl(token.chain_icon)
  }))
}

export const useTokenInfo = ({
  value,
  chainId
}: {
  value?: string
  chainId?: number
}) => {
  const result = useQuery({
    queryKey: ['tokenInfo', value, chainId],
    queryFn: () => getTokenInfo(value, chainId),
    // enabled: !!value && isAddress(value)
    enabled: !!value && !!chainId
  })
  return result
}

export const useTokenInfoBySymbol = ({
  value,
  chainId,
  hasSymbol
}: {
  value?: string
  chainId?: number
  hasSymbol?: boolean
}) => {
  const result = useQuery({
    queryKey: ['tokenInfoBySymbol', value, chainId],
    queryFn: () => getTokenInfo(value, chainId),
    enabled: !!value && isAddress(value) && hasSymbol
  })
  return result
}
