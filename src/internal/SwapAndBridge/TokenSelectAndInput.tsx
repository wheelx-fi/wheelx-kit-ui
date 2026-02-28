import { Button, HStack, Input, Image } from '@chakra-ui/react'
import { VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Fraction } from 'bi-fraction'

import { TokenInfo } from '../api'

import { TokenInfoCom } from './TokenInfoCom'

import ArrowDownIcon from '../assets/icons/arrow-down.svg'
import { Heading, Text } from '../ui'
import {
  debounce,
  hyperliquidChainId,
  toBigInt
} from './utils'
import { formatTokenAmount, sliceAddress } from '../utils'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import {
  useSwapAndBridgeContextStore,
  useTokenBalance
} from './hooks'
import { FiEdit } from 'react-icons/fi'
import { useDifferentAddressStore } from '../stores/useDifferentAddressStore'
import MetamaskIcon from '../assets/icons/metamask.svg'
import { useHyperliquidBalance } from '../api/useHyperliquid'
import { useWheelxWidgetStyles } from '../../config'
import { AssetIcon } from '../ui/AssetIcon'

interface TokenSelectAndInputProps {
  text: 'From' | 'To'
  onClick: () => void
  amount: string
  onChange: (value: string) => void
  userBalance: Fraction
  tokenInfo: TokenInfo
  usdPrice?: Fraction
  totalGasFee?: bigint
  isLoadingFeeData?: boolean
  isInsufficientBalance?: boolean
  onOpenDialog?: () => void
}

