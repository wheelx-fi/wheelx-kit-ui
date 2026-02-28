'use client'
import { VStack, Box, Image, Link as ChakraLink } from '@chakra-ui/react'

import { FormBody } from './FormBody'
import { FormTop } from './FormTop'
import {
  useInitSwapAndBridgeState,
  useResetSwapAndBridgeState,
  useSwapAndBridgeContextStore,
  useTxStateContextStore
} from './hooks'
import { TxState } from './TxState'
import { QuoteRequest, useGetQuote, type Tag, type TokenInfo } from '../api'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Fraction } from 'bi-fraction'
import { formatTokenAmount, slippageStore, isApproveValid } from '../utils'
import { TxInfoProps, routesItem } from './TxInfo'
import { useAccount } from 'wagmi'
import { parseUnits } from 'viem'
import {
  autoRefetchInterval,
  calculateSlippage,
  extractVPathSegment,
  nullAddress
} from './utils'
import { RefetchQuoteParams } from './FormTop'
import { useRefreshLoading } from './hooks/useRefreshLoading'

import { useDifferentAddressStore } from '../stores/useDifferentAddressStore'
import { useChainsStore, useTokensStore } from '../stores'
import {
  bridgeAutoSlippage,
  swapAutoSlippage,
  crossChainSwapAutoSlippage
} from './utils/index'
import {
  useWheelxWidgetConfig,
  useWheelxWidgetStyles
} from '../../config'
import wheelSprites from '../assets/images/wheel-sprites.png'
import successSprites from '../assets/images/success-sprites.png'
import ethTokenIcon from '../assets/images/tokens/eth.png'
import defaultTokenIcon from '../assets/images/default-token-icon.png'
import { getAssetSrc } from '../utils/getAssetSrc'
import { Text } from '../ui'
import { zeroAddress } from 'viem'
export interface QuoteInfo {
  isFetching: boolean
  error: string | null
  data: `0x${string}` | null
  contractAddress: `0x${string}` | null
  info: TxInfoProps | null
  request_id?: string | null
  gas?: bigint | null
  maxFeePerGas?: bigint | undefined
  maxPriorityFeePerGas?: bigint | undefined
  backApprove?: boolean
  router_type?: string | null
  tx_value?: string | null
  quote_message?: string | null
  routes?: routesItem[]
}

export interface QuoteRequestWithToTokenDecimals extends QuoteRequest {
  toTokenDecimals: number
  isAutoRefetch?: boolean
  affiliation?: string | null
}

export const initialQuoteInfo: QuoteInfo = {
  isFetching: false,
  error: null,
  data: null,
  contractAddress: null,
  info: null,
  request_id: null,
  backApprove: false,
  router_type: null
}

