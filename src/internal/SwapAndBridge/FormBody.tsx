import { VStack } from '@chakra-ui/react'
import { Fraction } from 'bi-fraction'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { parseUnits, zeroAddress } from 'viem'
import { useAccount, useEstimateFeesPerGas } from 'wagmi'

import { TokenInfo, useUsdPrice } from '../api'
import { useDifferentAddressStore } from '../stores/useDifferentAddressStore'

import { FormButton } from './FormButton'
import {
  useSwapAndBridgeContextStore,
  useTokenBalance
} from './hooks'
import SelectTokenModal from '../SelectTokenModal'
import { TokenSelectAndInput } from './TokenSelectAndInput'
import SwitchIcon from '../assets/icons/switch.svg?url'
import { TxInfo } from './TxInfo'
import { formatTokenAmount, slippageStore } from '../utils'
import { ArcTestnetChainId } from '../consts/chainsInfo'
import {
  calculateSlippage,
  nullAddress,
  extractVPathSegment,
  toBigInt,
  hyperliquidChainId
} from './utils'
import {
  initialQuoteInfo,
  QuoteInfo,
  QuoteRequestWithToTokenDecimals
} from './MainForm'
import { usePathname, useRouter } from 'next/navigation'
import {
  toRegex,
  toAndTokenRegex,
  fromRegex,
  fromAndTokenRegex,
  fromAndToRegex,
  fromAndTokenAndToAndTokenRegex,
  matchesAnyPatternUsingArray
} from '../utils/shortLinkRegex'
import { findItemByName, findItemBySymbol } from '../commons/utils'
import { useChainsStore, useTokensStore } from '../stores'
import DifferentAddressDialog from './DifferentAddressDialog'
import { useHyperliquidBalance } from '../api/useHyperliquid'
import { soneium, base } from 'wagmi/chains'
import { AssetIcon } from '../ui/AssetIcon'

interface Props {
  getQuote: (params: QuoteRequestWithToTokenDecimals) => Promise<void>
  quoteInfo: QuoteInfo
  setQuoteInfo: (quoteInfo: QuoteInfo) => void
  stopAutoRefetch: () => void
}

