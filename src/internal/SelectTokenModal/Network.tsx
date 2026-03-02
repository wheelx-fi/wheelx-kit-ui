import { Box, HStack, Icon, Image, useBreakpointValue } from '@chakra-ui/react'

import { Text } from '../ui'
import { useChainsStore } from '../stores'
import ArrowFillRightIcon from '../assets/icons/arrow-fill-right.svg'
import DingIcon from '../assets/icons/ding.svg'
import { useEffect, useState } from 'react'
import { FavoriteButton } from './FavoriteButton'
import { useAccount } from 'wagmi'
import { useSwapAndBridgeContextStore } from '../SwapAndBridge/hooks'
import { ArcTestnetChainId } from '../consts/chainsInfo'
import defaultTokenIcon from '../assets/images/default-token-icon.png'
import { getAssetSrc } from '../utils/getAssetSrc'
import { useWheelxWidgetStyles } from '../../config'

interface Props {
  chainId: number
  isSelected?: boolean
  isPopular?: boolean
  onClick: () => void
  isSelectingFromToken: boolean
  isPredictionChain?: boolean
  disableArcTestnetLimit: boolean
  setDisableArcTestnetLimit: (value: boolean) => void
}
export const Network = ({
  chainId,
  isSelected,
  onClick,
  isPopular,
  isSelectingFromToken,
  isPredictionChain,
  disableArcTestnetLimit,
  setDisableArcTestnetLimit
}: Props) => {
  const widgetStyles = useWheelxWidgetStyles()
  const chainRowStyles = widgetStyles.tokenModalChainRow || {}
  const chainRowHoverStyles = widgetStyles.tokenModalChainRowHover || { bg: '#E3E4FA' }
  const chainRowActiveStyles = isSelected
    ? widgetStyles.tokenModalChainRowActive || {}
    : {}
  const { fromTokenInfo, toTokenInfo } = useSwapAndBridgeContextStore()
  const fromChainId = fromTokenInfo?.chain_id
  const toChainId = toTokenInfo?.chain_id
  const { chains, setIsSelectPredictionChain } = useChainsStore()
  const chainInfo = chains?.find((chain) => chain.chain_id === chainId)
  const [isFromArcTestnet, setIsFromArcTestnet] = useState(false)
  const [isToArcTestnet, setIsToArcTestnet] = useState(false)

  const isMobile = useBreakpointValue({ base: true, md: false })
  const [isStarVisible, setIsStarVisible] = useState(false)
  const [isPopularIconShow, setIsPopularIconShow] = useState(false)
  const { address } = useAccount()

  const handleClick = () => {
    if (chainId !== ArcTestnetChainId) {
      setDisableArcTestnetLimit(true)
    }
    onClick()
    if (isPredictionChain) {
      setIsSelectPredictionChain(true)
    } else {
      if (!isSelectingFromToken) {
        setIsSelectPredictionChain(false)
      }
    }
  }

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsStarVisible(true)
      setIsPopularIconShow(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsStarVisible(false)
      setIsPopularIconShow(false)
    }
  }

  useEffect(() => {
    if (isMobile) {
      setIsStarVisible(true)
      setIsPopularIconShow(true)
    }
  }, [isMobile])

  useEffect(() => {
    if (disableArcTestnetLimit) {
      setIsToArcTestnet(false)
      setIsFromArcTestnet(false)
      return
    }
    const currentChainId = chainInfo?.chain_id
    if (!isSelectingFromToken) {
      if (fromChainId === ArcTestnetChainId) {
        if (currentChainId === ArcTestnetChainId) {
          setIsToArcTestnet(false)
        } else {
          setIsToArcTestnet(true)
        }
      }
    } else {
      if (toChainId === ArcTestnetChainId) {
        if (currentChainId === ArcTestnetChainId) {
          setIsFromArcTestnet(false)
        } else {
          setIsFromArcTestnet(true)
        }
      }
    }
  }, [
    isSelectingFromToken,
    fromChainId,
    toChainId,
    chainInfo,
    disableArcTestnetLimit
  ])

  if (chainInfo) {
    if (!chainInfo.outbound && isSelectingFromToken) {
      return null
    }
    if (!chainInfo.inbound && !isSelectingFromToken) {
      return null
    }
  }

  return (
    <HStack
      px={2}
      w={'100%'}
      _hover={chainRowHoverStyles as any}
      transition={'all 0.2s ease-in-out'}
      cursor={'pointer'}
      gap={1}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-selected={isSelected ? 'true' : 'false'}
      opacity={isToArcTestnet || isFromArcTestnet ? '0.35' : '1'}
      {...chainRowStyles}
    >
      <HStack
        boxSizing={'content-box'}
        border={'1px solid'}
        borderColor={isSelected ? '#8143FF' : 'transparent'}
        bg={isSelected ? '#E3E4FA' : 'transparent'}
        borderRadius={'12px'}
        w={['100%', '82%']}
        px={2}
        py={'7px'}
        {...chainRowActiveStyles}
      >
        <Image
          src={chainInfo?.chain_icon || getAssetSrc(defaultTokenIcon)}
          w={'24px'}
          h={'24px'}
          alt={chainInfo?.name}
          borderRadius={'full'}
        />
        <Text
          variant={{
            base: 'content7',
            md: 'content6_1'
          }}
          lineClamp="1"
          flex={1}
          w={0}
          whiteSpace={'nowrap'}
          overflow={'hidden'}
          textOverflow={'ellipsis'}
          {...widgetStyles.tokenModalChainText}
        >
          {chainInfo?.name}
        </Text>
        {isStarVisible && address && !isPopular && !isPredictionChain && (
          <FavoriteButton networkId={chainId} networkName={chainInfo?.name} />
        )}
        {isPopularIconShow && isPopular && (
          <Box
            w={'22px'}
            h={'22px'}
            backgroundColor={'transparent'}
            cursor="default"
          >
            <Icon
              as={DingIcon}
              fontSize="14px"
              width={'14px'}
              h={'14px'}
              color="#8A40FF"
              transition="opacity 0.2s ease-in-out"
            />
          </Box>
        )}
      </HStack>
      {isSelected && <Icon as={ArrowFillRightIcon} />}
    </HStack>
  )
}
