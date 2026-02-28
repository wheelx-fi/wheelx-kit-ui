import {
  VStack,
  Box,
  Image,
  HStack,
  InputGroup,
  Input
} from '@chakra-ui/react'

import { Network } from './Network'
import { Text } from '../ui'
import BackIcon from '../assets/icons/back.svg?url'
import SearchIcon from '../assets/icons/search.svg?url'
import ArrowDownIcon from '../assets/icons/arrow-down.svg?url'
import ArrowFillRightIcon from '../assets/icons/arrow-fill-right.svg?url'
import {
  Dispatch,
  memo,
  SetStateAction,
  useMemo,
  useState,
  useRef,
  useEffect
} from 'react'
import {
  ChainInfo,
  TokenBalance,
  TokenInfo,
  TokenInfoWithBalance
} from '../api'
import { TokenList } from './TokenList'
import { SearchInput } from './SearchInput'
import { AllChainsIcon } from './AllChainsIcon'
import { useSwapAndBridgeContextStore } from '../SwapAndBridge/hooks'
import { ArcTestnetChainId } from '../consts/chainsInfo'
import { useWheelxWidgetStyles } from '../../config'
import { AssetIcon } from '../ui/AssetIcon'

interface Props {
  popularChains?: ChainInfo[]
  orderedChains?: ChainInfo[]
  orderedPredictionChains?: ChainInfo[]
  favChains?: ChainInfo[]
  tokens?: TokenInfo[]
  searchTokensInfo?: TokenInfoWithBalance[]
  userBalances?: TokenBalance[]
  isLoading: boolean
  searchChainsValue: string
  searchTokensValue: string
  selectedChain: number | null
  selectedPlatform: number
  selectedChainInfo?: ChainInfo
  isSelectAll: boolean
  hideChainSelector: boolean
  disableSelectAll: boolean
  isMobileChainsOpen: boolean
  chainId: number | null
  isSelectingFromToken: boolean
  handleSearchChains: (value: string) => void
  handleSearchTokens: (value: string) => void
  handleSelectChains: (chainId: number, platformId: number) => void
  onSelectToken: (tokenInfo: TokenInfo) => void
  handleSelectAll: () => void
  resetSearch: () => void
  setIsMobileChainsOpen: Dispatch<SetStateAction<boolean>>
  disableArcTestnetLimit: boolean
  setDisableArcTestnetLimit: (value: boolean) => void
}

const arePropsEqual = (prevProps: Props, nextProps: Props) => {
  return (
    prevProps.isMobileChainsOpen === nextProps.isMobileChainsOpen &&
    prevProps.searchTokensValue === nextProps.searchTokensValue &&
    prevProps.isSelectAll === nextProps.isSelectAll &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.searchChainsValue === nextProps.searchChainsValue &&
    JSON.stringify(prevProps.selectedChainInfo) ===
      JSON.stringify(nextProps.selectedChainInfo) &&
    JSON.stringify(prevProps.popularChains) ===
      JSON.stringify(nextProps.popularChains) &&
    JSON.stringify(prevProps.orderedChains) ===
      JSON.stringify(nextProps.orderedChains) &&
    JSON.stringify(prevProps.favChains) ===
      JSON.stringify(nextProps.favChains) &&
    JSON.stringify(prevProps.tokens) === JSON.stringify(nextProps.tokens) &&
    JSON.stringify(prevProps.userBalances) ===
      JSON.stringify(nextProps.userBalances) &&
    JSON.stringify(prevProps.searchTokensInfo) ===
      JSON.stringify(nextProps.searchTokensInfo)
  )
}

