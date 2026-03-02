import { HStack, VStack, Icon } from '@chakra-ui/react'

import ArrowFillRightIcon from '../assets/icons/arrow-fill-right.svg'

import { Network } from './Network'
import { Text } from '../ui'
import {
  ChainInfo,
  TokenBalance,
  TokenInfo,
  TokenInfoWithBalance
} from '../api'
import { TokenList } from './TokenList'
import { SearchInput } from './SearchInput'
import { useMemo } from 'react'
import { AllChainsIcon } from './AllChainsIcon'
import { useRef, useEffect } from 'react'
import { useSwapAndBridgeContextStore } from '../SwapAndBridge/hooks'
import { ArcTestnetChainId } from '../consts/chainsInfo'
import { useWheelxWidgetStyles } from '../../config'

interface Props {
  popularChains?: ChainInfo[]
  orderedChains?: ChainInfo[]
  favChains?: ChainInfo[]
  searchChains?: ChainInfo[]
  searchTokensInfo?: TokenInfoWithBalance[]
  tokens?: TokenInfo[]
  orderedPredictionChains?: ChainInfo[]
  predictionTokens?: TokenInfo[]
  userBalances?: TokenBalance[]
  isLoading: boolean
  searchChainsValue: string
  searchTokensValue: string
  selectedChain: number | null
  selectedPlatform: number
  isSelectAll: boolean
  hideChainSelector: boolean
  disableSelectAll: boolean
  chainId: number | null
  isSelectingFromToken: boolean
  handleSearchChains: (value: string) => void
  handleSearchTokens: (value: string) => void
  handleSelectChains: (chainId: number, platformId: number) => void
  onSelectToken: (tokenInfo: TokenInfo) => void
  handleSelectAll: () => void
  resetSearch: () => void
  disableArcTestnetLimit: boolean
  setDisableArcTestnetLimit: (value: boolean) => void
}
export const DesktopContent = ({
  isLoading,
  searchChainsValue,
  handleSearchChains,
  isSelectAll,
  hideChainSelector,
  disableSelectAll,
  popularChains,
  orderedChains,
  favChains,
  searchChains,
  orderedPredictionChains,
  // predictionTokens,
  tokens,
  userBalances,
  searchTokensInfo,
  selectedChain,
  selectedPlatform,
  handleSelectChains,
  searchTokensValue,
  handleSearchTokens,
  onSelectToken,
  isSelectingFromToken,
  handleSelectAll,
  chainId,
  resetSearch,
  disableArcTestnetLimit,
  setDisableArcTestnetLimit
}: Props) => {
  const widgetStyles = useWheelxWidgetStyles()
  const chainsWithAssetsRowStyles = widgetStyles.tokenModalChainsWithAssetsRow || {}
  const chainsWithAssetsRowActiveStyles = isSelectAll
    ? widgetStyles.tokenModalChainsWithAssetsRowActive || {}
    : {}
  const isShowChainsWithAssets = useMemo(
    () => userBalances && userBalances.length > 0,
    [userBalances]
  )

  const { fromTokenInfo, toTokenInfo } = useSwapAndBridgeContextStore()
  const fromChainId = fromTokenInfo?.chain_id
  const toChainId = toTokenInfo?.chain_id

  const isChainsWithAssetsDisabled = useMemo(() => {
    if (disableArcTestnetLimit) return false

    if (isSelectingFromToken) {
      return toChainId === ArcTestnetChainId
    } else {
      return fromChainId === ArcTestnetChainId
    }
  }, [isSelectingFromToken, fromChainId, toChainId, disableArcTestnetLimit])

  // console.log('isSelectingFromToken:', tokens)
  const listContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listContainerRef.current) return

    const timeoutId = setTimeout(() => {
      const selectedElement = listContainerRef.current?.querySelector(
        '[data-selected="true"]'
      ) as HTMLElement

      if (selectedElement && listContainerRef.current) {
        const container = listContainerRef.current
        const elementTop = selectedElement.offsetTop
        const elementHeight = selectedElement.offsetHeight
        const containerHeight = container.clientHeight

        const scrollTop = elementTop - containerHeight / 2 + elementHeight / 2

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        })
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [
    selectedChain,
    selectedPlatform,
    popularChains,
    favChains,
    orderedChains,
    orderedPredictionChains,
    searchChainsValue,
    searchChains
  ])

  // console.log('order chains', orderedChains)

  return (
    <HStack w={'100%'} h={'100%'} align={'start'} gap={0} hideBelow={'md'}>
      {/* left side */}
      {!hideChainSelector && (
        <VStack
          w={'40%'}
          h={'100%'}
          py={3.5}
          borderRadius={'24px 0 0 24px'}
          bg={'#F5F6FF'}
          align={'start'}
          maxW={'236px'}
          {...widgetStyles.tokenModalChainPanel}
        >
          <SearchInput
            placeholder="Search chains"
            value={searchChainsValue}
            onChange={(value) => handleSearchChains(value)}
          />

          <VStack
            align={'start'}
            gap={0}
            w={'100%'}
            overflowY={'auto'}
            ref={listContainerRef}
          >
            {isShowChainsWithAssets && !disableSelectAll && (
              <HStack
                px={2}
                mb={4}
                w={'100%'}
                _hover={{ bg: '#E3E4FA' }}
                transition={'all 0.2s ease-in-out'}
                cursor={'pointer'}
                gap={1}
                onClick={() => {
                  // if (isChainsWithAssetsDisabled) return
                  setDisableArcTestnetLimit(true)
                  handleSelectAll()
                }}
                opacity={isChainsWithAssetsDisabled ? '0.35' : '1'}
                {...chainsWithAssetsRowStyles}
              >
                <HStack
                  boxSizing={'content-box'}
                  border={'1px solid'}
                  borderColor={isSelectAll ? '#8143FF' : 'transparent'}
                  bg={isSelectAll ? '#E3E4FA' : 'transparent'}
                  borderRadius={'12px'}
                  w={'82%'}
                  px={2}
                  py={'7px'}
                  {...chainsWithAssetsRowActiveStyles}
                >
                  <AllChainsIcon />
                  <Text
                    variant={'content6_1'}
                    color={'brand-grey1'}
                    whiteSpace={'nowrap'}
                    {...widgetStyles.tokenModalSectionLabelText}
                  >
                    Chains with assets
                  </Text>
                </HStack>
                {isSelectAll && <Icon as={ArrowFillRightIcon} />}
              </HStack>
            )}

            {searchChainsValue ? (
              <>
                {searchChains?.map((chain) => (
                  <Network
                    key={chain.chain_id + 'search-chains'}
                    chainId={chain.chain_id}
                    isSelectingFromToken={isSelectingFromToken}
                    isSelected={
                      selectedPlatform
                        ? selectedPlatform === chain.platform_id
                        : selectedChain === chain.chain_id
                    }
                    onClick={() =>
                      handleSelectChains(chain.chain_id, chain.platform_id || 0)
                    }
                    disableArcTestnetLimit={disableArcTestnetLimit}
                    setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                  />
                ))}
              </>
            ) : (
            <>
              <Text
                px={2}
                color={'brand-grey4'}
                variant={'content7'}
                mb={2}
                {...widgetStyles.tokenModalSectionLabelText}
              >
                Popular
              </Text>
              {popularChains?.map((chain) => (
                <Network
                  key={chain.chain_id + 'popular-chains'}
                  chainId={chain.chain_id}
                  // isSelected={selectedChain === chain.chain_id}
                  isSelected={
                    selectedPlatform
                      ? selectedPlatform === chain.platform_id
                      : selectedChain === chain.chain_id
                  }
                  isPopular={true}
                  onClick={() =>
                    handleSelectChains(chain.chain_id, chain.platform_id || 0)
                  }
                  isSelectingFromToken={isSelectingFromToken}
                  isPredictionChain={false}
                  disableArcTestnetLimit={disableArcTestnetLimit}
                  setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                />
              ))}

              {favChains?.map((chain) => (
                <Network
                  key={chain.chain_id + 'fav-chains'}
                  chainId={chain.chain_id}
                  // isSelected={selectedChain === chain.chain_id}
                  isSelected={
                    selectedPlatform
                      ? selectedPlatform === chain.platform_id
                      : selectedChain === chain.chain_id
                  }
                  onClick={() =>
                    handleSelectChains(chain.chain_id, chain.platform_id || 0)
                  }
                  isSelectingFromToken={isSelectingFromToken}
                  isPredictionChain={chain?.platform_id != null ? true : false}
                  disableArcTestnetLimit={disableArcTestnetLimit}
                  setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                />
              ))}

              <Text
                px={2}
                color={'brand-grey4'}
                variant={'content7'}
                my={2}
                {...widgetStyles.tokenModalSectionLabelText}
              >
                Chains (A-Z)
              </Text>
              {orderedChains
                ?.filter((chain) => chain.is_testnet === false)
                ?.map((chain) => (
                  <Network
                    key={chain.chain_id + 'ordered-chains'}
                    chainId={chain.chain_id}
                    // isSelected={selectedChain === chain.chain_id}
                    isSelected={
                      selectedPlatform
                        ? selectedPlatform === chain.platform_id
                        : selectedChain === chain.chain_id
                    }
                    onClick={() =>
                      handleSelectChains(chain.chain_id, chain.platform_id || 0)
                    }
                    isSelectingFromToken={isSelectingFromToken}
                    isPredictionChain={false}
                    disableArcTestnetLimit={disableArcTestnetLimit}
                    setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                  />
                ))}
              {!isSelectingFromToken && (
                <>
                  <Text
                    px={2}
                    color={'brand-grey4'}
                    variant={'content7'}
                    my={2}
                    {...widgetStyles.tokenModalSectionLabelText}
                  >
                    Prediction
                  </Text>
                  {orderedPredictionChains?.map((chain) => (
                    <Network
                      key={chain.chain_id + 'prediction-chains'}
                      chainId={chain.chain_id}
                      // isSelected={selectedChain === chain.chain_id}
                      isSelected={
                        selectedPlatform
                          ? selectedPlatform === chain.platform_id
                          : selectedChain === chain.chain_id
                      }
                      onClick={() =>
                        handleSelectChains(
                          chain.chain_id,
                          chain.platform_id || 0
                        )
                      }
                      isSelectingFromToken={isSelectingFromToken}
                      isPredictionChain={true}
                      disableArcTestnetLimit={disableArcTestnetLimit}
                      setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                    />
                  ))}
                </>
              )}
              <Text
                px={2}
                color={'brand-grey4'}
                variant={'content7'}
                my={2}
                {...widgetStyles.tokenModalSectionLabelText}
              >
                Testnet
              </Text>
              {orderedChains
                ?.filter((chain) => chain.is_testnet === true)
                ?.map((chain) => (
                  <Network
                    key={chain.chain_id + 'ordered-chains'}
                    chainId={chain.chain_id}
                    // isSelected={selectedChain === chain.chain_id}
                    isSelected={
                      selectedPlatform
                        ? selectedPlatform === chain.platform_id
                        : selectedChain === chain.chain_id
                    }
                    onClick={() =>
                      handleSelectChains(chain.chain_id, chain.platform_id || 0)
                    }
                    isSelectingFromToken={isSelectingFromToken}
                    isPredictionChain={false}
                    disableArcTestnetLimit={disableArcTestnetLimit}
                    setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                  />
                ))}
            </>
          )}
          </VStack>
        </VStack>
      )}

      {/* right side */}
      <VStack
        flex={1}
        py={3.5}
        align={'start'}
        h={'100%'}
        w={hideChainSelector ? '100%' : 0}
        {...widgetStyles.tokenModalTokenPanel}
      >
        <SearchInput
          placeholder="Search for a token or contract address"
          value={searchTokensValue}
          onChange={(value) => handleSearchTokens(value)}
        />

        <VStack align={'start'} gap={3} w={'100%'} overflowY={'auto'} pr={1}>
          {/* <Text color={'brand-grey4'} variant={'content7'} px={2}>
            Suggested tokens
          </Text> */}

          <TokenList
            isLoading={isLoading}
            isSelectAll={isSelectAll}
            userBalances={userBalances}
            searchTokensInfo={searchTokensInfo}
            tokens={tokens}
            chainId={chainId}
            onSelectToken={onSelectToken}
            resetSearch={resetSearch}
            searchTokensValue={searchTokensValue}
            isSelectingFromToken={isSelectingFromToken}
          />
        </VStack>
      </VStack>
    </HStack>
  )
}