export const FormBody = ({
  getQuote,
  quoteInfo,
  setQuoteInfo,
  stopAutoRefetch
}: Props) => {
  const {
    fromAmount,
    toAmount,
    fromTokenInfo,
    toTokenInfo,
    setFromTokenInfo,
    setToTokenInfo,
    setFromAmount,
    setToAmount,
    switchTokens,
    autoSlippage
  } = useSwapAndBridgeContextStore()

  const { chains } = useChainsStore()
  const { tokens } = useTokensStore()

  // console.log('######quoteInfo######:', quoteInfo)

  const { replace: replaceLink } = useRouter()
  const pathname = usePathname()
  const [isFromHyperChain, setIsFromHyperChain] = useState(false)
  const [isToHyperChain, setIsToHyperChain] = useState(false)

  const updateSearchParams = useCallback(
    (params: Record<string, string>) => {
      if (typeof window === 'undefined') return

      const searchParams = window?.location?.search
      const newParams = new URLSearchParams(searchParams)
      Object.entries(params).forEach(([key, value]) => {
        newParams.set(key, value)
      })
      const newPath = decodeURIComponent(pathname.replace(/\/+$/, ''))
      // console.log('-------------newPath-----------:', newPath)
      if (tokens && chains && matchesAnyPatternUsingArray(newPath)) {
        if (toRegex.test(newPath)) {
          // record to chain id and token address
          const [exists, chainsInfo] = findItemByName(
            chains || [],
            newPath.replace('/', '')
          )
          if (!exists) return
          const foundItem = tokens.find(
            (item) => item.chain_id === chainsInfo?.chain_id
          )
          if (foundItem) {
            newParams.set('to_chain', foundItem.chain_id.toString())
            newParams.set('to_token', foundItem.address.toString())
          }
        } else if (toAndTokenRegex.test(newPath)) {
          const arr = newPath.replace('/', '').split('&')
          const [exists, chainsInfo] = findItemByName(chains, arr[0])
          if (!exists) return
          const [result, foundItem] = findItemBySymbol(
            tokens,
            arr[1],
            chainsInfo?.chain_id
          )
          if (!result) return
          if (result && foundItem) {
            newParams.set('to_chain', foundItem.chain_id.toString())
            newParams.set('to_token', foundItem.address.toString())
          }
        } else if (fromRegex.test(newPath)) {
          // record from chain id and token address
          const arr = newPath.split('&')
          const [exists, chainsInfo] = findItemByName(chains, arr[1])
          if (!exists) return
          const foundItem = tokens.find(
            (item) => item.chain_id === chainsInfo?.chain_id
          )
          if (foundItem) {
            newParams.set('from_chain', foundItem.chain_id.toString())
            newParams.set('from_token', foundItem.address.toString())
          }
        } else if (fromAndTokenRegex.test(newPath)) {
          const arr = newPath.replace('/', '').split('&')
          const [exists, chainsInfo] = findItemByName(chains, arr[0])
          if (!exists) return
          const [result, foundItem] = findItemBySymbol(
            tokens,
            arr[1],
            chainsInfo?.chain_id
          )
          if (!result) return
          if (result && foundItem) {
            newParams.set('from_chain', foundItem.chain_id.toString())
            newParams.set('from_token', foundItem.address.toString())
          }
        } else if (fromAndToRegex.test(newPath)) {
          const arr = newPath.split('/')
          const [resultFrom, fromChainsInfo] = findItemByName(chains, arr[1])
          if (!resultFrom) return
          const foundFromItem = tokens.find(
            (item) => item.chain_id === fromChainsInfo?.chain_id
          )
          if (!foundFromItem) return
          newParams.set('from_chain', foundFromItem.chain_id.toString())
          newParams.set('from_token', foundFromItem.address.toString())
          const [resultTo, toChainsInfo] = findItemByName(chains, arr[2])
          if (!resultTo) return
          const foundToItem = tokens.find(
            (item) => item.chain_id === toChainsInfo?.chain_id
          )
          if (!foundToItem) return
          newParams.set('to_chain', foundToItem.chain_id.toString())
          newParams.set('to_token', foundToItem.address.toString())
        } else if (fromAndTokenAndToAndTokenRegex.test(newPath)) {
          const arr = newPath.split('/')
          const arrFrom = arr[1].split('&')
          const [resultFrom, fromChainsInfo] = findItemByName(
            chains,
            arrFrom[0]
          )
          if (!resultFrom) return
          const [resultFromToken, fromTokenInfo] = findItemBySymbol(
            tokens,
            arrFrom[1],
            fromChainsInfo?.chain_id
          )
          if (!resultFromToken) return
          const arrTo = arr[2].split('&')
          const [resultTo, toChainsInfo] = findItemByName(chains, arrTo[0])
          if (!resultTo) return
          const [resultToToken, toTokenInfo] = findItemBySymbol(
            tokens,
            arrTo[1],
            toChainsInfo?.chain_id
          )
          if (!resultToToken) return
          if (fromTokenInfo && toTokenInfo) {
            newParams.set('to_chain', toTokenInfo.chain_id.toString())
            newParams.set('to_token', toTokenInfo.address.toString())
            newParams.set('from_chain', fromTokenInfo.chain_id.toString())
            newParams.set('from_token', fromTokenInfo.address.toString())
          }
        }
      }
      replaceLink(`${pathname.replace(pathname, '')}/?${newParams.toString()}`)
    },
    [pathname, replaceLink, chains, tokens]
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDifferentAddressDialogOpen, setIsDifferentAddressDialogOpen] =
    useState(false)
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(false)
  const [isInsufficientBalance, setIsInsufficientBalance] = useState(false)

  const { address } = useAccount()
  const slippage = address ? slippageStore.get(address) : undefined

  // console.log('######slippage######:', slippage)

  // Token balances
  const fromTokenBalanceNormal = useTokenBalance({
    chainId: fromTokenInfo.chain_id,
    tokenAddress:
      fromTokenInfo.address === zeroAddress ? undefined : fromTokenInfo.address
  })
  const toTokenBalanceNormal = useTokenBalance({
    chainId: toTokenInfo.chain_id,
    tokenAddress:
      toTokenInfo.address === zeroAddress ? undefined : toTokenInfo.address
  })

  const { data: fromTokenBalanceHyperBack } = useHyperliquidBalance(
    address,
    isFromHyperChain
  )
  const { data: toTokenBalanceHyperBack } = useHyperliquidBalance(
    address,
    isToHyperChain
  )

  const fromTokenBalanceHyper = {
    decimals: 6,
    formatted: fromTokenBalanceHyperBack?.withdrawable,
    symbol: 'USDC',
    value: toBigInt(
      fromTokenBalanceHyperBack?.withdrawable
        ? fromTokenBalanceHyperBack?.withdrawable
        : '0',
      6
    )
  }

  const toTokenBalanceHyper = {
    decimals: 6,
    formatted: toTokenBalanceHyperBack?.withdrawable,
    symbol: 'USDC',
    value: toBigInt(
      toTokenBalanceHyperBack?.withdrawable
        ? toTokenBalanceHyperBack?.withdrawable
        : '0',
      6
    )
  }

  const fromTokenBalance = isFromHyperChain
    ? fromTokenBalanceHyper
    : fromTokenBalanceNormal

  const toTokenBalance = isToHyperChain
    ? toTokenBalanceHyper
    : toTokenBalanceNormal

  // console.log('########  fromTokenBalance ########:', fromTokenBalance)
  // console.log('########  toTokenBalance ########:', toTokenBalance)

  useEffect(() => {
    if (fromTokenInfo.chain_id === hyperliquidChainId) {
      setIsFromHyperChain(true)
    } else {
      setIsFromHyperChain(false)
    }
  }, [fromTokenInfo])
  useEffect(() => {
    if (toTokenInfo.chain_id === hyperliquidChainId) {
      setIsToHyperChain(true)
    } else {
      setIsToHyperChain(false)
    }
  }, [toTokenInfo])

  // console.log('######## fromTokenBalanceHyper ########:', fromTokenBalanceHyper)

  const { data: feeData, isFetching: isLoadingFeeData } = useEstimateFeesPerGas(
    {
      chainId: fromTokenInfo.chain_id
    }
  )
  // fixed gas limit 500_000n
  const totalGasFee = feeData ? 500_000n * feeData.maxFeePerGas : 0n
  const { differentAddress } = useDifferentAddressStore()

  // Memoized balance calculations
  const balanceInfo = useMemo(() => {
    const fromBalance = new Fraction(fromTokenBalance?.value ?? 0n)
    const toBalance = new Fraction(toTokenBalance?.value ?? 0n)

    // console.log('######toBalance######:', toBalance)
    // console.log('######fromBalance######:', fromBalance)

    const fromAmountFraction = new Fraction(fromAmount)

    const insufficientBalance =
      !!fromAmount &&
      fromAmountFraction.gt(fromBalance.shr(fromTokenInfo.decimals))

    return {
      fromBalance,
      toBalance,
      insufficientBalance
    }
  }, [
    fromAmount,
    fromTokenBalance?.value,
    fromTokenInfo.decimals,
    toTokenBalance?.value
  ])

  const balance = formatTokenAmount({
    amount: balanceInfo.fromBalance,
    decimals: fromTokenInfo.decimals
  })

  useEffect(() => {
    const plusGasFee = new Fraction('0.00008')
      .shl(fromTokenInfo.decimals)
      .add(totalGasFee ?? 0n)
    const { tags } = fromTokenInfo
    const isNative = tags?.includes('native')
    // console.log('###native###:', balance, fromAmount)
    if (
      (fromTokenInfo.address == zeroAddress || isNative) &&
      balanceInfo.fromBalance.lt(plusGasFee)
    ) {
      setIsInsufficientBalance(true)
    } else {
      setIsInsufficientBalance(false)
    }
    if (+balance < +fromAmount) {
      setIsInsufficientBalance(true)
    } else {
      setIsInsufficientBalance(false)
    }
  }, [balanceInfo, fromAmount, fromTokenInfo, totalGasFee, balance])

  // Event handlers
  const handleOpenTokenModal = (isFromToken: boolean) => {
    setIsSelectingFromToken(isFromToken)
    setIsModalOpen(true)
  }

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])
  const handleCloseDifferentAddressDialog = useCallback(() => {
    setIsDifferentAddressDialogOpen(false)
  }, [])
  const handleOpenDifferentAddressDialog = useCallback(() => {
    setIsDifferentAddressDialogOpen(true)
  }, [])

  const { data: usdPrice } = useUsdPrice([
    {
      chain_index: fromTokenInfo.chain_id.toString(),
      token: fromTokenInfo.address
    },
    {
      chain_index: toTokenInfo.chain_id.toString(),
      token: toTokenInfo.address
    }
  ])
  const fromTokenUsdPrice = useMemo(() => {
    if (!usdPrice?.[0]?.price) return undefined
    return new Fraction(usdPrice[0].price)
  }, [usdPrice])
  const toTokenUsdPrice = useMemo(() => {
    if (!usdPrice?.[1]?.price) return undefined
    return new Fraction(usdPrice[1].price)
  }, [usdPrice])

  const fromTokenInUsd = useMemo(() => {
    if (
      !fromTokenUsdPrice ||
      fromTokenUsdPrice.eq(0) ||
      !fromAmount ||
      new Fraction(fromAmount).eq(0)
    )
      return
    return new Fraction(fromAmount).mul(fromTokenUsdPrice)
  }, [fromAmount, fromTokenUsdPrice])

  // const handleSelectToken = useCallback(
  //   (tokenInfo: TokenInfo) => {
  //     const params: Record<string, string> = {}
  //     // console.log('######Selected Token######:', tokenInfo)
  //     if (isSelectingFromToken) {
  //       setFromTokenInfo(tokenInfo)
  //       params.from_chain = tokenInfo.chain_id.toString()
  //       params.from_token = tokenInfo.address
  //     } else {
  //       setToTokenInfo(tokenInfo)
  //       params.to_chain = tokenInfo.chain_id.toString()
  //       params.to_token = tokenInfo.address
  //     }
  //     updateSearchParams(params)
  //     handleCloseModal()
  //     setQuoteInfo(initialQuoteInfo)
  //   },
  //   [
  //     handleCloseModal,
  //     isSelectingFromToken,
  //     setFromTokenInfo,
  //     setQuoteInfo,
  //     setToTokenInfo,
  //     updateSearchParams
  //   ]
  // )

  const handleSelectToken = useCallback(
    (tokenInfo: TokenInfo) => {
      const params: Record<string, string> = {}

      if (isSelectingFromToken) {
        setFromTokenInfo(tokenInfo)
        params.from_chain = tokenInfo.chain_id.toString()
        params.from_token = tokenInfo.address

        if (tokenInfo.chain_id === ArcTestnetChainId) {
          const isUSDC = tokenInfo.symbol === 'USDC'
          const isEURC = tokenInfo.symbol === 'EURC'

          if (isUSDC || isEURC) {
            const pairSymbol = isUSDC ? 'EURC' : 'USDC'
            const pairToken = tokens?.find(
              (t) => t.chain_id === ArcTestnetChainId && t.symbol === pairSymbol
            )

            if (pairToken) {
              setToTokenInfo(pairToken)
              params.to_chain = pairToken.chain_id.toString()
              params.to_token = pairToken.address
            }
          }
        }

        if (
          tokenInfo.chain_id !== ArcTestnetChainId &&
          toTokenInfo?.chain_id === ArcTestnetChainId
        ) {
          const baseEthToken = tokens?.find(
            (t) => t.chain_id === base.id && t.symbol === 'ETH'
          )
          if (baseEthToken) {
            setToTokenInfo(baseEthToken)
            params.to_chain = baseEthToken.chain_id.toString()
            params.to_token = baseEthToken.address
          }
        }
      } else {
        setToTokenInfo(tokenInfo)
        params.to_chain = tokenInfo.chain_id.toString()
        params.to_token = tokenInfo.address

        if (tokenInfo.chain_id === ArcTestnetChainId) {
          const isUSDC = tokenInfo.symbol === 'USDC'
          const isEURC = tokenInfo.symbol === 'EURC'

          if (isUSDC || isEURC) {
            const pairSymbol = isUSDC ? 'EURC' : 'USDC'
            const pairToken = tokens?.find(
              (t) => t.chain_id === ArcTestnetChainId && t.symbol === pairSymbol
            )

            if (pairToken) {
              setFromTokenInfo(pairToken)
              params.from_chain = pairToken.chain_id.toString()
              params.from_token = pairToken.address
            }
          }
        }
        if (
          tokenInfo.chain_id !== ArcTestnetChainId &&
          fromTokenInfo?.chain_id === ArcTestnetChainId
        ) {
          const soneiumEthToken = tokens?.find(
            (t) => t.chain_id === soneium.id && t.symbol === 'ETH'
          )
          if (soneiumEthToken) {
            setFromTokenInfo(soneiumEthToken)
            params.from_chain = soneiumEthToken.chain_id.toString()
            params.from_token = soneiumEthToken.address
          }
        }
      }

      updateSearchParams(params)
      handleCloseModal()
      setQuoteInfo(initialQuoteInfo)
    },
    [
      handleCloseModal,
      isSelectingFromToken,
      setFromTokenInfo,
      setQuoteInfo,
      setToTokenInfo,
      updateSearchParams,
      tokens,
      fromTokenInfo,
      toTokenInfo
    ]
  )

  const handleSwitchTokens = async () => {
    if (toTokenInfo.chain_id === hyperliquidChainId) {
      return
    }
    const _fromTokenInfo = toTokenInfo
    const _toTokenInfo = fromTokenInfo
    const _fromAmount = toAmount

    switchTokens()
    updateSearchParams({
      from_chain: _fromTokenInfo.chain_id.toString(),
      from_token: _fromTokenInfo.address,
      to_chain: _toTokenInfo.chain_id.toString(),
      to_token: _toTokenInfo.address
    })

    const vCode = extractVPathSegment()
    // console.log('##########vCode#########:', vCode)
    await getQuote({
      from_chain: _fromTokenInfo.chain_id,
      to_chain: _toTokenInfo.chain_id,
      from_token: _fromTokenInfo.address ?? '',
      to_token: _toTokenInfo.address ?? '',
      from_address: address ?? '',
      to_address: differentAddress ? differentAddress : (address ?? ''),
      amount: parseUnits(_fromAmount, _fromTokenInfo.decimals).toString(),
      slippage: calculateSlippage(slippage?.value),
      toTokenDecimals: _toTokenInfo.decimals,
      affiliation: vCode,
      to_platform_id: _toTokenInfo.platform_id || 0
    })
  }

  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value)
    setToAmount('')
    const vCode = extractVPathSegment()
    // setQuoteInfo({ ...initialQuoteInfo, isFetching: true })
    await getQuote({
      from_chain: fromTokenInfo.chain_id,
      to_chain: toTokenInfo.chain_id,
      from_token: fromTokenInfo.address,
      to_token: toTokenInfo.address,
      from_address: address ?? nullAddress,
      to_address: differentAddress
        ? differentAddress
        : (address ?? nullAddress),
      amount: parseUnits(value, fromTokenInfo.decimals).toString(),
      slippage: calculateSlippage(slippage?.value) || autoSlippage,
      toTokenDecimals: toTokenInfo.decimals,
      affiliation: vCode,
      to_platform_id: toTokenInfo.platform_id || 0
    })
  }

  const handleToAmountChange = (value: string) => {
    // console.log('######Set toAmount######: ', value)
    setToAmount(value)
  }

  useEffect(() => {
    const refetchQuote = async () => {
      await getQuote({
        from_chain: fromTokenInfo.chain_id,
        to_chain: toTokenInfo.chain_id,
        from_token: fromTokenInfo.address,
        to_token: toTokenInfo.address,
        from_address: address ?? nullAddress,
        to_address: differentAddress
          ? differentAddress
          : (address ?? nullAddress),
        amount: parseUnits(fromAmount, fromTokenInfo.decimals).toString(),
        slippage: calculateSlippage(slippage?.value),
        toTokenDecimals: toTokenInfo.decimals,
        to_platform_id: toTokenInfo.platform_id || 0
      })
    }
    refetchQuote()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [differentAddress])

  return (
    <>
      <VStack
        w={'100%'}
        align={'start'}
        pos={'relative'}
        gap={{
          base: 2.5,
          md: 4
        }}
      >
        <TokenSelectAndInput
          text="From"
          tokenInfo={fromTokenInfo}
          onClick={() => handleOpenTokenModal(true)}
          amount={fromAmount}
          onChange={handleFromAmountChange}
          userBalance={balanceInfo.fromBalance}
          isInsufficientBalance={isInsufficientBalance}
          usdPrice={fromTokenUsdPrice}
          totalGasFee={totalGasFee}
          isLoadingFeeData={isLoadingFeeData}
        />

        <AssetIcon
          src={SwitchIcon}
          alt="switch"
          pos={'absolute'}
          top={'50%'}
          left={'50%'}
          transform={['translate(-50%, -100%)', 'translate(-50%, -82.5%)']}
          cursor={
            toTokenInfo.chain_id === hyperliquidChainId ? 'default' : 'pointer'
          }
          onClick={handleSwitchTokens}
          color={'#81728C'}
          boxSize={{
            base: '20px',
            md: '30px'
          }}
          opacity={toTokenInfo.chain_id === hyperliquidChainId ? '0.5' : '1'}
        />

        <TokenSelectAndInput
          text="To"
          tokenInfo={toTokenInfo}
          onClick={() => handleOpenTokenModal(false)}
          amount={toAmount}
          onChange={handleToAmountChange}
          userBalance={balanceInfo.toBalance}
          usdPrice={toTokenUsdPrice}
          isInsufficientBalance={isInsufficientBalance}
          onOpenDialog={handleOpenDifferentAddressDialog}
        />
      </VStack>

      <FormButton
        errorMessage={quoteInfo.error}
        isFetching={quoteInfo.isFetching}
        data={quoteInfo.data}
        gas={quoteInfo.gas}
        router_type={quoteInfo?.router_type}
        txValue={quoteInfo?.tx_value}
        quoteMessage={quoteInfo?.quote_message}
        backApprove={quoteInfo.backApprove}
        maxFeePerGas={quoteInfo.maxFeePerGas}
        maxPriorityFeePerGas={quoteInfo.maxPriorityFeePerGas}
        contractAddress={quoteInfo.contractAddress}
        insufficientBalance={balanceInfo.insufficientBalance}
        stopAutoRefetch={stopAutoRefetch}
        isInsufficientBalance={isInsufficientBalance}
      />

      <SelectTokenModal
        isOpen={isModalOpen}
        isSelectingFromToken={isSelectingFromToken}
        onClose={handleCloseModal}
        onSelectToken={handleSelectToken}
      />
      {quoteInfo.info && fromAmount && toAmount && (
        <TxInfo
          {...quoteInfo.info}
          fromTokenInUsd={fromTokenInUsd}
          router_type={quoteInfo.router_type}
          routes={quoteInfo.routes}
        />
      )}
      <DifferentAddressDialog
        isOpen={isDifferentAddressDialogOpen}
        onClose={handleCloseDifferentAddressDialog}
      ></DifferentAddressDialog>
    </>
  )
}
