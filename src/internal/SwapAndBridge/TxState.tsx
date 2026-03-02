import { VStack, HStack, Icon, Button, Box, Image } from '@chakra-ui/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useEffect } from 'react'
import { useDifferentAddressStore } from '../stores/useDifferentAddressStore'

import { useIntervalGetOrderDetailPlus } from '../api/useIntervalGetOrderDetail'
import {
  formatDate,
  getTxLink,
  logger,
  openFunctionHash,
  // openFunctionHash,
  sliceAddress
} from '../utils'

import { useSwapAndBridgeContextStore, useTxStateContextStore } from './hooks'
import BackIcon from '../assets/icons/back.svg'
import { BoxWithBg } from '../ui/BoxWithBg'
import ArrowRightIcon from '../assets/icons/arrow-right.svg'
import LinkIcon from '../assets/icons/link.svg'
import TimeIcon from '../assets/icons/time.svg'
import DateIcon from '../assets/icons/date.svg'
import MoneyIcon from '../assets/icons/money.svg'
import { Text, Heading } from '../ui'
import PlusIcon from '../assets/icons/plus.svg'
import { TokenAmountHeading, TokenIconWithNetworkLogo } from '../commons'
import { Fraction } from 'bi-fraction'
import Timer from './Timer'
import { useAccount, useConfig } from 'wagmi'
import { Success, Wheel, Failure } from './animations'
import { topToaster } from '../ui/toaster'
import { useRetryAbleTransactionReceipt } from './hooks/useRetryAbleTransactionReceipt'
import { hyperliquidChainId } from './utils/consts'
import { useChainsStore } from '../stores/useChainsStore'
import { useWheelxWidgetStyles } from '../../config'

interface Props {
  resetQuoteInfo: () => void
  request_id: string | null
  routerType?: string | null | undefined
}

