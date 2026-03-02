import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { zeroAddress } from 'viem'
import {
  // form,
  // arbitrum,
  // arbitrumSepolia,
  // mainnet,
  // sepolia,
  soneium,
  soneiumMinato,
  base,
  baseSepolia
} from 'viem/chains'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { TokenInfo, useTokenInfoBySymbol } from '../../api'
import { useTxStateContextStore } from './useTxStateContextStore'
import { enableTestnet, isValidWeb3TokenAddress } from '../../utils'
import {
  toRegex,
  toAndTokenRegex,
  fromRegex,
  fromAndTokenRegex,
  fromAndToRegex,
  fromAndTokenAndToAndTokenRegex,
  matchesAnyPatternUsingArray
} from '../../utils/shortLinkRegex'
import { findItemByName, findItemBySymbol } from '../../commons/utils'
import { useChainsStore, useTokensStore } from '../../stores'
import { useDifferentAddressStore } from '../../stores/useDifferentAddressStore'
import { useAccount } from 'wagmi'
import { ArcTestnetChainId } from '../../consts'
import ethTokenIcon from '../../assets/images/tokens/eth.png'
import { getAssetSrc } from '../../utils/getAssetSrc'

export interface SwapState {
  fromTokenInfo: TokenInfo
  toTokenInfo: TokenInfo
  fromAmount: string
  toAmount: string
  slippage?: string
  fromAmountToUsd?: string | null
  toAmountToUsd?: string | null
  isShortLink?: boolean
  shortLink?: string
  transactionType?: string
  autoSlippage?: number | undefined
}

interface SwapAndBridgeContextStore extends SwapState {
  // Actions
  setFromTokenInfo: (tokenInfo: TokenInfo) => void
  setToTokenInfo: (tokenInfo: TokenInfo) => void
  setFromAmount: (amount: string) => void
  setToAmount: (amount: string) => void
  switchTokens: () => void
  resetState: () => void
  setAmounts: (fromAmount: string, toAmount: string) => void
  resetAmounts: () => void
  setSlippage: (slippage?: string) => void
  setFromAmountToUsd: (value: string | null) => void
  setToAmountToUsd: (value: string | null) => void
  setIsShortLink: (value: boolean) => void
  setShortLink: (value: string) => void
  setTransactionType: (value: string) => void
  setAutoSlippage: (value: number | undefined) => void
}

const isTestnet = enableTestnet()

const DEFAULT_FROM_TOKEN: TokenInfo = {
  name: 'ETH',
  address: zeroAddress,
  chain_id: isTestnet ? soneiumMinato.id : soneium.id,
  decimals: 18,
  symbol: 'ETH',
  logo: getAssetSrc(ethTokenIcon),
  tags: ['pin']
}

const DEFAULT_TO_TOKEN: TokenInfo = {
  name: 'ETH',
  address: zeroAddress,
  chain_id: isTestnet ? baseSepolia.id : base.id,
  decimals: 18,
  symbol: 'ETH',
  logo: getAssetSrc(ethTokenIcon),
  tags: ['pin']
}

const initialState: SwapState = {
  fromTokenInfo: DEFAULT_FROM_TOKEN,
  toTokenInfo: DEFAULT_TO_TOKEN,
  fromAmount: '',
  toAmount: '',
  fromAmountToUsd: '',
  toAmountToUsd: '',
  transactionType: '',
  autoSlippage: undefined
}