export const MainForm = () => {
  const { fromTxHash } = useTxStateContextStore()
  useResetSwapAndBridgeState()
  useInitSwapAndBridgeState()

  const { startLoading } = useRefreshLoading()
  const {
    fromTokenInfo,
    toTokenInfo,
    fromAmount,
    toAmount,
    setToAmount,
    setAutoSlippage,
    autoSlippage
  } = useSwapAndBridgeContextStore()

  const [quoteInfo, setQuoteInfo] = useState<QuoteInfo>(initialQuoteInfo)
  const { address, isConnected } = useAccount()
  const slippage = address
    ? slippageStore.get(address)
      ? slippageStore.get(address)
      : autoSlippage
    : autoSlippage
      ? autoSlippage
      : undefined

  const abortControllerRef = useRef(new AbortController())
  const { mutateAsync } = useGetQuote(abortControllerRef.current.signal)

  const cancelMutation = () => {
    abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()
    // setQuoteInfo(initialQuoteInfo)
  }

  const [routerType, setRouterType] = useState<string | undefined | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mainFormRef = useRef<HTMLDivElement>(null)
  const didApplyWidgetDefaultsRef = useRef(false)
  const widgetDefaultsKeyRef = useRef<string | null>(null)
  const { differentAddress } = useDifferentAddressStore()
  const { chains } = useChainsStore()
  const { tokens } = useTokensStore()
  const widgetStyles = useWheelxWidgetStyles()
  const widgetConfig = useWheelxWidgetConfig()
  const { mode, networks, defaultTokens, getAllowedTokens, isTokenAllowed } =
    widgetConfig
  const fromAllowedChainIds = networks.from
  const toAllowedChainIds = networks.to
  const fromAllowedTokens = getAllowedTokens('from')
  const toAllowedTokens = getAllowedTokens('to')

  const applyTokenSelection = useCallback(
    (nextFrom: TokenInfo, nextTo: TokenInfo) => {
      useSwapAndBridgeContextStore.setState((state) => ({
        ...state,
        fromTokenInfo: nextFrom,
        toTokenInfo: nextTo,
        fromAmount: '',
        toAmount: ''
      }))
    },
    []
  )

  useLayoutEffect(() => {
    if (tokens?.length) return

    const buildPreviewToken = ({
      chainId,
      address = zeroAddress,
      symbol = 'ETH'
    }: {
      chainId: number
      address?: `0x${string}`
      symbol?: string
    }): TokenInfo => ({
      name: symbol,
      address,
      chain_id: chainId,
      decimals: 18,
      symbol,
      logo: getAssetSrc(
        symbol.toUpperCase() === 'ETH' || address === zeroAddress
          ? ethTokenIcon
          : defaultTokenIcon
      ),
      tags: ['pin'] as Tag[]
    })

    const resolvePreviewToken = (
      side: 'from' | 'to',
      fallbackChainId: number,
      fallbackToken: typeof fromTokenInfo
    ) => {
      const preset = defaultTokens[side]
      if (preset && preset.chainId === fallbackChainId) {
        return buildPreviewToken({
          chainId: preset.chainId,
          address: preset.address as `0x${string}`,
          symbol: preset.symbol ?? fallbackToken.symbol
        })
      }

      if (fallbackToken.chain_id === fallbackChainId) {
        return fallbackToken
      }

      return buildPreviewToken({
        chainId: fallbackChainId,
        symbol: fallbackToken.symbol
      })
    }

    let nextFrom = fromTokenInfo
    let nextTo = toTokenInfo

    if (mode === 'swap') {
      const swapChainId =
        defaultTokens.from?.chainId ??
        defaultTokens.to?.chainId ??
        fromAllowedChainIds?.[0] ??
        toAllowedChainIds?.[0] ??
        fromTokenInfo.chain_id

      nextFrom = resolvePreviewToken('from', swapChainId, fromTokenInfo)
      nextTo = resolvePreviewToken('to', swapChainId, toTokenInfo)
    } else {
      if (fromAllowedChainIds?.[0]) {
        nextFrom = resolvePreviewToken(
          'from',
          fromAllowedChainIds[0],
          fromTokenInfo
        )
      } else if (defaultTokens.from?.chainId) {
        nextFrom = resolvePreviewToken(
          'from',
          defaultTokens.from.chainId,
          fromTokenInfo
        )
      }

      if (toAllowedChainIds?.[0]) {
        nextTo = resolvePreviewToken('to', toAllowedChainIds[0], toTokenInfo)
      } else if (defaultTokens.to?.chainId) {
        nextTo = resolvePreviewToken(
          'to',
          defaultTokens.to.chainId,
          toTokenInfo
        )
      }
    }

    const isFromChanged =
      nextFrom.chain_id !== fromTokenInfo.chain_id ||
      nextFrom.address !== fromTokenInfo.address ||
      nextFrom.symbol !== fromTokenInfo.symbol
    const isToChanged =
      nextTo.chain_id !== toTokenInfo.chain_id ||
      nextTo.address !== toTokenInfo.address ||
      nextTo.symbol !== toTokenInfo.symbol

    if (isFromChanged || isToChanged) {
      applyTokenSelection(nextFrom, nextTo)
    }
  }, [
    applyTokenSelection,
    defaultTokens,
    fromAllowedChainIds,
    fromTokenInfo,
    mode,
    toAllowedChainIds,
    toTokenInfo,
    tokens
  ])

  useEffect(() => {
    if (
      timerRef.current &&
      (new Fraction(fromAmount).eq(0) || fromTxHash || isConnected)
    ) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [fromAmount, fromTxHash, isConnected])

  const stopAutoRefetch = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const getQuote = useCallback(
    async ({
      toTokenDecimals,
      isAutoRefetch,
      ...params
    }: QuoteRequestWithToTokenDecimals) => {
      try {
        if (!isAutoRefetch) {
          cancelMutation()
        }
        if (!parseFloat(params.amount)) return
        // setQuoteInfo({ ...initialQuoteInfo, isFetching: true })
        setQuoteInfo((prevQuoteInfo) => ({
          ...prevQuoteInfo,
          isFetching: true
        }))
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
        const res = await mutateAsync({ ...params })
        if (res) {
          const toAmount = formatTokenAmount({
            amount: new Fraction(res.amount_out),
            decimals: toTokenDecimals,
            useGroupSeparator: false
          })
          const contractAddress = res.tx?.to || null
          const data = res.tx?.data || null
          setToAmount(toAmount)
          setQuoteInfo({
            isFetching: false,
            error: null,
            data,
            contractAddress,
            request_id: res.request_id,
            gas: res.tx?.gas || null,
            maxFeePerGas: res.tx?.maxFeePerGas || undefined,
            maxPriorityFeePerGas: res.tx?.maxFeePerGas || undefined,
            tx_value: res.tx?.value || null,
            router_type: res.router_type,
            routes: res.routes,
            quote_message: res.quote_message,
            backApprove: isApproveValid(res.approve || null),
            info: {
              priceImpact: {
                bridgeFee: res.price_impact.bridge_fee,
                dstGasFee: res.price_impact.dst_gas_fee,
                swapFee: res.price_impact.swap_fee,
                before_discount_fee: res.price_impact.before_discount_fee,
                discount_percentage: res.price_impact.discount_percentage
              },
              slippage: res.slippage,
              minReceive: res.min_receive,
              estimatedTime: res.estimated_time,
              recipient: res.recipient,
              router: res.router,
              amountOut: res.amount_out,
              router_type: res.router_type
            }
          })
          setRouterType(res.router_type)
          if (params.from_address !== nullAddress) {
            timerRef.current = setTimeout(async () => {
              startLoading()
              await getQuote({
                ...params,
                toTokenDecimals,
                isAutoRefetch: true
              })
            }, autoRefetchInterval)
          }
        }
      } catch (error) {
        setQuoteInfo({
          isFetching: false,
          error: (error as Error).message || 'Failed to get quote',
          data: null,
          contractAddress: null,
          info: null,
          request_id: null
        })
      }
    },
    [mutateAsync, setToAmount, startLoading]
  )

  const refetchQuote = useCallback(
    async ({ slippageValue, isAutoSlippage }: RefetchQuoteParams = {}) => {
      startLoading()
      if (!fromAmount || !address) return
      const vCode = extractVPathSegment()
      await getQuote({
        from_chain: fromTokenInfo.chain_id,
        to_chain: toTokenInfo.chain_id,
        from_token: fromTokenInfo.address,
        to_token: toTokenInfo.address,
        from_address: address,
        to_address: differentAddress ? differentAddress : address,
        amount: parseUnits(fromAmount, fromTokenInfo.decimals).toString(),
        affiliation: vCode,
        slippage: isAutoSlippage
          ? slippageValue && slippageValue !== '0'
            ? calculateSlippage(slippageValue)
            : slippageValue === '0'
              ? 0
              : undefined
          : calculateSlippage(slippageValue || slippage?.value),
        toTokenDecimals: toTokenInfo.decimals,
        to_platform_id: toTokenInfo.platform_id || 0
      })
    },
    [
      address,
      differentAddress,
      fromAmount,
      fromTokenInfo.address,
      fromTokenInfo.chain_id,
      fromTokenInfo.decimals,
      getQuote,
      slippage?.value,
      startLoading,
      toTokenInfo.address,
      toTokenInfo.chain_id,
      toTokenInfo.decimals
    ]
  )


  useEffect(() => {
    if (fromTokenInfo && toTokenInfo) {
      let newSlippage: number | undefined

      if (fromTokenInfo.chain_id === toTokenInfo.chain_id) {
        newSlippage = swapAutoSlippage
      } else {
        const fromChainInfo = chains?.find(
          (chain) => chain.chain_id === fromTokenInfo.chain_id
        )
        const toChainInfo = chains?.find(
          (chain) => chain.chain_id === toTokenInfo.chain_id
        )
        const from_eth = fromTokenInfo.address == fromChainInfo?.eth_token
        const to_eth = toTokenInfo.address == toChainInfo?.eth_token

        if (from_eth && to_eth) {
          newSlippage = bridgeAutoSlippage
        } else {
          newSlippage = crossChainSwapAutoSlippage
        }
      }

      // Update only when the effective slippage value actually changes.
      if (autoSlippage !== newSlippage) {
        setAutoSlippage(newSlippage)
      }
    }
  }, [fromTokenInfo, toTokenInfo, chains, setAutoSlippage, autoSlippage])

  useEffect(() => {
    async function _getQuote() {
      if (!address || !fromAmount) return
      const vCode = extractVPathSegment()
      await getQuote({
        from_chain: fromTokenInfo.chain_id,
        to_chain: toTokenInfo.chain_id,
        from_token: fromTokenInfo.address,
        to_token: toTokenInfo.address,
        from_address: address,
        to_address: differentAddress ? differentAddress : address,
        amount: parseUnits(fromAmount, fromTokenInfo.decimals).toString(),
        slippage: calculateSlippage(slippage?.value),
        toTokenDecimals: toTokenInfo.decimals,
        affiliation: vCode,
        to_platform_id: toTokenInfo.platform_id || 0
      })
    }

    if (isConnected && address && fromAmount) {
      _getQuote()
    }
    // do not pass fromAmount to deps, it will call getQuote every time fromAmount changes, which is not what we want
    // only call getQuote when isConnected changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  useEffect(() => {
    if (!fromAmount || !toAmount) {
      setQuoteInfo(initialQuoteInfo)
    }
  }, [fromAmount, toAmount])

  useEffect(() => {
    const nextWidgetDefaultsKey = JSON.stringify({
      mode,
      from: fromAllowedChainIds ?? null,
      to: toAllowedChainIds ?? null,
      defaultFrom: defaultTokens.from
        ? {
            chainId: defaultTokens.from.chainId,
            address: defaultTokens.from.address.toLowerCase(),
            symbol: defaultTokens.from.symbol ?? null
          }
        : null,
      defaultTo: defaultTokens.to
        ? {
            chainId: defaultTokens.to.chainId,
            address: defaultTokens.to.address.toLowerCase(),
            symbol: defaultTokens.to.symbol ?? null
          }
        : null,
      allowedFrom: fromAllowedTokens,
      allowedTo: toAllowedTokens
    })

    if (widgetDefaultsKeyRef.current !== nextWidgetDefaultsKey) {
      widgetDefaultsKeyRef.current = nextWidgetDefaultsKey
      didApplyWidgetDefaultsRef.current = false
    }
  }, [
    defaultTokens.from,
    defaultTokens.to,
    fromAllowedChainIds,
    fromAllowedTokens,
    mode,
    toAllowedChainIds,
    toAllowedTokens
  ])

  useEffect(() => {
    if (didApplyWidgetDefaultsRef.current) return
    if (!tokens?.length) return

    const hasUrlTokenPreset = (() => {
      if (typeof window === 'undefined') return false
      const params = new URLSearchParams(window.location.search)
      return Boolean(
        params.get('from_token') ||
          params.get('to_token') ||
          params.get('from_chain') ||
          params.get('to_chain')
      )
    })()

    const pickTokenForChain = (
      chainId: number,
      preferredSymbol?: string
    ): typeof fromTokenInfo | undefined => {
      if (!tokens?.length) return undefined
      return (
        tokens.find(
          (token) =>
            token.chain_id === chainId &&
            preferredSymbol &&
            token.symbol === preferredSymbol
        ) ||
        tokens.find(
          (token) => token.chain_id === chainId && token.symbol === 'ETH'
        ) ||
        tokens.find((token) => token.chain_id === chainId)
      )
    }

    const pickTokenByPreset = (
      side: 'from' | 'to'
    ): typeof fromTokenInfo | undefined => {
      const preset = defaultTokens[side]
      if (!preset) return undefined
      const normalizedAddress = preset.address.toLowerCase()
      return (
        tokens.find(
          (token) =>
            token.chain_id === preset.chainId &&
            token.address.toLowerCase() === normalizedAddress
        ) ||
        (preset.symbol
          ? tokens.find(
              (token) =>
                token.chain_id === preset.chainId &&
                token.symbol.toLowerCase() === preset.symbol?.toLowerCase()
            )
          : undefined)
      )
    }

    const pickFirstAllowedTokenForSide = (
      side: 'from' | 'to',
      preferredChainId?: number | null,
      preferredSymbol?: string
    ): typeof fromTokenInfo | undefined => {
      const sideTokens = tokens.filter((token) =>
        isTokenAllowed(side, token.chain_id, token.address)
      )
      if (!sideTokens.length) return undefined
      return (
        sideTokens.find(
          (token) =>
            !!preferredChainId &&
            token.chain_id === preferredChainId &&
            preferredSymbol &&
            token.symbol === preferredSymbol
        ) ||
        sideTokens.find(
          (token) =>
            !!preferredChainId &&
            token.chain_id === preferredChainId &&
            token.symbol === 'ETH'
        ) ||
        sideTokens.find(
          (token) => !!preferredChainId && token.chain_id === preferredChainId
        ) ||
        sideTokens.find(
          (token) => preferredSymbol && token.symbol === preferredSymbol
        ) ||
        sideTokens[0]
      )
    }

    const fromAllowed = fromAllowedChainIds
    const toAllowed = toAllowedChainIds

    // This effect only aligns defaults once. Token selection constraints are
    // enforced in the token modal for subsequent user actions.
    let nextFrom = fromTokenInfo
    let nextTo = toTokenInfo

    if (!hasUrlTokenPreset) {
      const presetFrom = pickTokenByPreset('from')
      const presetTo = pickTokenByPreset('to')
      if (presetFrom) nextFrom = presetFrom
      if (presetTo) nextTo = presetTo
    }

    if (fromAllowed && !fromAllowed.includes(nextFrom.chain_id)) {
      const next = pickTokenForChain(fromAllowed[0], nextFrom.symbol)
      if (next) nextFrom = next
    }

    if (mode === 'swap') {
      const swapChainId = fromAllowed?.[0] ?? toAllowed?.[0] ?? nextFrom.chain_id

      const forcedFrom =
        nextFrom.chain_id === swapChainId
          ? nextFrom
          : pickTokenForChain(swapChainId, nextFrom.symbol)
      if (forcedFrom) nextFrom = forcedFrom

      const forcedTo =
        nextTo.chain_id === swapChainId
          ? nextTo
          : pickTokenForChain(swapChainId, nextTo.symbol) ||
            pickTokenForChain(swapChainId, nextFrom.symbol)
      if (forcedTo) nextTo = forcedTo
    } else if (toAllowed && !toAllowed.includes(nextTo.chain_id)) {
      const next = pickTokenForChain(toAllowed[0], nextTo.symbol)
      if (next) nextTo = next
    }

    if (!isTokenAllowed('from', nextFrom.chain_id, nextFrom.address)) {
      const fallback = pickFirstAllowedTokenForSide(
        'from',
        fromAllowed?.[0] ?? nextFrom.chain_id,
        nextFrom.symbol
      )
      if (fallback) nextFrom = fallback
    }

    if (!isTokenAllowed('to', nextTo.chain_id, nextTo.address)) {
      const fallback = pickFirstAllowedTokenForSide(
        'to',
        toAllowed?.[0] ?? nextTo.chain_id,
        nextTo.symbol
      )
      if (fallback) nextTo = fallback
    }

    const isFromChanged =
      nextFrom.chain_id !== fromTokenInfo.chain_id ||
      nextFrom.address !== fromTokenInfo.address
    const isToChanged =
      nextTo.chain_id !== toTokenInfo.chain_id ||
      nextTo.address !== toTokenInfo.address

    if (isFromChanged || isToChanged) {
      applyTokenSelection(nextFrom, nextTo)
    }

    didApplyWidgetDefaultsRef.current = true
  }, [
    applyTokenSelection,
    fromTokenInfo,
    fromAllowedChainIds,
    mode,
    tokens,
    toAllowedChainIds,
    toTokenInfo,
    defaultTokens,
    fromAllowedTokens,
    toAllowedTokens,
    isTokenAllowed
  ])

  const renderContent = () => {
    if (fromTxHash) {
      return (
        <>
          <TxState
            resetQuoteInfo={() => setQuoteInfo(initialQuoteInfo)}
            request_id={quoteInfo?.request_id || ''}
            routerType={routerType}
          />
        </>
      )
    }

    return (
      <>
        <FormTop refetchQuote={refetchQuote} quoteInfo={quoteInfo} />
        <FormBody
          getQuote={getQuote}
          quoteInfo={quoteInfo}
          setQuoteInfo={setQuoteInfo}
          stopAutoRefetch={stopAutoRefetch}
        />
      </>
    )
  }

  return (
    <>
      <VStack
        w={'100%'}
        flexDirection={['column-reverse', 'column-reverse', 'row']}
        alignItems={['center', 'center', 'flex-start']}
        justifyContent={['center', 'center', 'center']}
        paddingTop={['0', '0', '0px']}
      >
        <Box w={['100%', 'auto']}>
          <VStack
            pos={'relative'}
            bg={'white'}
            color={'#15003E'}
            boxShadow={'0px 12px 36px 0px #007B9D59'}
            px={{
              base: 2.5,
              md: 4
            }}
            py={{
              base: 4
            }}
            borderRadius={{
              base: '16px',
              md: '24px'
            }}
            w={{
              base: '100%',
              sm: '430px',
              md: '480px'
            }}
            align={'start'}
            gap={4}
            ref={mainFormRef}
            id={'js_main_form'}
            {...widgetStyles.formContainer}
          >
            {renderContent()}
            <ChakraLink
              href="https://wheelx.fi"
              target="_blank"
              rel="noopener noreferrer"
              alignSelf={'center'}
              textDecoration={'none'}
              _hover={{
                textDecoration: 'none',
                opacity: 0.8
              }}
            >
              <Text
                variant={'content9'}
                color={'#81728C'}
                fontWeight={500}
                lineHeight={1}
              >
                Powered by WheelX.fi
              </Text>
            </ChakraLink>
            <Image
              display={'none'}
              src={getAssetSrc(wheelSprites)}
              alt="wheel"
            />
            <Image
              display={'none'}
              src={getAssetSrc(successSprites)}
              alt="success"
            />
          </VStack>
        </Box>
      </VStack>
    </>
  )
}
