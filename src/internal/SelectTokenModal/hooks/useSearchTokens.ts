import { TokenInfoWithBalance, useTokenInfo } from '../../api'
import { useMemo } from 'react'
import {
  getOrderedTokensChainSearch,
  getOrderedTokensAssets,
  mergeAndDeduplicate
} from '../utils'

interface Props {
  searchTokensValue: string
  selectedChain?: number | null
  allTokens?: TokenInfoWithBalance[]
}

export const useSearchTokens = ({
  searchTokensValue,
  selectedChain,
  allTokens
}: Props) => {
  const { data: searchTokenInfoResult, isLoading: isLoadingSearchTokenInfo } =
    useTokenInfo({
      value: searchTokensValue,
      chainId: selectedChain ?? undefined
    })

  const newAllToken = useMemo(
    () =>
      allTokens?.map((token) => ({
        ...token,
        token_type: 'preset' as const
      })),
    [allTokens]
  )

  const searchTokensInfo = useMemo(() => {
    if (!searchTokensValue) {
      return undefined
    }

    if (searchTokenInfoResult) {
      const tokenWithBalances = searchTokenInfoResult.map((token) => {
        const balance = newAllToken?.find(
          (balance) =>
            balance.chain_id === token.chain_id &&
            balance.address === token.address
        )
        return {
          ...token,
          balance: balance?.balance,
          usdPrice: balance?.usdPrice
        }
      })

      const filteredTokens = newAllToken?.filter((token) => {
        return token.symbol
          .toLowerCase()
          .includes(searchTokensValue.toLowerCase())
      })

      if (filteredTokens) {
        const newArr = mergeAndDeduplicate(tokenWithBalances, filteredTokens)
        if (!selectedChain) {
          return getOrderedTokensAssets(newArr, selectedChain)
        } else {
          return getOrderedTokensChainSearch(newArr, selectedChain)
        }
      } else {
        if (!selectedChain) {
          return getOrderedTokensAssets(tokenWithBalances, selectedChain)
        } else {
          return getOrderedTokensChainSearch(tokenWithBalances, selectedChain)
        }
      }
    } else {
      const filteredTokens = newAllToken?.filter((token) => {
        if (searchTokensValue === '') return true
        return token.symbol
          .toLowerCase()
          .includes(searchTokensValue.toLowerCase())
      })
      if (!selectedChain) {
        return getOrderedTokensAssets(filteredTokens, selectedChain)
      } else {
        return getOrderedTokensChainSearch(filteredTokens, selectedChain)
      }
    }
  }, [newAllToken, searchTokenInfoResult, searchTokensValue, selectedChain])

  return {
    searchTokensInfo,
    isLoadingSearchTokenInfo
  }
}
