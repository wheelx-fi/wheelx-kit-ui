import {
  Collapsible,
  HStack,
  VStack,
  ConditionalValue,
  Image,
  Box
} from '@chakra-ui/react'
import { useState } from 'react'
// import { FaGasPump } from 'react-icons/fa6'

import { MobileTooltip } from '../ui/tooltip'
import ArrowDownIcon from '../assets/icons/arrow-down.svg?url'
import RoutesIcon from '../assets/icons/router.svg?url'
import TimeIcon from '../assets/icons/time.svg?url'
import InfoIcon from '../assets/icons/info.svg?url'
import { useSwapAndBridgeContextStore } from './hooks'
import { Text } from '../ui'
import { TokenAmountText } from '../commons'
import { formatTokenAmount, sliceAddress } from '../utils'
import { Fraction } from 'bi-fraction'
import {
  formatDecimalNum,
  formatSlippage
} from './utils'
import { TipsContent } from './TipsContent'
import { saveDay } from './utils/defaultData'
import { IoIosFlash } from 'react-icons/io'
import switchIcon from '../assets/images/switch.png'
import { getAssetSrc } from '../utils/getAssetSrc'
import { useWheelxWidgetStyles } from '../../config'
import { AssetIcon } from '../ui/AssetIcon'

export interface routesItem {
  name: string
  logo: string
}

export interface TxInfoProps {
  priceImpact: {
    bridgeFee: string
    dstGasFee: string
    swapFee: string
    before_discount_fee: string
    discount_percentage: string | undefined
  }
  slippage: number
  minReceive: string

  estimatedTime: number
  recipient: string
  router: string

  amountOut: string
  fromTokenInUsd?: Fraction
  router_type: string | null | undefined
  routes?: routesItem[] | undefined
}

const textVariant: ConditionalValue<'content8' | 'content7'> = {
  base: 'content8',
  md: 'content7'
}