export const useSwapAndBridgeContextStore = create<SwapAndBridgeContextStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setFromTokenInfo: (tokenInfo: TokenInfo) => {
        const { toTokenInfo, fromTokenInfo, isShortLink } = get()
        // Prevent setting the same token on both sides
        if (
          tokenInfo.address === toTokenInfo.address &&
          tokenInfo.chain_id === toTokenInfo.chain_id
        ) {
          if (isShortLink) {
            // console.log(11111111111111111111, isShortLink)
            set({
              fromTokenInfo: tokenInfo,
              fromAmount: '',
              toAmount: ''
            })
          } else {
            set({
              fromTokenInfo: tokenInfo,
              toTokenInfo: fromTokenInfo,
              fromAmount: '',
              toAmount: ''
            })
          }
        } else {
          set({
            fromTokenInfo: tokenInfo,
            fromAmount: '',
            toAmount: ''
          })
        }
      },

      setToTokenInfo: (tokenInfo: TokenInfo) => {
        const { fromTokenInfo, toTokenInfo, isShortLink, shortLink } = get()
        if (
          tokenInfo.address === fromTokenInfo.address &&
          tokenInfo.chain_id === fromTokenInfo.chain_id
        ) {
          if (isShortLink && shortLink !== '/soneium') {
            set({
              toTokenInfo: tokenInfo,
              fromAmount: '',
              toAmount: ''
            })
          } else {
            set({
              fromTokenInfo: toTokenInfo,
              toTokenInfo: tokenInfo,
              fromAmount: '',
              toAmount: ''
            })
          }
        } else {
          set({
            toTokenInfo: tokenInfo,
            fromAmount: '',
            toAmount: ''
          })
        }
      },

      setFromAmount: (amount: string) => {
        // Validate amount format
        if (amount === '' || /^\d*\.?\d*$/.test(amount)) {
          set({ fromAmount: amount })
        }
      },

      setToAmount: (amount: string) => {
        // Validate amount format
        if (amount === '' || /^\d*\.?\d*$/.test(amount)) {
          // console.log('#####here#####', amount)
          set({ toAmount: amount })
        }
      },

      setAmounts: (fromAmount: string, toAmount: string) => {
        set({ fromAmount, toAmount })
      },

      switchTokens: () => {
        const { fromTokenInfo, toTokenInfo, fromAmount, toAmount } = get()
        set({
          fromTokenInfo: toTokenInfo,
          toTokenInfo: fromTokenInfo,
          fromAmount: toAmount,
          toAmount: fromAmount
        })
      },

      resetState: () => set(initialState),
      resetAmounts: () => set({ fromAmount: '', toAmount: '' }),
      setSlippage: (slippage?: string) => set({ slippage }),
      setFromAmountToUsd: (value: string) => set({ fromAmountToUsd: value }),
      setToAmountToUsd: (value: string) => set({ toAmountToUsd: value }),
      setTransactionType: (value: string) => set({ transactionType: value }),
      setAutoSlippage: (value: number | undefined) =>
        set({ autoSlippage: value }),
      setIsShortLink: (value: boolean) => set({ isShortLink: value }),
      setShortLink: (value: string) => set({ shortLink: value })
    }),
    { name: 'swap-and-bridge-store' }
  )
)
export const useInitSwapAndBridgeState = () => {
  const { setFromTokenInfo, setToTokenInfo, setIsShortLink, setShortLink } =
    useSwapAndBridgeContextStore()

  const searchParams = useMemo(
    () =>
      new URLSearchParams(
        typeof window !== 'undefined' ? window?.location?.search : ''
      ),
    []
  )

  const fromTokenAddress = useMemo(
    () => searchParams.get('from_token'),
    [searchParams]
  )
  const fromTokenSymbol = useMemo(
    () => searchParams.get('from_symbol'),
    [searchParams]
  )
  const toTokenSymbol = useMemo(
    () => searchParams.get('to_symbol'),
    [searchParams]
  )
  const toTokenAddress = useMemo(
    () => searchParams.get('to_token'),
    [searchParams]
  )
  const fromChainId = useMemo(
    () => searchParams.get('from_chain'),
    [searchParams]
  )
  const toChainId = useMemo(() => searchParams.get('to_chain'), [searchParams])

  const pathname = usePathname()
  const [hasFromSymbol, setHasFromSymbol] = useState(false)
  const [hasToSymbol, setHasToSymbol] = useState(false)

  const { data: searchFromTokenInfoResult } = useTokenInfoBySymbol({
    value: fromTokenAddress || '',
    chainId: fromChainId ? +fromChainId : undefined,
    hasSymbol: hasFromSymbol
  })

  const { data: searchToTokenInfoResult } = useTokenInfoBySymbol({
    value: toTokenAddress || '',
    chainId: toChainId ? +toChainId : undefined,
    hasSymbol: hasToSymbol
  })

  // const { data } = useChainsAndTokens()
  const { chains, setIsSelectPredictionChain } = useChainsStore()
  const { tokens } = useTokensStore()
  const { setDifferentAddress, setIsDepositPlatformToken } =
    useDifferentAddressStore()

  const fromTokenInfo = useMemo(() => {
    let result = tokens?.find(
      (token) =>
        token.address === fromTokenAddress &&
        token.chain_id === Number(fromChainId)
    )
    if (!result && fromTokenAddress && fromChainId && fromTokenSymbol) {
      if (isValidWeb3TokenAddress(fromTokenAddress)) {
        const hasToken = tokens?.find(
          (token) => token.chain_id === Number(fromChainId)
        )
        if (hasToken) {
          setHasFromSymbol(true)
          if (searchFromTokenInfoResult) {
            result = searchFromTokenInfoResult[0]
          }
        }
      }
    }
    return result
  }, [
    tokens,
    fromChainId,
    fromTokenAddress,
    fromTokenSymbol,
    searchFromTokenInfoResult
  ])

  const toTokenInfo = useMemo(() => {
    let result = tokens?.find(
      (token) =>
        token.address === toTokenAddress && token.chain_id === Number(toChainId)
    )
    if (!result && toTokenAddress && toChainId && toTokenSymbol) {
      if (isValidWeb3TokenAddress(toTokenAddress)) {
        const hasToken = tokens?.find(
          (token) => token.chain_id === Number(toChainId)
        )
        if (hasToken) {
          setHasToSymbol(true)
          if (searchToTokenInfoResult) {
            result = searchToTokenInfoResult[0]
          }
        }
      }
    }
    return result
  }, [
    tokens,
    searchToTokenInfoResult,
    toChainId,
    toTokenAddress,
    toTokenSymbol
  ])

  // console.log('########toTokenInfo#########:', toTokenInfo)

  const [isSetFromTokenInfo, setIsSetFromTokenInfo] = useState(false)
  const [isSetToTokenInfo, setIsSetToTokenInfo] = useState(false)
  const { address } = useAccount()

  useEffect(() => {
    if (!chains || !tokens) return
    if (!pathname) return
    const newPath = decodeURIComponent(pathname.replace(/\/+$/, ''))
    // console.log('####newPath####', newPath)
    if (matchesAnyPatternUsingArray(newPath)) {
      setIsShortLink(true)
      setShortLink(newPath)
      if (toRegex.test(newPath)) {
        const [exists, chainsInfo] = findItemByName(
          chains,
          newPath.replace('/', '')
        )
        if (!exists) return
        const foundItem = tokens.find((item) => {
          if (chainsInfo?.platform_id && chainsInfo?.platform_id > 0) {
            setIsSelectPredictionChain(true)
            setIsDepositPlatformToken(true)
            setDifferentAddress(undefined)
            return item.platform_id === chainsInfo?.platform_id
          } else {
            setIsSelectPredictionChain(false)
            setIsDepositPlatformToken(false)
            setDifferentAddress(address)
            return item.chain_id === chainsInfo?.chain_id
          }
        })
        if (!foundItem) return
        if (foundItem) {
          setToTokenInfo(foundItem)
          setIsSetToTokenInfo(true)
          if (chainsInfo?.chain_id === ArcTestnetChainId) {
            const [, eurcToken] = findItemBySymbol(
              tokens,
              'EURC',
              ArcTestnetChainId
            )
            if (eurcToken) {
              setFromTokenInfo(eurcToken)
              setIsSetFromTokenInfo(true)
            }
          }
        }
      } else if (toAndTokenRegex.test(newPath)) {
        // console.log('####newPath####', newPath, 2222)
        const arr = newPath.replace('/', '').split('&')
        const [exists, chainsInfo] = findItemByName(chains, arr[0])
        if (!exists) return
        const [result, item] = findItemBySymbol(
          tokens,
          arr[1],
          chainsInfo?.chain_id,
          chainsInfo?.platform_id
        )
        if (!result) return
        if (result && item) {
          if (item?.platform_id && item?.platform_id > 0) {
            setIsSelectPredictionChain(true)
            setIsDepositPlatformToken(true)
            setDifferentAddress(undefined)
          } else {
            setIsSelectPredictionChain(false)
            setIsDepositPlatformToken(false)
            setDifferentAddress(address)
          }
          setToTokenInfo(item)
          setIsSetToTokenInfo(true)
        }
      } else if (fromRegex.test(newPath)) {
        const arr = newPath.split('&')
        const [exists, chainsInfo] = findItemByName(chains, arr[1])
        if (!exists) return
        const foundItem = tokens.find(
          (item) => item.chain_id === chainsInfo?.chain_id
        )
        if (!foundItem) return
        if (foundItem) {
          setFromTokenInfo(foundItem)
          setIsSetFromTokenInfo(true)
        }
      } else if (fromAndTokenRegex.test(newPath)) {
        const arr = newPath.split('&')
        const [exists, chainsInfo] = findItemByName(chains, arr[1])
        if (!exists) return
        const [result, item] = findItemBySymbol(
          tokens,
          arr[2],
          chainsInfo?.chain_id
        )
        if (!result) return
        if (result && item) {
          setFromTokenInfo(item)
          setIsSetFromTokenInfo(true)
        }
      } else if (fromAndToRegex.test(newPath)) {
        const arr = newPath.split('/')
        const [resultFrom, fromChainsInfo] = findItemByName(chains, arr[1])
        if (!resultFrom) return
        const foundFromItem = tokens.find(
          (item) => item.chain_id === fromChainsInfo?.chain_id
        )
        if (!foundFromItem) return
        if (foundFromItem) {
          setFromTokenInfo(foundFromItem)
          setIsSetFromTokenInfo(true)
        }
        const [resultTo, toChainsInfo] = findItemByName(chains, arr[2])
        // console.log('##### toChainsInfo #####:', toChainsInfo)
        if (!resultTo) return
        let foundToItem
        if (arr[1] === arr[2]) {
          const allMatchedItems = tokens.filter(
            (item) => item.chain_id === toChainsInfo?.chain_id
          )
          foundToItem =
            allMatchedItems.length > 1 ? allMatchedItems[1] : undefined
        } else {
          foundToItem = tokens.find((item) => {
            if (toChainsInfo?.platform_id && toChainsInfo?.platform_id > 0) {
              return item.platform_id === toChainsInfo?.platform_id
            } else {
              return item.chain_id === toChainsInfo?.chain_id
            }
          })
        }
        if (!foundToItem) return
        if (foundToItem) {
          if (foundToItem?.platform_id && foundToItem?.platform_id > 0) {
            setIsSelectPredictionChain(true)
            setIsDepositPlatformToken(true)
            setDifferentAddress(undefined)
          } else {
            setIsSelectPredictionChain(false)
            setIsDepositPlatformToken(false)
            setDifferentAddress(address)
          }
          setToTokenInfo(foundToItem)
          setIsSetToTokenInfo(true)
        }
      } else if (fromAndTokenAndToAndTokenRegex.test(newPath)) {
        // console.log('### fromAndTokenAndToAndTokenRegex ####:', 11111)
        const arr = newPath.split('/')
        const arrFrom = arr[1].split('&')
        const [resultFrom, fromChainsInfo] = findItemByName(chains, arrFrom[0])
        if (!resultFrom) return
        const [resultFromToken, fromTokenInfo] = findItemBySymbol(
          tokens,
          arrFrom[1],
          fromChainsInfo?.chain_id,
          fromChainsInfo?.platform_id
        )
        // console.log(
        //   '### fromTokenInfo ####:',
        //   fromTokenInfo,
        //   fromChainsInfo,
        //   resultFromToken
        // )
        if (!resultFromToken) return
        const arrTo = arr[2].split('&')
        const [resultTo, toChainsInfo] = findItemByName(chains, arrTo[0])
        // console.log('### toChainsInfo ####:', toChainsInfo)
        if (!resultTo) return
        const [resultToToken, toTokenInfo] = findItemBySymbol(
          tokens,
          arrTo[1],
          toChainsInfo?.chain_id,
          toChainsInfo?.platform_id
        )
        // console.log('### toTokenInfo ####:', toTokenInfo)
        if (!resultToToken) return
        if (fromTokenInfo && toTokenInfo) {
          if (toTokenInfo?.platform_id && toTokenInfo?.platform_id > 0) {
            setIsSelectPredictionChain(true)
            setIsDepositPlatformToken(true)
            setDifferentAddress(undefined)
          } else {
            setIsSelectPredictionChain(false)
            setIsDepositPlatformToken(false)
            setDifferentAddress(address)
          }
          setFromTokenInfo(fromTokenInfo)
          setIsSetFromTokenInfo(true)
          setToTokenInfo(toTokenInfo)
          setIsSetToTokenInfo(true)
        }
      }
    } else {
      setIsShortLink(false)
    }
  }, [
    pathname,
    tokens,
    setToTokenInfo,
    setFromTokenInfo,
    setIsShortLink,
    setShortLink,
    address,
    setDifferentAddress,
    setIsDepositPlatformToken,
    setIsSelectPredictionChain
  ])

  useEffect(() => {
    if (isSetFromTokenInfo || !fromTokenAddress || !fromChainId) return

    if (fromTokenInfo) {
      setFromTokenInfo(fromTokenInfo)
      setIsSetFromTokenInfo(true)
    }
  }, [
    fromChainId,
    fromTokenAddress,
    fromTokenInfo,
    isSetFromTokenInfo,
    setFromTokenInfo
  ])

  useEffect(() => {
    if (isSetToTokenInfo || !toTokenAddress || !toChainId) return
    if (toTokenInfo) {
      setToTokenInfo(toTokenInfo)
      setIsSetToTokenInfo(true)
    }
  }, [isSetToTokenInfo, setToTokenInfo, toChainId, toTokenAddress, toTokenInfo])
}

export const useResetSwapAndBridgeState = () => {
  const { resetAmounts } = useSwapAndBridgeContextStore()
  const { resetTxState } = useTxStateContextStore()
  const router = useRouter()
  useEffect(() => {
    return () => {
      resetAmounts()
      resetTxState()
    }
  }, [resetAmounts, resetTxState, router])
}