export const TokenSelectAndInput = ({
  text,
  tokenInfo,
  onClick,
  amount,
  onChange,
  userBalance,
  usdPrice,
  totalGasFee,
  isLoadingFeeData,
  isInsufficientBalance,
  onOpenDialog
}: TokenSelectAndInputProps) => {
  const { address, connector } = useAccount()
  const widgetStyles = useWheelxWidgetStyles()
  const quickHalfButtonStyles = widgetStyles.quickHalfButton || {}
  const quickMaxButtonStyles = widgetStyles.quickMaxButton || {}
  const recipientBadgeStyles = widgetStyles.recipientBadge || {}

  const [isFocused, setIsFocused] = useState(false)
  const [isNative, setIsNative] = useState(false)
  // set value to state immediately to avoid the input value is not updated immediately when use debounce
  const [value, setValue] = useState(amount)
  const {
    setFromAmountToUsd,
    setToAmountToUsd,
    fromAmountToUsd,
    toAmountToUsd
  } = useSwapAndBridgeContextStore()
  useEffect(() => {
    setValue(amount)
  }, [amount])

  const isFrom = text === 'From'
  const { differentAddress, isDepositPlatformToken } =
    useDifferentAddressStore()

  const toTokenDifferentAddressBalance = useTokenBalance({
    chainId: tokenInfo.chain_id,
    tokenAddress:
      tokenInfo.address === zeroAddress ? undefined : tokenInfo.address,
    connectAddress: differentAddress ? differentAddress : address
  })

  const [isToHyperChain, setIsToHyperChain] = useState(false)

  const { data: toTokenBalanceHyperBack } = useHyperliquidBalance(
    differentAddress ? differentAddress : address,
    isToHyperChain
  )

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

  useEffect(() => {
    if (!isFrom) {
      if (tokenInfo.chain_id === hyperliquidChainId) {
        setIsToHyperChain(true)
      } else {
        setIsToHyperChain(false)
      }
    }
  }, [tokenInfo, isFrom])

  const toDifferentAddressBalance = isToHyperChain
    ? new Fraction(toTokenBalanceHyper?.value ?? 0n)
    : new Fraction(toTokenDifferentAddressBalance?.value ?? 0n)
  const differentAddressBalance = formatTokenAmount({
    amount: toDifferentAddressBalance,
    decimals: tokenInfo.decimals
  })

  const walletIcon = useMemo(() => {
    return connector?.icon ? (
      <Image
        src={connector.icon}
        alt="connector"
        boxSize={{
          base: '12px',
          md: '14px'
        }}
        borderRadius={'full'}
      />
    ) : (
      <AssetIcon
        src={MetamaskIcon}
        alt="metamask"
        boxSize={{
          base: '12px',
          md: '14px'
        }}
      />
    )
  }, [connector])
  // console.log('######differentAddressBalance######:', differentAddressBalance)

  useEffect(() => {
    if (isFrom) {
      const { tags } = tokenInfo
      if (tags.includes('native')) {
        setIsNative(true)
      } else {
        setIsNative(false)
      }
    }
  }, [tokenInfo, isFrom])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(debounce(onChange, 500), [onChange])

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value === '.') {
        setValue('0.')
        return
      }
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        // set value to state immediately
        setValue(value)
        // debounce the onChange function
        const isSame = new Fraction(value).eq(amount)
        if (!isSame) {
          debouncedOnChange(value)
        }
      }
    },
    [amount, debouncedOnChange]
  )

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  const handleQuickInput = useCallback(
    async (value: string) => {
      const plusGasFee = new Fraction('0.00008')
        .shl(tokenInfo.decimals)
        .add(totalGasFee ?? 0n)

      const maxValue =
        (tokenInfo.address === zeroAddress || isNative) &&
        userBalance.gt(plusGasFee)
          ? userBalance.sub(plusGasFee)
          : userBalance

      const _value = value === '50%' ? userBalance.div(2) : maxValue
      if (value === 'Max' && isLoadingFeeData) {
        return
      }
      const _amount = formatTokenAmount({
        amount: _value,
        decimals: tokenInfo.decimals,
        useGroupSeparator: false
      })
      if (_amount !== amount) {
        onChange(_amount)
      }
    },
    [
      amount,
      isLoadingFeeData,
      isNative,
      onChange,
      tokenInfo.address,
      tokenInfo.decimals,
      totalGasFee,
      userBalance
    ]
  )

  const balance = formatTokenAmount({
    amount: userBalance,
    decimals: tokenInfo.decimals
  })

  // useEffect(() => {
  //   if (isFrom) {
  //     console.log('######userBalance.gt(0)######:', userBalance.gt(0))
  //     console.log('######isFrom######:', isFrom)
  //   }
  // }, [isFrom, userBalance])

  const usdValue =
    usdPrice && amount && usdPrice.gt(0)
      ? new Fraction(amount).mul(usdPrice).toFormat({
          decimalPlaces: 2
        })
      : null

  useEffect(() => {
    if (isFrom) {
      setFromAmountToUsd(usdValue)
    } else {
      setToAmountToUsd(usdValue)
    }
  }, [isFrom, setFromAmountToUsd, setToAmountToUsd, usdValue])

  const renderLossWarning = () => {
    if (!isFrom && fromAmountToUsd && toAmountToUsd) {
      if (+fromAmountToUsd > 50 && +fromAmountToUsd > +toAmountToUsd) {
        const loss = -(+toAmountToUsd - +fromAmountToUsd) / +fromAmountToUsd
        if (loss >= 0.1) {
          // console.log('###loss###:', loss)
          return (
            <Text
              as={'span'}
              color={'#ff4267'}
            >{` (-${(loss * 100).toFixed(2)}%)`}</Text>
          )
        }
        return <></>
      }
      return <></>
    }
    return <></>
  }

  const FiEditDom = () => {
    return (
      <FiEdit
        cursor={'pointer'}
        width={'16px'}
        height={'16px'}
        onClick={() => {
          onOpenDialog?.()
        }}
      />
    )
  }

  const renderDifferentAddress = () => {
    if (address && !isFrom) {
      if (isDepositPlatformToken) {
        if (differentAddress) {
          return (
            <HStack gap={1}>
              {walletIcon}
            <Text
              variant={'content8'}
              backgroundColor={'#fff'}
              padding={'2px'}
              borderRadius={'14px'}
              {...recipientBadgeStyles}
              {...widgetStyles.balanceText}
            >
              {sliceAddress(differentAddress)}
            </Text>
              {FiEditDom()}
            </HStack>
          )
        }
        return (
          <HStack gap={1}>
            <Text
              variant={'content8'}
              backgroundColor={'#fff'}
              padding={'2px 6px'}
              borderRadius={'14px'}
              cursor={'pointer'}
              onClick={() => {
                onOpenDialog?.()
              }}
              {...recipientBadgeStyles}
              {...widgetStyles.balanceText}
            >
              Enter Address
            </Text>
            {FiEditDom()}
          </HStack>
        )
      }
      return (
        <HStack gap={1}>
          {walletIcon}
          <Text
            variant={'content8'}
            backgroundColor={'#fff'}
            padding={'2px'}
            borderRadius={'14px'}
            {...recipientBadgeStyles}
            {...widgetStyles.balanceText}
          >
            {sliceAddress(differentAddress ? differentAddress : address)}
          </Text>
          {FiEditDom()}
        </HStack>
      )
    }
    return null
  }

  return (
    <VStack
      align={'start'}
      w={'100%'}
      bg={'#F5F6FF'}
      px={{
        base: 2,
        md: 4
      }}
      paddingBottom={{
        base: isFrom ? 2 : 7,
        md: isFrom ? 3 : 8
      }}
      paddingTop={{
        base: 2,
        md: 3
      }}
      borderRadius={{
        base: '8px',
        md: '16px'
      }}
      gap={'0'}
      {...widgetStyles.sectionContainer}
    >
      <HStack
        w={'100%'}
        justify={'space-between'}
        color={'#81728C'}
        marginBottom={[2]}
      >
        <Heading
          variant={'heading11'}
          height={'18px'}
          {...widgetStyles.sectionLabelText}
        >
          {text}
        </Heading>

        {address ? (
          <>
            {isFrom && userBalance.gt(0) ? (
              <HStack color={'#15003E'}>
                <Button
                  variant={'outline'}
                  minW={'30px'}
                  h={{
                    base: '18px'
                  }}
                  borderRadius={'4px'}
                  border={'1px solid'}
                  borderColor={'brand-purple'}
                  onClick={() => handleQuickInput('50%')}
                  {...quickHalfButtonStyles}
                >
                  <Text variant={'content9'} {...widgetStyles.balanceText}>
                    50%
                  </Text>
                </Button>
                <Button
                  minW={'30px'}
                  h={{
                    base: '18px'
                  }}
                  borderRadius={'4px'}
                  bg={'brand-purple'}
                  onClick={() => handleQuickInput('Max')}
                  {...quickMaxButtonStyles}
                >
                  <Text variant={'content9'} {...widgetStyles.balanceText}>
                    Max
                  </Text>
                </Button>
                <Text
                  variant={'content8'}
                  color={'#81728C'}
                  {...widgetStyles.balanceText}
                >
                  Balance: {balance}
                </Text>
              </HStack>
            ) : (
              <></>
            )}
          </>
        ) : null}
        {renderDifferentAddress()}
      </HStack>

      <HStack
        w={'100%'}
        justify={'space-between'}
        align={'center'}
        gap={{
          base: 2.5,
          md: 6
        }}
      >
        <HStack
          gap={{
            base: 1,
            md: 3
          }}
          onClick={onClick}
          cursor={'pointer'}
          justify={'space-between'}
          px={{
            base: 1.5,
            md: 2.5
          }}
          py={{
            base: 2.5
          }}
          bg={'#E3E4FA'}
          borderRadius={{
            base: '8px',
            md: '12px'
          }}
          w={'50%'}
          {...widgetStyles.tokenSelector}
        >
          <TokenInfoCom tokenInfo={tokenInfo} />
          <AssetIcon
            src={ArrowDownIcon}
            alt="open token selector"
            boxSize={{
              base: '20px',
              md: '24px'
            }}
          />
        </HStack>

        <VStack
          w={'50%'}
          pb={2}
          h={{
            base: '48px',
            md: '52px'
          }}
          border={'1px solid'}
          borderColor={isFocused ? '#8143FF' : '#B5B5B5'}
          bg={'white'}
          borderRadius={{
            base: '8px',
            md: '12px'
          }}
          align={'flex-end'}
          position={'relative'}
          {...widgetStyles.amountInputContainer}
        >
          <Input
            id={`${text.toLowerCase()}-input`}
            px={{
              base: 2,
              md: 3
            }}
            textAlign={'right'}
            fontWeight={'600'}
            fontSize={{
              base: '16px',
              md: '18px'
            }}
            _placeholder={{
              color: 'brand-grey3'
            }}
            onBlur={handleBlur}
            onFocus={handleFocus}
            disabled={!isFrom}
            color={isInsufficientBalance ? 'red' : 'brand-grey1'}
            _disabled={{
              color: 'brand-grey1',
              opacity: 1
            }}
            border={'none'}
            _focus={{
              outlineWidth: '0px'
            }}
            placeholder="0"
            onChange={handleValueChange}
            value={value}
            inputMode="decimal"
            type="text"
            autoComplete="off"
            {...widgetStyles.amountInputText}
          />
          <Text
            variant={{
              base: 'content9',
              md: 'content8'
            }}
            color={'brand-grey4'}
            pos={'absolute'}
            right={{
              base: 2,
              md: 3
            }}
            bottom={'5px'}
            {...widgetStyles.amountUsdText}
          >
            {usdValue ? `～$${usdValue}` : null}
            {renderLossWarning()}
          </Text>
        </VStack>
      </HStack>
      <HStack
        w={'100%'}
        justify={'flex-end'}
        color={'#81728C'}
        height={'18px'}
        overflow={'hidden'}
        lineHeight={'18px'}
        position={'absolute'}
        bottom={['6px', '8px']}
        left={0}
        paddingRight={[2, 4]}
      >
        {address && (
          <>
            {!isFrom && !isDepositPlatformToken && (
              <Text variant={'content8'}>
                Balance: {differentAddressBalance}
              </Text>
            )}
          </>
        )}
      </HStack>
    </VStack>
  )
}