export const MobileContent = memo(function MobileContent({
  isMobileChainsOpen,
  searchTokensValue,
  isSelectAll,
  hideChainSelector,
  disableSelectAll,
  selectedChain,
  selectedPlatform,
  selectedChainInfo,
  handleSearchTokens,
  handleSearchChains,
  handleSelectChains,
  setIsMobileChainsOpen,
  onSelectToken,
  searchChainsValue,
  popularChains,
  orderedChains,
  orderedPredictionChains,
  favChains,
  tokens,
  userBalances,
  searchTokensInfo,
  isLoading,
  handleSelectAll,
  chainId,
  resetSearch,
  isSelectingFromToken,
  disableArcTestnetLimit,
  setDisableArcTestnetLimit
}: Props) {
  const widgetStyles = useWheelxWidgetStyles()
  const chainsWithAssetsRowStyles = widgetStyles.tokenModalChainsWithAssetsRow || {}
  const chainsWithAssetsRowActiveStyles = isSelectAll
    ? widgetStyles.tokenModalChainsWithAssetsRowActive || {}
    : {}
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false)
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

  const listContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hideChainSelector && isMobileChainsOpen) {
      setIsMobileChainsOpen(false)
    }
  }, [hideChainSelector, isMobileChainsOpen, setIsMobileChainsOpen])

  useEffect(() => {
    if (!isMobileChainsOpen || !listContainerRef.current) return
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
    isMobileChainsOpen
  ])

  return (
    <VStack w={'100%'} h={'100%'} align={'start'} gap={0} hideFrom={'md'}>
      {!isMobileChainsOpen && (
        <Box w={'100%'} px={2} pb={2}>
          <HStack
            w={'100%'}
            border={'1px solid #81728C'}
            borderRadius={'12px'}
            borderColor={isMobileSearchFocused ? '#8143FF' : '#81728C'}
            boxSizing={'border-box'}
            justifyContent={'space-between'}
          >
            <InputGroup
              startElement={
                <AssetIcon
                  src={SearchIcon}
                  alt="search"
                  boxSize={{
                    base: '20px',
                    md: '24px'
                  }}
                />
              }
              startElementProps={{
                pl: '9px'
              }}
            >
              <Input
                placeholder="Search for a token or contract address"
                px={2}
                border={'none'}
                fontSize={'12px'}
                h={'38px'}
                _placeholder={{
                  color: '#B5B5B5'
                }}
                _focusVisible={{
                  outlineWidth: '0px'
                }}
                onFocus={() => setIsMobileSearchFocused(true)}
                onBlur={() => setIsMobileSearchFocused(false)}
                value={searchTokensValue}
                onChange={(e) => handleSearchTokens(e.target.value)}
                {...widgetStyles.tokenModalSearchInput}
              />
            </InputGroup>
            {!hideChainSelector && (
              <HStack
                gap={1}
                cursor={'pointer'}
                onClick={() => setIsMobileChainsOpen(true)}
                pr={1}
              >
                {isSelectAll ? (
                  <AllChainsIcon />
                ) : (
                  <Box w={'24px'} h={'24px'}>
                    <Image
                      src={selectedChainInfo?.chain_icon}
                      alt={selectedChainInfo?.name}
                      width={'100%'}
                      height={'100%'}
                      borderRadius={'50%'}
                      objectFit={'cover'}
                    />
                  </Box>
                )}
                <AssetIcon src={ArrowDownIcon} alt="open chains" boxSize={'16px'} />
              </HStack>
            )}
          </HStack>
        </Box>
      )}
      {isMobileChainsOpen && !hideChainSelector ? (
        <VStack
          w={'100%'}
          h={'100%'}
          align={'start'}
          gap={0}
          {...widgetStyles.tokenModalChainPanel}
        >
          <SearchInput
            placeholder="Search chains"
            value={searchChainsValue}
            onChange={(value) => handleSearchChains(value)}
          />

          {/* chains list */}
          <Box
            flex={1}
            overflowY={'auto'}
            w={'100%'}
            overscrollBehavior={'contain'}
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
                  handleSelectAll()
                  setIsMobileChainsOpen(false)
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
                {isSelectAll && (
                  <AssetIcon
                    src={ArrowFillRightIcon}
                    alt="selected"
                    boxSize={'16px'}
                  />
                )}
              </HStack>
            )}
            <Text
              px={2}
              color={'#81728C'}
              variant={'content7'}
              my={2}
              {...widgetStyles.tokenModalSectionLabelText}
            >
              Popular
            </Text>
            <VStack w={'100%'} align={'start'} gap={0}>
              {popularChains?.map((chain) => (
                <Network
                  key={chain.chain_id + 'popular-chains'}
                  chainId={chain.chain_id}
                  isPopular={true}
                  isSelectingFromToken={isSelectingFromToken}
                  onClick={() => {
                    handleSelectChains(chain.chain_id, chain.platform_id || 0)
                    setIsMobileChainsOpen(false)
                  }}
                  isPredictionChain={false}
                  isSelected={
                    selectedPlatform
                      ? selectedPlatform === chain.platform_id
                      : selectedChain === chain.chain_id
                  }
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
                  isSelectingFromToken={isSelectingFromToken}
                  onClick={() => {
                    handleSelectChains(chain.chain_id, chain.platform_id || 0)
                    setIsMobileChainsOpen(false)
                  }}
                  isPredictionChain={chain?.platform_id != null ? true : false}
                  disableArcTestnetLimit={disableArcTestnetLimit}
                  setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                />
              ))}
            </VStack>
            <Text
              px={2}
              color={'#81728C'}
              variant={'content7'}
              my={2}
              {...widgetStyles.tokenModalSectionLabelText}
            >
              Chains (A-Z)
            </Text>
            <VStack w={'100%'} align={'start'} gap={0}>
              {orderedChains
                ?.filter((chain) => chain.is_testnet !== true)
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
                    isSelectingFromToken={isSelectingFromToken}
                    onClick={() => {
                      handleSelectChains(chain.chain_id, chain.platform_id || 0)
                      setIsMobileChainsOpen(false)
                    }}
                    disableArcTestnetLimit={disableArcTestnetLimit}
                    setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                  />
                ))}
            </VStack>
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
                    onClick={() => {
                      handleSelectChains(chain.chain_id, chain.platform_id || 0)
                      setIsMobileChainsOpen(false)
                    }}
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
                  onClick={() => {
                    handleSelectChains(chain.chain_id, chain.platform_id || 0)
                    setIsMobileChainsOpen(false)
                  }}
                  isSelectingFromToken={isSelectingFromToken}
                  isPredictionChain={false}
                  disableArcTestnetLimit={disableArcTestnetLimit}
                  setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                />
              ))}
          </Box>
        </VStack>
      ) : (
        // tokens list
        <Box
          flex={1}
          overflowY={'auto'}
          w={'100%'}
          {...widgetStyles.tokenModalTokenPanel}
        >
          {/* <Text px={2} color={'#81728C'} variant={'content7'} my={2}>
            Suggested tokens
          </Text> */}
          <TokenList
            isLoading={isLoading}
            isSelectAll={isSelectAll}
            userBalances={userBalances}
            searchTokensInfo={searchTokensInfo}
            tokens={tokens}
            onSelectToken={onSelectToken}
            chainId={chainId}
            resetSearch={resetSearch}
            searchTokensValue={searchTokensValue}
            isSelectingFromToken={isSelectingFromToken}
          />
        </Box>
      )}
      {/* for mobile close chains list */}
      {isMobileChainsOpen && !hideChainSelector && (
        <AssetIcon
          src={BackIcon}
          alt="back"
          pos={'absolute'}
          boxSize={'24px'}
          left={4}
          top={3.5}
          cursor={'pointer'}
          onClick={() => {
            setIsMobileChainsOpen(false)
            if (userBalances && userBalances.length > 0) {
              handleSelectAll()
            }
          }}
        />
      )}
    </VStack>
  )
}, arePropsEqual)
