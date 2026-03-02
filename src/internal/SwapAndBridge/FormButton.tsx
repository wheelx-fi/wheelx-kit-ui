'use client'

import {
  VStack,
  Button,
  Icon,
  ConditionalValue,
  Image,
  HStack
} from '@chakra-ui/react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Fraction } from 'bi-fraction'
// import { parseEther } from 'ethers'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { parseUnits } from 'viem'
import {
  useAccount,
  BaseError,
  useConfig,
  useSendTransaction
  // usePublicClient,
  // useWalletClient
} from 'wagmi'

import { logger } from '../utils'

import { toaster } from '../ui/toaster'

import {
  useGuardChain,
  useSwapAndBridgeContextStore,
  useTxStateContextStore
} from './hooks'
import { getErc20Approval } from './utils'
import WalletIcon from '../assets/icons/wallet.svg'
import { Heading, Text } from '../ui'
import { useUSDTHandler } from './utils/twoApprove'
// import { bottomToaster } from '../ui/toaster'
import { useChainsStore } from '../stores'
import { useDifferentAddressStore } from '../stores/useDifferentAddressStore'
import { useWheelxWidgetStyles } from '../../config'
import warningIcon from '../assets/images/jth.png'
import aiBotGif from '../assets/images/ai_bot.gif'
import { getAssetSrc } from '../utils/getAssetSrc'

interface Props {
  isFetching: boolean
  insufficientBalance?: boolean
  data: `0x${string}` | null
  contractAddress: `0x${string}` | null
  stopAutoRefetch: () => void
  errorMessage: string | null
  gas?: bigint | null
  maxFeePerGas?: bigint | undefined
  maxPriorityFeePerGas?: bigint | undefined
  backApprove?: boolean
  router_type?: string | null | undefined
  txValue?: string | null
  isInsufficientBalance?: boolean
  quoteMessage: string | null | undefined
}

interface TxGasInfo {
  gas?: bigint | null
  maxFeePerGas?: bigint | undefined
  maxPriorityFeePerGas?: bigint | undefined
}

const buttonStyles = {
  w: '100%',
  h: {
    base: '40px',
    md: '56px'
  },
  colorPalette: 'wheel'
}

const buttonHeadingVariant: ConditionalValue<'heading11' | 'heading9'> = {
  base: 'heading11',
  md: 'heading9'
}

const USDT_MAINNET_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

