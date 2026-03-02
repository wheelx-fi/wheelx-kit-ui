import {
  ChainsAndTokens,
  mergeTokensWithCompositeKey,
  TokenBalance,
  TokenInfoWithBalance
} from '../../api'
import { enableTestnet } from '../../utils'
import { useCallback, useMemo, useState } from 'react'
import { base, baseSepolia, sepolia, bsc, soneium, ink } from 'viem/chains'
import { mainnet } from '../../consts/mainnet'
import { getOrderedTokensChainNormal } from '../utils'
import { monad } from '../../consts/monad'
import { stable } from '../../consts/stable'
// import { plasma } from '@/app/consts/plasma'

interface Props {
  data?: ChainsAndTokens
  selectedChain: number | null
  userBalances?: TokenBalance[]
  selectedChainByPlatformId?: number | null
}

export const popularChainsIds: number[] = enableTestnet()
  ? [sepolia.id, baseSepolia.id]
  : [mainnet.id, base.id, ink.id, bsc.id, monad.id, soneium.id, stable.id]

export const useChainsAndTokensForSelect = ({
  data,
  selectedChain,
  userBalances,
  selectedChainByPlatformId
}: Props) => {
  const chains = data?.chains || []
  const tokensData = data?.tokens || []
  const predictionChains = data?.deposit_platforms?.prediction?.chains || []
  const predictionTokens = data?.deposit_platforms?.prediction?.tokens || []

  const allChains = useMemo(
    () => [...chains, ...predictionChains],
    [chains, predictionChains]
  )

  const allTokens = useMemo(
    () => [...tokensData, ...predictionTokens],
    [tokensData, predictionTokens]
  )

  const [searchChainsValue, setSearchChainsValue] = useState('')
  const [searchTokensValue, setSearchTokensValue] = useState('')

  const handleSearchChains = (value: string) => {
    setSearchChainsValue(value)
  }

  const handleSearchTokens = (value: string) => {
    setSearchTokensValue(value)
  }

  const resetSearch = useCallback(() => {
    setSearchChainsValue('')
    setSearchTokensValue('')
  }, [])

  const popularChains = useMemo(
    () =>
      (allChains ?? [])
        .filter((chain) => chain.is_popular === true)
        .sort((a, b) => {
          const nameA = a.name.toLowerCase()
          const nameB = b.name.toLowerCase()
          if (nameA < nameB) return -1
          if (nameA > nameB) return 1
          return 0
        }),
    [allChains]
  )
  // console.log('popularChains: ', popularChains)

  const currentChain = useMemo(() => {
    if (selectedChainByPlatformId) {
      return allChains?.find(
        (chain) => chain.platform_id === selectedChainByPlatformId
      )
    } else {
      return allChains?.find((chain) => chain.chain_id === selectedChain)
    }
  }, [allChains, selectedChain])

  const searchChains = useMemo(() => {
    return allChains?.filter((chain) => {
      if (searchChainsValue === '') return false
      return (
        chain.name.toLowerCase().includes(searchChainsValue.toLowerCase()) ||
        chain.chain_id.toString().includes(searchChainsValue.toLowerCase())
      )
    })
  }, [allChains, searchChainsValue])

  // A-Z
  const orderedChains = useMemo(
    () =>
      allChains
        ?.filter((chain) => !chain.is_popular)
        .sort((a, b) => {
          const firstCharA = a.name.toLowerCase()
          const firstCharB = b.name.toLowerCase()
          if (firstCharA < firstCharB) return -1
          if (firstCharA > firstCharB) return 1
          // if (a.name < b.name) return -1
          // if (a.name > b.name) return 1
          return 0
        }),
    [allChains]
  )

  // const [tokensWithBalances, setTokensWithBalances] = useState<
  //   TokenInfoWithBalance[] | undefined
  // >(allTokens)

  // const [tokensAndBalances, setTokensAndBalances] = useState<
  //   TokenInfoWithBalance[] | undefined
  // >(allTokens)

  // useEffect(() => {
  //   // console.log('tokensData: ', tokensData, userBalances)
  //   if (allTokens) {
  //     if (userBalances) {
  //       const tokensWithBalances = allTokens.map((token) => {
  //         const balance = userBalances.find(
  //           (balance) =>
  //             balance.chain_id === token.chain_id &&
  //             balance.token.address === token.address
  //         )
  //         return {
  //           ...token,
  //           balance: balance?.balance,
  //           usdPrice: balance?.price
  //         }
  //       })
  //       return setTokensWithBalances(tokensWithBalances)
  //     }
  //     setTokensWithBalances(allTokens)
  //   }
  // }, [allTokens, userBalances])

  // useEffect(() => {
  //   if (tokensWithBalances?.length && userBalances?.length) {
  //     const newUserBalances: TokenInfoWithBalance[] | undefined = []
  //     userBalances.map((item) => {
  //       const newItem = {
  //         ...item.token,
  //         balance: item?.balance,
  //         usdPrice: item?.price
  //       }
  //       newUserBalances.push(newItem)
  //     })
  //     const merged = mergeTokensWithCompositeKey(
  //       newUserBalances,
  //       tokensWithBalances
  //     )
  //     setTokensAndBalances(merged)
  //   } else {
  //     setTokensAndBalances(tokensWithBalances)
  //   }
  // }, [tokensWithBalances, userBalances])

  const tokensWithBalances = useMemo(() => {
    if (!allTokens) return undefined
    if (userBalances) {
      return allTokens.map((token) => {
        const balance = userBalances.find(
          (balance) =>
            balance.chain_id === token.chain_id &&
            balance.token.address === token.address
        )
        return {
          ...token,
          balance: balance?.balance,
          usdPrice: balance?.price
        }
      })
    }
    return allTokens
  }, [allTokens, userBalances])

  const tokensAndBalances = useMemo(() => {
    if (tokensWithBalances?.length && userBalances?.length) {
      const newUserBalances: TokenInfoWithBalance[] | undefined = []
      userBalances.forEach((item) => {
        const newItem = {
          ...item.token,
          balance: item?.balance,
          usdPrice: item?.price
        }
        newUserBalances.push(newItem)
      })
      return mergeTokensWithCompositeKey(newUserBalances, tokensWithBalances)
    }
    return tokensWithBalances
  }, [tokensWithBalances, userBalances])

  // console.log('###### all tokensWithBalances #######:', tokensWithBalances)
  // console.log('###### all tokensAndBalances #######:', tokensAndBalances)

  const tokens = useMemo(() => {
    if (currentChain?.platform_id && currentChain.platform_id > 0) {
      return getOrderedTokensChainNormal(
        tokensAndBalances,
        currentChain.platform_id,
        'platform_id'
      )
    } else {
      return getOrderedTokensChainNormal(tokensAndBalances, selectedChain)
    }
  }, [selectedChain, tokensAndBalances, currentChain])

  // console.log(
  //   '#### selectedChain ######: ',
  //   selectedChain,
  //   tokens,
  //   tokensAndBalances
  // )

  return {
    popularChains,
    orderedChains,
    searchChains,
    tokens,
    searchChainsValue,
    searchTokensValue,
    handleSearchChains,
    handleSearchTokens,
    resetSearch,
    allChains
  }
}