export const TxState = ({
  resetQuoteInfo,
  request_id,
  routerType
}: Props) => {
  const widgetStyles = useWheelxWidgetStyles()
  const txStateRouteContainerStyles =
    widgetStyles.txStateRouteContainer || widgetStyles.txStateCard || {}
  const txStateSummaryContainerStyles =
    widgetStyles.txStateSummaryContainer || widgetStyles.txStateCard || {}
  const txStateTokenCardStyles = widgetStyles.txStateTokenCard || {}
  const txStateLabelStyles = widgetStyles.txStateLabel || {}
  const txStateValueStyles = widgetStyles.txStateValue || {}
  const txStatePrimaryButtonStyles = {
    w: '100%',
    h: {
      base: '40px',
      md: '56px'
    },
    colorPalette: 'wheel',
    borderRadius: '12px',
    ...(widgetStyles.txStatePrimaryButton || {})
  }
  const txStateStatusLinkStyles = widgetStyles.txStateStatusLink || {}
  const txStateStatusErrorStyles = widgetStyles.txStateStatusError || {}
  const txStateStatusWarningStyles = widgetStyles.txStateStatusWarning || {}
  const txStateStatusProgressStyles = widgetStyles.txStateStatusProgress || {}
  const { fromTokenInfo, toTokenInfo, fromAmount, toAmount, resetAmounts } =
    useSwapAndBridgeContextStore()

  const {
    fromTxHash,
    toTxHash,
    resetTxState,
    setToTxHash,
    setUserCancelsTransaction
  } = useTxStateContextStore()

  const isSameChainSwap = useMemo(() => {
    return fromTokenInfo.chain_id === toTokenInfo.chain_id
  }, [fromTokenInfo.chain_id, toTokenInfo.chain_id])

  const now = useMemo(() => {
    return formatDate(new Date().toISOString())
  }, [])
  const [enabled, setEnabled] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(request_id)
  const [isSameChainSwapSuccess, setIsSameChainSwapSuccess] = useState(false)
  const [receiptStatus, setReceiptStatus] = useState<string | null>(null)
  const [timeOut, setTimeOut] = useState(false)
  const [isTransactionBlocked, setIsTransactionBlocked] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const { differentAddress, setDifferentAddress } = useDifferentAddressStore()
  const { chains } = useChainsStore()
  const toChainInfo = chains?.find((chain) => {
    if (toTokenInfo.platform_id && toTokenInfo.platform_id > 0) {
      return chain.platform_id === toTokenInfo.platform_id
    } else {
      return chain.chain_id === toTokenInfo.chain_id
    }
  })

  const resetLocalState = () => {
    setEnabled(false)
    setOrderId(null)
    setIsSameChainSwapSuccess(false)
  }
  useEffect(() => {
    resetLocalState()
    return () => {
      resetLocalState()
    }
  }, [])

  const { address } = useAccount()

  const {
    data: orderDetail,
    isError,
    attemptCount,
    shouldStop
  } = useIntervalGetOrderDetailPlus({
    orderId,
    enabled,
    maxRefetchAttempts: 200
  })
  const config = useConfig()

  const {
    data: receipt,
    isError: isReceiptError,
    error,
    isPending,
    isSuccess,
    isFetched,
    status,
    isMaxRetriesExceeded
  } = useRetryAbleTransactionReceipt(
    fromTxHash || undefined,
    fromTokenInfo.chain_id,
    6
  )

  useEffect(() => {
    console.log(
      'isReceiptError:',
      isReceiptError,
      'error:',
      error,
      'isPending:',
      isPending,
      'isSuccess:',
      isSuccess,
      'isFetched:',
      isFetched,
      'status:',
      status
    )
  }, [
    error,
    isFetched,
    isMaxRetriesExceeded,
    isPending,
    isReceiptError,
    isSuccess,
    status
  ])

  useEffect(() => {
    if (shouldStop && orderDetail?.status !== 'Filled' && isSuccess) {
      if (attemptCount > 200) {
        setEnabled(true)
      }
    }
  }, [shouldStop, orderDetail, attemptCount, isSuccess])

  useEffect(() => {
    if (isError) {
      console.log('get order detail error:', isError)
    }
  }, [isError])

  useEffect(() => {
    if (timeOut && isTransactionBlocked) {
      topToaster.error({
        description:
          'This transaction is stuck on the source network. Please go to the wallet’s activity section to speed up or cancel the transaction.'
      })
    }
  }, [isTransactionBlocked, timeOut])

  useEffect(() => {
    if (receipt?.status === 'reverted') {
      setReceiptStatus('failed')
    }
  }, [receipt])

  useEffect(() => {
    async function getOrderId() {
      try {
        if (!fromTxHash) return

        // const receipt = await waitForTransactionReceipt(config, {
        //   chainId: fromTokenInfo.chain_id,
        //   hash: fromTxHash
        // })
        // const receipt = await withRetry(
        //   () =>
        //     waitForTransactionReceipt(config, {
        //       chainId: fromTokenInfo.chain_id,
        //       hash: fromTxHash
        //     }),
        //   6, // max try count
        //   2000,
        //   true,
        //   (attempt, error) => {
        //     console.log(`onRetry callback: Attempt ${attempt}, Error: ${error}`)
        //   }
        // )

        if (receipt?.status === 'success') {
          setReceiptStatus('success')
        }
        logger.info('Bridge transaction receipt:', receipt)

        if (isSameChainSwap && receipt?.status === 'success') {
          // console.log('isSameChainSwap setIsSameChainSwapSuccess true')
          return setIsSameChainSwapSuccess(true)
        }

        const log = receipt?.logs?.find(
          (log: { topics: string[] }) => log.topics[0] === openFunctionHash
        )
        const orderIdOld = log?.topics[1]
        const orderId = request_id || orderIdOld
        if (orderId && receipt?.status === 'success') {
          setTimeOut(false)
          setOrderId(orderId)
          setEnabled(true)
          setTimeOut(false)
        }
      } catch (error) {
        logger.error('Transaction confirmation failed:', error)
        // setTimeOut(true)
        resetLocalState()
      }
    }

    if (fromTxHash) {
      getOrderId()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config,
    request_id,
    fromTokenInfo.chain_id,
    fromTxHash,
    isSameChainSwap,
    setIsSameChainSwapSuccess,
    receipt
  ])

  useEffect(() => {
    if (orderDetail?.status === 'Filled') {
      setEnabled(false)
      setToTxHash(orderDetail.fill_tx_hash)
    }
    if (orderDetail?.status === 'Failed') {
      setEnabled(false)
      setTimeOut(true)
    }
  }, [orderDetail, setDifferentAddress, setEnabled, setToTxHash])

  const onBack = () => {
    setUserCancelsTransaction(false)
    setTimeOut(false)
    setIsTransactionBlocked(false)
    resetTxState()
    resetAmounts()
    resetQuoteInfo()
    resetLocalState()
    setDifferentAddress(undefined)
  }

  const handleTimerTick = (secs: number) => {
    setCurrentTime(secs)
  }

  useEffect(() => {
    if (isPending && currentTime >= 300) {
      setIsTransactionBlocked(true)
      setTimeOut(true)
    }
  }, [currentTime, fromTxHash, isPending])
  useEffect(() => {
    if (isFetched && status === 'error') {
      setTimeOut(true)
    }
  }, [currentTime, status, isFetched])

  const renderAnimation = () => {
    if (timeOut) {
      return <Failure />
    }
    if (isSameChainSwapSuccess || !!toTxHash) {
      return <Success />
    }

    return <Wheel />
  }
  const renderFromTxHash = () => {
    if (fromTxHash && receiptStatus === 'success') {
      return (
        <Link
          href={getTxLink(fromTxHash, fromTokenInfo.chain_id)}
          target="_blank"
        >
          <Text
            variant={{
              base: 'content9',
              md: 'content8'
            }}
            color={'brand-purple'}
            {...txStateStatusLinkStyles}
          >
            • {sliceAddress(fromTxHash)} <Icon boxSize={'14px'} as={LinkIcon} />
          </Text>
        </Link>
      )
    }
    if ((fromTxHash && receiptStatus === 'failed') || isFetched) {
      return (
        <Text
          variant={{
            base: 'content9',
            md: 'content8'
          }}
          color={'#ff4267'}
          {...txStateStatusErrorStyles}
        >
          Failed
        </Text>
      )
    }
    if (isTransactionBlocked) {
      return (
        <Text
          variant={{
            base: 'content9',
            md: 'content8'
          }}
          color={'#ffd200'}
          {...txStateStatusWarningStyles}
        >
          Pending
        </Text>
      )
    }
    return (
      <Text
        variant={{
          base: 'content9',
          md: 'content8'
        }}
        color={'#0890FE'}
        {...txStateStatusProgressStyles}
      >
        • Depositing...
      </Text>
    )
  }

  // const isSwap = useMemo(() => {
  //   return fromTokenInfo.name !== toTokenInfo.name
  // }, [fromTokenInfo.name, toTokenInfo.name])

  const buttonDoingAndFinishText = useMemo(() => {
    const isCompleted = isSameChainSwap ? isSameChainSwapSuccess : !!toTxHash
    if (routerType) {
      if (routerType === 'wrap') {
        return !isCompleted ? 'Wrapping' : 'Wrap'
      } else if (routerType === 'unwrap') {
        return !isCompleted ? 'Unwrapping' : 'Unwrap'
      } else if (routerType === 'swap') {
        return !isCompleted ? 'Swapping' : 'Swap'
      } else {
        return !isCompleted ? 'Bridging' : 'Bridge'
      }
    } else {
      return 'Error'
    }
  }, [isSameChainSwap, isSameChainSwapSuccess, routerType, toTxHash])

  const renderButton = () => {
    const isCompleted = isSameChainSwap ? isSameChainSwapSuccess : !!toTxHash
    const isDisabled = !isCompleted

    let buttonContent
    if (isCompleted) {
      buttonContent = (
        <HStack gap={1}>
          <Icon
            boxSize={{
              base: '16px',
              md: '24px'
            }}
            as={PlusIcon}
          />
          New {buttonDoingAndFinishText}
        </HStack>
      )
    } else {
      buttonContent = <>{buttonDoingAndFinishText}</>
    }

    if (isTransactionBlocked) {
      return (
        <Button
          {...txStatePrimaryButtonStyles}
          onClick={onBack}
        >
          <Heading
            variant={{
              base: 'heading11',
              md: 'heading9'
            }}
            fontSize={'12px'}
            fontWeight={'400'}
          >
            {'This transaction is stuck on the source network'}
          </Heading>
        </Button>
      )
    }

    if (timeOut && !isTransactionBlocked) {
      return (
        <Button
          {...txStatePrimaryButtonStyles}
          onClick={onBack}
        >
          <Heading
            variant={{
              base: 'heading11',
              md: 'heading9'
            }}
          >
            {'Try Again'}
          </Heading>
        </Button>
      )
    }

    return (
      <Button
        {...txStatePrimaryButtonStyles}
        disabled={isDisabled}
        onClick={onBack}
        loading={!isCompleted}
        loadingText={
          <Heading
            variant={{
              base: 'heading11',
              md: 'heading9'
            }}
          >
            {buttonContent}
          </Heading>
        }
      >
        <Heading
          variant={{
            base: 'heading11',
            md: 'heading9'
          }}
        >
          {buttonContent}
        </Heading>
      </Button>
    )
  }

  return (
    <>
      <VStack
        gap={{
          base: 2,
          md: 4
        }}
        w={'100%'}
      >
        <Icon
          pos={'absolute'}
          top={4}
          left={4}
          onClick={onBack}
          cursor={'pointer'}
          as={BackIcon}
          boxSize={{
            base: '24px',
            md: '40px'
          }}
          color={'#81728C'}
        />
        {renderAnimation()}
        <BoxWithBg
          p={{
            base: 2,
            md: 3
          }}
          borderRadius={{
            base: '10px',
            md: '16px'
          }}
          {...txStateRouteContainerStyles}
        >
          <HStack w={'100%'} justify={'space-between'} gap={1}>
            <BoxWithBg
              bg={'white'}
              borderRadius={'12px'}
              px={{
                base: 1,
                md: 2
              }}
              py={2}
              flex={1}
              {...txStateTokenCardStyles}
            >
              <HStack gap={1}>
                <TokenIconWithNetworkLogo tokenInfo={fromTokenInfo} />
                <VStack gap={1} align={'start'} flex={1} whiteSpace={'nowrap'}>
                  <TokenAmountHeading
                    amount={new Fraction(fromAmount).shl(
                      fromTokenInfo.decimals
                    )}
                    decimals={fromTokenInfo.decimals}
                    variant={{
                      base: 'heading12',
                      md: 'heading10'
                    }}
                    color={'#15003E'}
                    suffix={fromTokenInfo.symbol}
                    lineClamp={1}
                    {...txStateValueStyles}
                  />
                  {renderFromTxHash()}
                </VStack>
              </HStack>
            </BoxWithBg>
            <Icon
              boxSize={{
                base: '20px',
                md: '32px'
              }}
              as={ArrowRightIcon}
            />
            <BoxWithBg
              bg={'white'}
              borderRadius={'12px'}
              px={{
                base: 1,
                md: 2
              }}
              py={2}
              flex={1}
              {...txStateTokenCardStyles}
            >
              <HStack gap={1}>
                <TokenIconWithNetworkLogo
                  tokenInfo={toTokenInfo}
                  customChainLogo={toChainInfo?.chain_icon}
                />
                <VStack gap={1} align={'start'} flex={1} whiteSpace={'nowrap'}>
                  <TokenAmountHeading
                    amount={new Fraction(toAmount).shl(toTokenInfo.decimals)}
                    decimals={toTokenInfo.decimals}
                    variant={{
                      base: 'heading12',
                      md: 'heading10'
                    }}
                    color={'#15003E'}
                    suffix={toTokenInfo.symbol}
                    lineClamp={1}
                    {...txStateValueStyles}
                  />
                  {isSameChainSwap ? (
                    <>{renderFromTxHash()}</>
                  ) : (
                    <>
                      {toTxHash ? (
                        <Link
                          href={getTxLink(
                            toTxHash,
                            toTokenInfo.chain_id === hyperliquidChainId
                              ? 999
                              : toTokenInfo.chain_id
                          )}
                          target="_blank"
                        >
                          <Text
                            variant={{
                              base: 'content9',
                              md: 'content8'
                            }}
                            color={'brand-purple'}
                            {...txStateStatusLinkStyles}
                          >
                            • {sliceAddress(toTxHash)}{' '}
                            <Icon boxSize={'14px'} as={LinkIcon} />
                          </Text>
                        </Link>
                      ) : (
                        <Text
                          variant={{
                            base: 'content9',
                            md: 'content8'
                          }}
                          color={'state-warning'}
                          {...txStateStatusWarningStyles}
                        >
                          • Receiving...
                        </Text>
                      )}
                    </>
                  )}
                </VStack>
              </HStack>
            </BoxWithBg>
          </HStack>
        </BoxWithBg>

        <BoxWithBg
          p={{
            base: 2,
            md: 3
          }}
          borderRadius={{
            base: '12px',
            md: '16px'
          }}
          {...txStateSummaryContainerStyles}
        >
          <VStack w={'100%'} fontSize={'xs'} gap={3}>
            <HStack w={'100%'} justify={'space-between'}>
              <HStack gap={1}>
                <Icon as={DateIcon} />
                <Text
                  variant={{
                    base: 'content8',
                    md: 'content7'
                  }}
                  color={'#81728C'}
                  {...txStateLabelStyles}
                >
                  Date
                </Text>
              </HStack>
              <Text
                variant={{
                  base: 'content8',
                  md: 'content7'
                }}
                color={'#15003E'}
                {...txStateValueStyles}
              >
                {now}
              </Text>
            </HStack>
            <HStack w={'100%'} justify={'space-between'}>
              <HStack gap={1}>
                <Icon as={TimeIcon} />
                <Text
                  variant={{
                    base: 'content8',
                    md: 'content7'
                  }}
                  color={'#81728C'}
                  {...txStateLabelStyles}
                >
                  Transfer Time
                </Text>
              </HStack>
              <Timer
                stop={isSameChainSwapSuccess || !!toTxHash || timeOut}
                onTick={handleTimerTick}
                valueStyle={txStateValueStyles}
              />
            </HStack>

            <HStack w={'100%'} justify={'space-between'}>
              <HStack gap={1}>
                <Icon as={MoneyIcon} />
                <Text
                  variant={{
                    base: 'content8',
                    md: 'content7'
                  }}
                  color={'#81728C'}
                  {...txStateLabelStyles}
                >
                  Recipient
                </Text>
              </HStack>
              <Text
                variant={{
                  base: 'content8',
                  md: 'content7'
                }}
                color={'#15003E'}
                {...txStateValueStyles}
                title={`------${differentAddress}`}
              >
                {sliceAddress(differentAddress ? differentAddress : address)}
              </Text>
            </HStack>
          </VStack>
        </BoxWithBg>
        {renderButton()}
      </VStack>
    </>
  )
}
