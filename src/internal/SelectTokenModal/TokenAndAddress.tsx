import { HStack, Image, useBreakpointValue, VStack } from '@chakra-ui/react'

import { TokenInfo, TokenInfoWithBalance } from '../api'
import { sliceAddress } from '../utils'

import { Heading, Text } from '../ui'

import { Fraction } from 'bi-fraction'
import {
  TokenAmountHeading,
  TokenIconWithNetworkLogo
} from '../commons'
import { TokenFavoriteButton } from './TokenFavoriteButton'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useTokenSearchHistoryContext } from './SearchHistoryContext'
import { useChainsStore } from '../stores'
import { useMemo } from 'react'
import { useDifferentAddressStore } from '../stores/useDifferentAddressStore'
import gasIcon from '../assets/images/gas.png'
import verifiedIcon from '../assets/images/verified.png'
import { getAssetSrc } from '../utils/getAssetSrc'
import { useWheelxWidgetStyles } from '../../config'
interface Props {
  tokenInfo: TokenInfoWithBalance
  onSelectToken: (tokenInfo: TokenInfo) => void
  isSelectAll?: boolean
  isSearchResult?: boolean
  isSelectingFromToken: boolean
}
export const TokenAndAddress = ({
  tokenInfo,
  onSelectToken,
  isSelectAll,
  isSearchResult,
  isSelectingFromToken
}: Props) => {
  const widgetStyles = useWheelxWidgetStyles()
  const tokenRowStyles = widgetStyles.tokenModalTokenRow || {}
  const tokenRowHoverStyles = widgetStyles.tokenModalTokenRowHover || {
    bg: '#E3E4FA'
  }
  const { address, symbol, tags } = tokenInfo
  const { address: userAddress } = useAccount()
  const { chains } = useChainsStore()

  const isPinToken = tags?.includes('pin')
  const isCertToken = tags?.includes('cert')

  const isMobile = useBreakpointValue({ base: true, md: false })
  const [isStarVisible, setIsStarVisible] = useState(false)
  const { addSearchHistory } = useTokenSearchHistoryContext()
  const [tokenNotIn, setTokenNotIn] = useState(false)
  const [tokenNotOut, setTokenNotOut] = useState(false)
  const [hideBalance, setHideBalance] = useState(true)
  const { setIsDepositPlatformToken, setDifferentAddress } =
    useDifferentAddressStore()

  const currentChainInfo = useMemo(() => {
    return chains?.find((chain) => chain.chain_id === tokenInfo.chain_id)
  }, [chains, tokenInfo])

  // console.log('### userAddress ####:', userAddress)

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsStarVisible(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsStarVisible(false)
    }
  }

  const handleClick = () => {
    if (isSearchResult) {
      const { chain_id, address, symbol, decimals, logo, name, tags } =
        tokenInfo
      addSearchHistory(chain_id, address, symbol, decimals, logo, name, tags)
    }
    if (tokenNotOut) {
      return
    }
    if (tokenNotIn) {
      return
    }
    onSelectToken(tokenInfo)
    // console.log('###tokenInfo####:', tokenInfo)
    if (tokenInfo?.platform_id && tokenInfo.platform_id > 0) {
      setIsDepositPlatformToken(true)
      setDifferentAddress(undefined)
    } else {
      if (!isSelectingFromToken) {
        setIsDepositPlatformToken(false)
        if (userAddress) {
          setDifferentAddress(userAddress)
        }
      }
    }
  }

  useEffect(() => {
    if (currentChainInfo) {
      if (!currentChainInfo.outbound && isSelectingFromToken) {
        setTokenNotOut(true)
      } else {
        setTokenNotOut(false)
      }

      if (!currentChainInfo.inbound && !isSelectingFromToken) {
        setTokenNotIn(true)
      } else {
        setTokenNotIn(false)
      }

      if (tokenInfo?.platform_id && tokenInfo.platform_id > 0) {
        setHideBalance(true)
      } else {
        setHideBalance(false)
      }
    }
  }, [currentChainInfo, isSelectingFromToken])

  useEffect(() => {
    if (isMobile) {
      setIsStarVisible(true)
    }
  }, [isMobile])
  // const isTopToken = tags.includes('top')

  if (tokenNotIn || tokenNotOut) {
    return null
  }

  return (
    <HStack
      w={'100%'}
      justify={'space-between'}
      cursor={'pointer'}
      onClick={handleClick}
      p={2}
      _hover={tokenRowHoverStyles as any}
      transition={'all 0.2s ease-in-out'}
      flexShrink={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...tokenRowStyles}
    >
      <HStack flexShrink={0} flex={1} w={0}>
        <TokenIconWithNetworkLogo tokenInfo={tokenInfo} />
        <VStack gap={1} align={'start'} flex={1} w={0}>
          <HStack gap={0} w={'100%'} h={'20px'} overflow={'hidden'}>
            <Heading
              variant={{
                base: 'heading11',
                md: 'heading10'
              }}
              color={'brand-grey1'}
              maxW={'70%'}
              overflow={'hidden'}
              textOverflow={'ellipsis'}
              whiteSpace={'nowrap'}
              {...widgetStyles.tokenModalTokenPrimaryText}
            >
              {symbol}
            </Heading>
            {isPinToken && (
              <Image
                src={getAssetSrc(gasIcon)}
                w={'14px'}
                h={'14px'}
                alt={'pin'}
                marginLeft={'3px'}
              />
            )}
            {isCertToken && (
              <Image
                src={getAssetSrc(verifiedIcon)}
                w={'14px'}
                h={'14px'}
                alt={'cert'}
                marginLeft={'3px'}
              />
            )}
            {isStarVisible && userAddress && !isSelectAll && !hideBalance && (
              <TokenFavoriteButton
                // chainId={tokenInfo.chain_id}
                // tokenAddress={tokenInfo.address}
                tokenInfo={tokenInfo}
              />
            )}
          </HStack>
          <Text
            variant={{
              base: 'content9',
              md: 'content8'
            }}
            color={'brand-grey4'}
            {...widgetStyles.tokenModalTokenSecondaryText}
          >
            {sliceAddress(address)}
            {/* - {isPinToken ? 'Pin' : 'no pin'} -
            {isTopToken ? 'Top' : 'no top'} */}
          </Text>
        </VStack>
      </HStack>
      {!!userAddress && !hideBalance && (
        <VStack gap={1} align={'end'}>
          <TokenAmountHeading
            amount={new Fraction(
              tokenInfo.balance
                ? tokenInfo.balance !== 'NaN'
                  ? tokenInfo.balance
                  : 0
                : 0
            ).shl(tokenInfo.decimals)}
            decimals={tokenInfo.decimals}
            variant={{
              base: 'heading11',
              md: 'heading10'
            }}
            color={'brand-grey1'}
          />

          <Text
            variant={{
              base: 'content9',
              md: 'content8'
            }}
            color={'brand-grey4'}
            {...widgetStyles.tokenModalTokenSecondaryText}
          >
            {tokenInfo.usdPrice &&
            tokenInfo.balance &&
            tokenInfo.balance !== 'NaN' ? (
              <>
                $
                {new Fraction(tokenInfo.balance)
                  .mul(tokenInfo.usdPrice)
                  .toFormat({
                    decimalPlaces: 2,
                    trailingZeros: false
                  })}
              </>
            ) : null}
          </Text>
        </VStack>
      )}
    </HStack>
  )
}