export const TxInfo = ({
  priceImpact,
  slippage,
  minReceive,
  estimatedTime,
  recipient,
  router,
  amountOut,
  fromTokenInUsd,
  router_type,
  routes
}: TxInfoProps) => {
  const [open, setOpen] = useState(false)
  const widgetStyles = useWheelxWidgetStyles()
  const quoteInfoContainerStyles = widgetStyles.quoteInfoContainer || {}
  const quoteInfoCardStyles = widgetStyles.quoteInfoCard || {}
  const quoteInfoLabelStyles = widgetStyles.quoteInfoLabel || {}
  const quoteInfoValueStyles = widgetStyles.quoteInfoValue || {}
  const quoteInfoFreeBadgeStyles = widgetStyles.quoteInfoFreeBadge || {}
  const {
    fromTokenInfo,
    toTokenInfo,
    fromAmount,
    toAmountToUsd,
    fromAmountToUsd
  } = useSwapAndBridgeContextStore()

  const [isRateReversed, setIsRateReversed] = useState(false)

  // console.log('###### routes ######:', routes)

  const toAmountInUnit = new Fraction(fromAmount).eq(0)
    ? '0'
    : formatTokenAmount({
        amount: new Fraction(amountOut)
          .shr(toTokenInfo.decimals)
          .div(new Fraction(fromAmount)),
        decimals: 0,
        fixedDecimals: toTokenInfo.decimals > 6 ? 6 : 2
      })

  const fromAmountInUnit =
    toAmountInUnit !== '0'
      ? formatDecimalNum(1 / parseFloat(toAmountInUnit.replace(/,/g, '')), 6)
      : '0'

  const toAmountInUnitNumber = parseFloat(toAmountInUnit.replace(/,/g, ''))
  const toAmountInUnitStr =
    toAmountInUnit !== '0' ? formatDecimalNum(toAmountInUnitNumber, 6) : '0'

  const renderPriceImpactPercentage = () => {
    if (
      priceImpact.bridgeFee === '0' &&
      priceImpact.dstGasFee === '0' &&
      priceImpact.swapFee === '0'
    ) {
      return (
        <Text
          variant={'content9'}
          color={'white'}
          bg={'#00CBB3'}
          p={'3px'}
          borderRadius={'4px'}
          {...quoteInfoFreeBadgeStyles}
        >
          Free
        </Text>
      )
    }

    if (toAmountToUsd && fromAmountToUsd && fromTokenInUsd) {
      const inPrice = Number(fromAmountToUsd.replace(/,/g, ''))
      const outPrice = Number(toAmountToUsd.replace(/,/g, ''))
      if (outPrice > inPrice) {
        return (
          <Text variant={textVariant} color={'#15003E'} {...quoteInfoValueStyles}>
            {`+${(((outPrice - inPrice) / inPrice) * 100).toFixed(2)}%`}
          </Text>
        )
      }
      return (
        <Text variant={textVariant} color={'#15003E'} {...quoteInfoValueStyles}>
          {`-${(((inPrice - outPrice) / inPrice) * 100).toFixed(2)}%`}
        </Text>
      )
    }
    // use usd: (in - out) / in
    return (
      <Text variant={textVariant} color={'#15003E'} {...quoteInfoValueStyles}>
        -
      </Text>
    )
  }

  const handleRateDisplayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRateReversed(!isRateReversed)
  }

  // useEffect(() => {
  //   console.log('----toAmountInUnit----:', toAmountInUnit)
  // }, [toAmountInUnit])

  const renderSaveDay = () => {
    if (fromTokenInfo.chain_id === toTokenInfo.chain_id) return null
    const currentSaveDay = saveDay.find(
      (item) => item.chainId === fromTokenInfo.chain_id
    )
    if (currentSaveDay) {
      return (
        <HStack
          border={'1px solid #000'}
          gap={0}
          padding={'0 5px'}
          h={'18px'}
          borderRadius={'18px'}
          fontSize={['8px', '10px']}
          whiteSpace={'nowrap'}
          alignItems={'center'}
        >
          <IoIosFlash />
          Save {currentSaveDay.day}D
        </HStack>
      )
    }
    return null
  }

  const renderAiRouter = () => {
    if (routes && routes?.length > 0) {
      const length = routes.length
      return (
        <HStack gap={0}>
          {routes.map((item, index) => {
            return (
              <HStack key={index} gap={0}>
                <Image
                  src={item.logo}
                  alt={item.name}
                  title={item.name}
                  w={'14px'}
                  h={'14px'}
                  borderRadius={'full'}
                />
                {index !== length - 1 && (
                  <AssetIcon
                    src={RoutesIcon}
                    alt="route"
                    margin={'0 4px'}
                    boxSize={'12px'}
                  />
                )}
              </HStack>
            )
          })}
        </HStack>
      )
    }
    return <Text variant={textVariant}>{router}</Text>
  }

  return (
    <Collapsible.Root
      open={open}
      w={'100%'}
      bg={'#F5F6FF'}
      borderRadius={'8px'}
      px={2}
      py={1.5}
      {...quoteInfoContainerStyles}
    >
      <Collapsible.Trigger w={'100%'}>
        <HStack w={'100%'} justify={'space-between'} color={'brand-grey1'}>
          <HStack
            gap={1}
            onClick={handleRateDisplayClick}
            cursor="pointer"
            userSelect="none"
          >
            <Image
              src={getAssetSrc(switchIcon)}
              alt="switch"
              w={'14px'}
              h={'14px'}
            />
            <Text variant={textVariant} whiteSpace={'nowrap'}>
              {isRateReversed
                ? `1 ${toTokenInfo.symbol} = ${fromAmountInUnit} ${fromTokenInfo.symbol}`
                : `1 ${fromTokenInfo.symbol} = ${toAmountInUnitStr} ${toTokenInfo.symbol}`}
            </Text>
          </HStack>
          <HStack>
            {!open && renderSaveDay()}
            {!open ? (
              priceImpact.bridgeFee === '0' &&
              priceImpact.dstGasFee === '0' &&
              priceImpact.swapFee === '0' ? (
                <Text
                  variant={'content9'}
                  color={'white'}
                  bg={'#00CBB3'}
                  p={'3px'}
                  borderRadius={'4px'}
                  {...quoteInfoFreeBadgeStyles}
                >
                  Free
                </Text>
              ) : null
            ) : null}
            <AssetIcon
              src={ArrowDownIcon}
              alt="toggle"
              transition={'all 0.3s ease-in-out'}
              transform={open ? 'rotate(180deg)' : undefined}
              boxSize={'14px'}
              onClick={() => setOpen(!open)}
            />
          </HStack>
        </HStack>
      </Collapsible.Trigger>
      <Collapsible.Content w={'100%'} pb={1.5} color={'brand-grey1'}>
        <VStack w={'100%'} align={'start'} fontSize={'xs'} gap={3}>
          <VStack bg="white" p={3} borderRadius={'12px'} w={'100%'} {...quoteInfoCardStyles}>
            <HStack w={'100%'} justify={'space-between'}>
              <Text variant={textVariant} color={'brand-grey4'} {...quoteInfoLabelStyles}>
                Price Impact
              </Text>
              <HStack gap={1}>
                {renderPriceImpactPercentage()}
                <MobileTooltip
                  contentProps={{
                    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)'
                  }}
                  content={
                    <TipsContent
                      priceImpact={priceImpact}
                      toTokenInfo={toTokenInfo}
                      router_type={router_type}
                      fromTokenInfo={fromTokenInfo}
                      fromAmountToUsd={fromAmountToUsd}
                      toAmountToUsd={toAmountToUsd}
                    />
                  }
                  openDelay={100}
                  closeDelay={100}
                  interactive
                >
                  <AssetIcon src={InfoIcon} alt="info" boxSize={'10px'} />
                </MobileTooltip>
              </HStack>
            </HStack>

            <HStack w={'100%'} justify={'space-between'}>
              <Text variant={textVariant} color={'brand-grey4'} {...quoteInfoLabelStyles}>
                Slippage
              </Text>
              <Text variant={textVariant} {...quoteInfoValueStyles}>
                {formatSlippage(slippage)}%
              </Text>
            </HStack>

            <HStack w={'100%'} justify={'space-between'}>
              <Text variant={textVariant} color={'brand-grey4'} {...quoteInfoLabelStyles}>
                Min. Received
              </Text>
              <HStack gap={1}>
                <TokenAmountText
                  amount={new Fraction(minReceive)}
                  decimals={toTokenInfo.decimals}
                  suffix={toTokenInfo.symbol}
                />
              </HStack>
            </HStack>
          </VStack>

          <VStack bg="white" p={3} borderRadius={'12px'} w={'100%'} {...quoteInfoCardStyles}>
            <HStack w={'100%'} justify={'space-between'}>
              <Text variant={textVariant} color={'brand-grey4'} {...quoteInfoLabelStyles}>
                Estimated Time
              </Text>
              <HStack gap={1}>
                <AssetIcon src={TimeIcon} alt="time" boxSize={'14px'} />
                <Text variant={textVariant} {...quoteInfoValueStyles}>
                  ~{estimatedTime}s
                </Text>
              </HStack>
            </HStack>
            <HStack w={'100%'} justify={'space-between'}>
              <Text variant={textVariant} color={'brand-grey4'} {...quoteInfoLabelStyles}>
                Recipient Address
              </Text>
              <Text variant={textVariant} {...quoteInfoValueStyles}>
                {sliceAddress(recipient)}
              </Text>
            </HStack>
            <HStack w={'100%'} justify={'space-between'}>
              <Text variant={textVariant} color={'brand-grey4'} {...quoteInfoLabelStyles}>
                AI Router
              </Text>
              {renderAiRouter()}
            </HStack>
          </VStack>
        </VStack>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
