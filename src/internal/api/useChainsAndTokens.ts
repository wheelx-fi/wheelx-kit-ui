import { useQuery } from '@tanstack/react-query'
import { BASE_API_URL } from './consts'
import { enableTestnet } from '../utils'
import axios from 'axios'
import { normalizeAssetUrl } from './normalizeAssetUrl'

export type Tag = 'pin' | 'top' | 'cert' | 'native'
export interface TokenInfo {
  name: string
  address: `0x${string}`
  chain_id: number
  decimals: number
  symbol: string
  logo: string
  tags: Tag[]
  support_kline?: boolean
  token_type?: string
  categories?: string[]
  chain_icon?: string
  platform_id?: number
  platform_type?: string[]
}
export interface TokenInfoWithBalance extends TokenInfo {
  balance?: string
  usdPrice?: string
}

export type ChainInfo = {
  name: string
  rpc_url: string
  rpc_fallback: string[]
  chain_icon: string
  chain_id: number
  eth_token: `0x${string}`
  support_kline: boolean
  is_popular: boolean
  outbound: boolean
  inbound: boolean
  is_testnet?: boolean
  platform_id?: number
}
export interface Prediction {
  chains: ChainInfo[]
  tokens: TokenInfo[]
}
export interface ChainsAndTokens {
  chains: ChainInfo[]
  tokens: TokenInfo[]
  deposit_platforms: {
    prediction: Prediction
  }
}

export async function getChainsAndTokens() {
  const url = enableTestnet()
    ? `${BASE_API_URL}/v1/chain-info?network=testnet`
    : `${BASE_API_URL}/v1/chain-info`

  const res = await axios.get<ChainsAndTokens>(url)
  const normalizeToken = (token: TokenInfo): TokenInfo => ({
    ...token,
    logo: normalizeAssetUrl(token.logo),
    chain_icon: normalizeAssetUrl(token.chain_icon)
  })
  const normalizeChain = (chain: ChainInfo): ChainInfo => ({
    ...chain,
    chain_icon: normalizeAssetUrl(chain.chain_icon)
  })
  const prediction = res.data.deposit_platforms?.prediction

  return {
    ...res.data,
    chains: res.data.chains.map(normalizeChain),
    tokens: res.data.tokens.map(normalizeToken),
    deposit_platforms: prediction
      ? {
          ...res.data.deposit_platforms,
          prediction: {
            chains: prediction.chains.map(normalizeChain),
            tokens: prediction.tokens.map(normalizeToken)
          }
        }
      : res.data.deposit_platforms
  }
}

export const useChainsAndTokens = (enabled = true) => {
  const result = useQuery({
    queryKey: ['chainsAndTokens'],
    queryFn: () => getChainsAndTokens(),
    enabled,
    refetchOnWindowFocus: false
  })
  return result
}

// export function mergeTokensWithCompositeKey(
//   arr1: TokenInfoWithBalance[],
//   arr2: TokenInfoWithBalance[]
// ): TokenInfoWithBalance[] {
//   // Creating a composite key: address + chain_id + symbol
//   const generateCompositeKey = (token: TokenInfoWithBalance) =>
//     `${token.address}_${token.chain_id}_${token.symbol}`

//   const tokenMap = new Map<string, TokenInfoWithBalance>()

//   const processArray = (tokens: TokenInfoWithBalance[]) => {
//     for (const token of tokens) {
//       const compositeKey = generateCompositeKey(token)
//       const existingToken = tokenMap.get(compositeKey)

//       if (!existingToken) {
//         tokenMap.set(compositeKey, token)
//       } else {
//         const existingHasTags =
//           existingToken.tags && existingToken.tags.length > 0
//         const currentHasTags = token.tags && token.tags.length > 0

//         if (currentHasTags && !existingHasTags) {
//           tokenMap.set(compositeKey, token)
//         }
//       }
//     }
//   }
//   processArray(arr1)
//   processArray(arr2)
//   return Array.from(tokenMap.values())
// }
export function mergeTokensWithCompositeKey(
  arr1: TokenInfoWithBalance[],
  arr2: TokenInfoWithBalance[]
): TokenInfoWithBalance[] {
  const generateCompositeKey = (token: TokenInfoWithBalance) =>
    `${token.address}_${token.chain_id}_${token.symbol}_${token.platform_id}`

  const tokenMap = new Map<string, TokenInfoWithBalance>()

  const processArray = (tokens: TokenInfoWithBalance[]) => {
    for (const token of tokens) {
      const compositeKey = generateCompositeKey(token)
      const existingToken = tokenMap.get(compositeKey)

      if (!existingToken) {
        tokenMap.set(compositeKey, token)
      } else {
        const existingHasTags = existingToken.tags?.length > 0
        const currentHasTags = token.tags?.length > 0
        if (currentHasTags && !existingHasTags) {
          tokenMap.set(compositeKey, {
            ...existingToken,
            ...token,
            platform_id: token.platform_id ?? existingToken.platform_id,
            balance: token.balance ?? existingToken.balance,
            usdPrice: token.usdPrice ?? existingToken.usdPrice
          })
        } else if (!currentHasTags && existingHasTags) {
          tokenMap.set(compositeKey, {
            ...existingToken,
            platform_id: existingToken.platform_id ?? token.platform_id,
            balance: existingToken.balance ?? token.balance,
            usdPrice: existingToken.usdPrice ?? token.usdPrice
          })
        } else {
          tokenMap.set(compositeKey, {
            ...existingToken,
            ...token,
            platform_id: token.platform_id ?? existingToken.platform_id
          })
        }
      }
    }
  }

  processArray(arr1)
  processArray(arr2)
  return Array.from(tokenMap.values())
}