export const FormButton = ({
  isFetching,
  insufficientBalance = false,
  data,
  contractAddress,
  stopAutoRefetch,
  errorMessage,
  gas,
  maxFeePerGas,
  maxPriorityFeePerGas,
  backApprove,
  router_type,
  isInsufficientBalance,
  quoteMessage,
  txValue
}: Props) => {
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const config = useConfig()
  const widgetStyles = useWheelxWidgetStyles()

  const {
    fromTokenInfo,
    fromAmount,
    toAmount,
    fromAmountToUsd,
    toAmountToUsd
  } = useSwapAndBridgeContextStore()
  const { setFromTxHash, setUserCancelsTransaction } = useTxStateContextStore()

  const [isApproving, setIsApproving] = useState(false)
  const [lossTwenty, setLossTwenty] = useState(false)
  const [lossFifty, setLossFifty] = useState(false)
  const {
    handleApprove
    // error: approveError
  } = useUSDTHandler()

  const { isSelectPredictionChain } = useChainsStore()
  const { differentAddress } = useDifferentAddressStore()
  const mergedButtonStyles = useMemo(
    () => ({
      ...buttonStyles,
      ...(widgetStyles.primaryButton || {})
    }),
    [widgetStyles.primaryButton]
  )
  const loadingButtonStyles = useMemo(
    () => ({
      backgroundColor: '#919AA5',
      ...(widgetStyles.primaryButtonLoading || {})
    }),
    [widgetStyles.primaryButtonLoading]
  )
  const warningButtonStyles = useMemo(
    () => ({
      background: '#ff9d00',
      ...(widgetStyles.primaryButtonWarning || {})
    }),
    [widgetStyles.primaryButtonWarning]
  )
  const loadingRingColor =
    typeof loadingButtonStyles.backgroundColor === 'string'
      ? loadingButtonStyles.backgroundColor
      : '#919AA5'
  const buttonTextStyles = widgetStyles.primaryButtonText || {}

  // swap is based on different token name
  // const isSwap = useMemo(() => {
  //   return fromTokenInfo.name !== toTokenInfo.name
  // }, [fromTokenInfo.name, toTokenInfo.name])

  // const isFromNativeToken = useMemo(
  //   () => fromTokenInfo.address === zeroAddress,
  //   [fromTokenInfo.address]
  // )

  // Memoized validations
  const validations = useMemo(() => {
    const fromAmountFraction = new Fraction(fromAmount || '0')
    const hasValidAmounts =
      parseFloat(fromAmount) &&
      parseFloat(toAmount) &&
      fromAmountFraction.gt(new Fraction('0'))
    // const isDifferentChain = fromTokenInfo.chain_id !== toTokenInfo.chain_id

    return {
      hasValidAmounts,
      // isDifferentChain,
      canSwap: hasValidAmounts && !isFetching
      // canSwap: isDifferentChain && hasValidAmounts && !isFetching
    }
  }, [fromAmount, toAmount, isFetching])

  // console.log('#######tx value #######:', txValue, BigInt(txValue || '0'))
  // console.log('#######fromAmount value #######:', parseEther(fromAmount || '0'))

  const handleTransactionSuccess = useCallback(
    (hash: `0x${string}`) => {
      setFromTxHash(hash)
      setUserCancelsTransaction(false)
    },
    [setFromTxHash, setUserCancelsTransaction]
  )

  const handleTransactionError = useCallback(
    (error: Error) => {
      logger.error('Transaction error:', error)
      setUserCancelsTransaction(true)
      toaster.create({
        description:
          (error as BaseError)?.shortMessage ||
          error.message ||
          'Transaction failed',
        type: 'error'
      })
    },
    [setUserCancelsTransaction]
  )

  const { sendTransaction, isPending } = useSendTransaction({
    mutation: {
      onSuccess: handleTransactionSuccess,
      onError: handleTransactionError
    }
  })

  const { approve, isNeedApprove } = getErc20Approval(config)

  // const publicClient = usePublicClient()
  // const { data: walletClient } = useWalletClient()

  const executeSwapWithData = useCallback(async () => {
    if (!data || !contractAddress) {
      throw new Error('Data or contract address not available')
    }

    try {
      // const isErc20Token = fromTokenInfo.address !== zeroAddress
      // if (isErc20Token && backApprove) {
      const isEthereumUSDT =
        fromTokenInfo.chain_id === 1 &&
        fromTokenInfo.address.toLowerCase() ===
          USDT_MAINNET_ADDRESS.toLowerCase()

      if (backApprove) {
        const chainId = fromTokenInfo.chain_id
        const tokenAddress = fromTokenInfo.address
        const owner = address
        const spender = contractAddress
        const amount = parseUnits(fromAmount, fromTokenInfo.decimals)
        setIsApproving(true)
        if (isEthereumUSDT) {
          await handleApprove(tokenAddress, spender, amount)
        } else {
          const _isNeedApprove = await isNeedApprove({
            chainId,
            tokenAddress,
            owner,
            spender,
            amount
          })
          if (_isNeedApprove) {
            await approve({
              chainId,
              tokenAddress,
              owner,
              spender,
              amount
            })
          }
        }
        setIsApproving(false)
      }
      const transactionOptions = {
        to: contractAddress,
        data: data,
        value: BigInt(txValue || '0')
        // value: isErc20Token ? undefined : parseEther(fromAmount)
      }
      const tx: TxGasInfo = {}
      if (gas && gas > 0) {
        tx.gas = gas
      }
      if (maxFeePerGas && maxFeePerGas > 0) {
        tx.maxFeePerGas = maxFeePerGas
      }
      if (maxPriorityFeePerGas && maxPriorityFeePerGas > 0) {
        tx.maxPriorityFeePerGas = maxPriorityFeePerGas
      }
      sendTransaction(Object.assign({}, transactionOptions, tx))
      //   sendTransaction({
      //     to: contractAddress,
      //     data: data,
      //     value: isErc20Token ? undefined : parseEther(fromAmount)
      //   })
    } catch (error) {
      logger.error('Failed to create swap order:', error)
      setUserCancelsTransaction(true)
      toaster.create({
        description:
          (error as BaseError)?.shortMessage ||
          (error as Error)?.message ||
          'Failed to create swap order',
        type: 'error'
      })
      setIsApproving(false)
    }
  }, [
    address,
    approve,
    backApprove,
    contractAddress,
    data,
    fromAmount,
    fromTokenInfo.address,
    fromTokenInfo.chain_id,
    fromTokenInfo.decimals,
    gas,
    handleApprove,
    isNeedApprove,
    maxFeePerGas,
    maxPriorityFeePerGas,
    sendTransaction,
    setUserCancelsTransaction,
    txValue
  ])

  const { sendTx: handleSwap, isSwitching } = useGuardChain(
    executeSwapWithData,
    fromTokenInfo.chain_id
  )

  // useEffect(() => {
  //   if (approveError) {
  //     bottomToaster.error({
  //       description: approveError,
  //       duration: 4000
  //     })
  //   }
  // }, [approveError])

  // const buttonText = useMemo(() => {
  //   if (isSwap) {
  //     return isFromNativeToken ? 'Swap' : 'Approve & Swap'
  //   } else {
  //     return isFromNativeToken ? 'Bridge' : 'Approve & Bridge'
  //   }
  // }, [isFromNativeToken, isSwap])

  const buttonText = useMemo(() => {
    if (router_type) {
      if (router_type === 'wrap') {
        return !backApprove ? 'Wrap' : 'Approve & Wrap'
      } else if (router_type === 'unwrap') {
        return !backApprove ? 'Unwrap' : 'Approve & Unwrap'
      } else if (router_type === 'swap') {
        return !backApprove ? 'Swap' : 'Approve & Swap'
      } else {
        return !backApprove ? 'Bridge' : 'Approve & Bridge'
      }
    } else {
      return 'Error'
    }
  }, [router_type, backApprove])
  // const buttonLoadingText = useMemo(() => {
  //   if (isSwap) {
  //     return isFromNativeToken
  //       ? 'Swapping'
  //       : isSwitching || isApproving
  //         ? 'Approving'
  //         : 'Swapping'
  //   } else {
  //     return isFromNativeToken
  //       ? 'Bridging'
  //       : isSwitching || isApproving
  //         ? 'Approving'
  //         : 'Bridging'
  //   }
  // }, [isApproving, isFromNativeToken, isSwap, isSwitching])

  const buttonLoadingText = useMemo(() => {
    if (router_type) {
      if (router_type === 'wrap') {
        return !backApprove
          ? 'Wrapping'
          : isSwitching || isApproving
            ? 'Approving'
            : 'Wrapping'
      } else if (router_type === 'unwrap') {
        return !backApprove
          ? 'Unwrapping'
          : isSwitching || isApproving
            ? 'Approving'
            : 'Unwrapping'
      } else if (router_type === 'swap') {
        return !backApprove
          ? 'Swapping'
          : isSwitching || isApproving
            ? 'Approving'
            : 'Swapping'
      } else {
        return !backApprove
          ? 'Bridging'
          : isSwitching || isApproving
            ? 'Approving'
            : 'Bridging'
      }
    } else {
      return 'Error'
    }
  }, [isApproving, , backApprove, isSwitching, router_type])

  const renderLossWarning = () => {
    if (fromAmountToUsd && toAmountToUsd) {
      const fromPrice = Number(fromAmountToUsd.replace(/,/g, ''))
      const toPrice = Number(toAmountToUsd.replace(/,/g, ''))
      if (fromPrice > 50 && fromPrice > toPrice) {
        const loss = -(toPrice - fromPrice) / fromPrice
        if (loss >= 0.2) {
          return (
            <HStack
              as={'div'}
              color={'#81728c'}
              backgroundColor={'rgba(255, 210, 0, .1)'}
              border={'1px solid rgba(255, 210, 0, 1)'}
              height={'30px'}
              lineHeight={'30px'}
              textAlign={'center'}
              fontSize={'12px'}
              borderRadius={'4px'}
              w={'100%'}
              marginBottom={'10px'}
              alignItems={'center'}
              justifyContent={'center'}
              gap={0}
            >
              <Image
                src={getAssetSrc(warningIcon)}
                alt="error"
                w={'14px'}
                h={'14px'}
                marginRight={'4px'}
              ></Image>
              The current price impact is relatively high
            </HStack>
          )
        }
        return <></>
      }
      return <></>
    }
    return <></>
  }

  useEffect(() => {
    if (fromAmountToUsd && toAmountToUsd) {
      const fromPrice = Number(fromAmountToUsd.replace(/,/g, ''))
      const toPrice = Number(toAmountToUsd.replace(/,/g, ''))
      if (fromPrice > 50 && fromPrice > +toPrice) {
        const loss = -(toPrice - fromPrice) / fromPrice
        if (loss < 0.2) {
          setLossTwenty(false)
          setLossFifty(false)
        } else if (loss >= 0.2 && loss < 0.5) {
          setLossTwenty(true)
          setLossFifty(false)
        } else {
          setLossTwenty(false)
          setLossFifty(true)
        }
      }
    }
  }, [fromAmountToUsd, toAmountToUsd])

  const renderButton = () => {
    if (errorMessage || quoteMessage) {
      // console.log('------errorMessage------', errorMessage)
      return (
        <Button {...mergedButtonStyles} disabled>
          <Text
            variant={{
              base: 'content9',
              md: 'content7'
            }}
            {...buttonTextStyles}
          >
            {errorMessage || quoteMessage}
          </Text>
        </Button>
      )
    }

    if (isFetching && fromAmount) {
      return (
        <Button
          {...mergedButtonStyles}
          disabled
          // loading
          loadingText={''}
          {...loadingButtonStyles}
        >
          <Heading variant={buttonHeadingVariant} {...buttonTextStyles}>
            <HStack gap={0}>
              <HStack
                w={'28px'}
                h={'28px'}
                position={'relative'}
                alignItems={'center'}
                justifyContent={'center'}
                gap={0}
                top={'-1px'}
                marginRight={'5px'}
              >
                <Image
                  display={'block'}
                  src={getAssetSrc(aiBotGif)}
                  alt={'ai_bot'}
                  w={'26px'}
                  h={'26px'}
                ></Image>
                <Text
                  position={'absolute'}
                  w={'28px'}
                  h={'28px'}
                  top={0}
                  left={0}
                  border={`3px solid ${loadingRingColor}`}
                  borderRadius={'100%'}
                  boxSizing={'border-box'}
                ></Text>
              </HStack>
              <Text {...buttonTextStyles}>AI is Fetching the Best Price</Text>
            </HStack>
            {/* Fetching Best Price */}
          </Heading>
        </Button>
      )
    }

    if (!address) {
      return (
        <Button {...mergedButtonStyles} onClick={openConnectModal}>
          <Icon w={'24px'} h={'24px'} as={WalletIcon} />
          <Heading variant={buttonHeadingVariant} {...buttonTextStyles}>
            Connect Wallet
          </Heading>
        </Button>
      )
    }

    // if (!validations.isDifferentChain) {
    //   return (
    //     <Button w={'100%'} disabled>
    //       Select Different Networks
    //     </Button>
    //   )
    // }

    if (isSelectPredictionChain && !differentAddress) {
      return (
        <Button {...mergedButtonStyles} disabled>
          <Heading variant={buttonHeadingVariant} {...buttonTextStyles}>
            Enter Address
          </Heading>
        </Button>
      )
    }

    if (!validations.hasValidAmounts) {
      return (
        <Button {...mergedButtonStyles} disabled>
          <Heading variant={buttonHeadingVariant} {...buttonTextStyles}>
            Enter Amount
          </Heading>
        </Button>
      )
    }

    if (insufficientBalance || isInsufficientBalance) {
      return (
        <Button {...mergedButtonStyles} disabled>
          <Heading variant={buttonHeadingVariant} {...buttonTextStyles}>
            {quoteMessage ? quoteMessage : 'Insufficient Balance'}
          </Heading>
        </Button>
      )
    }

    const isLoading = isPending || isSwitching || isApproving
    return (
      <Button
        {...mergedButtonStyles}
        {...(lossTwenty ? warningButtonStyles : {})}
        onClick={() => {
          // setStartTrading(true)
          stopAutoRefetch()
          handleSwap()
        }}
        disabled={!validations.canSwap || lossFifty}
        loading={isLoading}
        loadingText={
          <Heading variant={buttonHeadingVariant} {...buttonTextStyles}>
            {buttonLoadingText}
          </Heading>
        }
      >
        <Heading variant={buttonHeadingVariant} {...buttonTextStyles}>
          {buttonText}
        </Heading>
      </Button>
    )
  }

  return (
    <>
      <VStack w={'100%'} gap={0}>
        {renderLossWarning()}
        {renderButton()}
      </VStack>
      <Image
        display={'none'}
        src={getAssetSrc(aiBotGif)}
        alt={'ai_bot'}
        w={'26px'}
        h={'26px'}
      ></Image>
    </>
  )
}
