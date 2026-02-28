import { Dialog, Portal, VStack } from '@chakra-ui/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import {
  // ChainInfo,
  TokenInfo,
  useChainsAndTokens,
  useTokenBalance
} from '../api'

import { Heading } from '../ui'
import BackIcon from '../assets/icons/back.svg'

import {
  useChainsAndTokensForSelect,
  useUserHasSelectedFromNetwork,
  useSearchTokens
} from './hooks'
import CloseIcon from '../assets/icons/close.svg'
import { MobileContent } from './MobileContent'
import { DesktopContent } from './DesktopContent'
import { useAccount } from 'wagmi'
import { useSwapAndBridgeContextStore } from '../SwapAndBridge/hooks'
import { useDifferentAddressStore } from '../stores/useDifferentAddressStore'
import { useFavoritesContext } from './FavoritesContext'
import { processChains } from './utils'
import { ArcTestnetChainId } from '../consts'
import {
  useWheelxWidgetConfig,
  useWheelxWidgetStyles
} from '../../config'
import { AssetIcon } from '../ui/AssetIcon'

interface SelectTokenModalProps {
  isOpen: boolean
  isSelectingFromToken: boolean
  onClose: () => void
  onSelectToken: (tokenInfo: TokenInfo) => void
}

const SelectTokenModal = ({
  isOpen,
  isSelectingFromToken,
  onClose,
  onSelectToken
}: SelectTokenModalProps) => {
  const { mode, getAllowedChainIds, getAllowedTokens, isTokenAllowed } =
    useWheelxWidgetConfig()
  const widgetStyles = useWheelxWidgetStyles()
  const { address } = useAccount()
  const { fromTokenInfo, toTokenInfo, isShortLink, shortLink } =
    useSwapAndBridgeContextStore()
  const fromChainId = fromTokenInfo?.chain_id
  const toChainId = toTokenInfo?.chain_id
  const toChainPlatformId = toTokenInfo?.platform_id || 0
  const { differentAddress } = useDifferentAddressStore()

  const { data, isLoading: isLoadingChains } = useChainsAndTokens()
  // const chains = data?.chains

  const isArcTestnetShortLink = useMemo(() => {
    return isShortLink && shortLink?.toLowerCase() === '/arctestnet'
  }, [isShortLink, shortLink])
  const allowedChainIds = useMemo(
    () =>
      isSelectingFromToken ? getAllowedChainIds('from') : getAllowedChainIds('to'),
    [getAllowedChainIds, isSelectingFromToken]
  )
  const allowedTokens = useMemo(
    () =>
      isSelectingFromToken ? getAllowedTokens('from') : getAllowedTokens('to'),
    [getAllowedTokens, isSelectingFromToken]
  )
  const hideChainSelector = mode === 'swap'
  const hasChainRestriction = !!allowedChainIds

  const {
    data: userBalances,
    isLoading: isLoadingUserBalances,
    refetch: refetchUserBalances
  } = useTokenBalance(address)

  const { data: userDifferentAddressBalances } =
    useTokenBalance(differentAddress)

  // when modal is open, refetch user balances
  useEffect(() => {
    if (isOpen && address) {
      refetchUserBalances()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const [isSelectAll, setIsSelectAll] = useState(false)
  const [selectedChain, setSelectedChain] = useState<number | null>(null)
  const [selectedChainByPlatformId, setSelectedChainByPlatformId] = useState<
    number | null
  >(null)

  const {
    popularChains,
    orderedChains,
    searchChains,
    tokens,
    searchChainsValue,
    searchTokensValue,
    handleSearchChains,
    handleSearchTokens,
    resetSearch,
    allChains
  } = useChainsAndTokensForSelect({
    data,
    selectedChain,
    userBalances:
      isSelectingFromToken === false && differentAddress
        ? userDifferentAddressBalances
        : userBalances,
    selectedChainByPlatformId
  })
  const { favorites } = useFavoritesContext()

  const allApiTokens = useMemo(
    () => [
      ...(data?.tokens || []),
      ...(data?.deposit_platforms?.prediction?.tokens || [])
    ],
    [data]
  )

  const availableAllowedTokenChainIds = useMemo(() => {
    if (!allowedTokens?.length) return null
    const chainIds = new Set<number>()
    allApiTokens.forEach((token) => {
      if (
        isTokenAllowed(
          isSelectingFromToken ? 'from' : 'to',
          token.chain_id,
          token.address
        )
      ) {
        chainIds.add(token.chain_id)
      }
    })
    return chainIds
  }, [allApiTokens, allowedTokens, isSelectingFromToken, isTokenAllowed])

  const { searchTokensInfo, isLoadingSearchTokenInfo } = useSearchTokens({
    searchTokensValue,
    selectedChain,
    allTokens: tokens
  })

  const { userHasSelectedFromNetwork, setUserHasSelectedFromNetwork } =
    useUserHasSelectedFromNetwork()

  const [disableArcTestnetLimit, setDisableArcTestnetLimit] = useState(false)

  const [tempSelectAll, setTempSelectAll] = useState(false)
  const [tempSelectedChain, setTempSelectedChain] = useState<number | null>(
    null
  )
  const [tempSelectedPlatformId, setTempSelectedPlatformId] = useState<
    number | null
  >(null)

  useEffect(() => {
    if (isOpen) {
      if (hideChainSelector) {
        setIsSelectAll(false)
        if (isSelectingFromToken) {
          setSelectedChain(fromChainId)
          setSelectedChainByPlatformId(null)
        } else {
          setSelectedChain(toChainId)
          setSelectedChainByPlatformId(toChainPlatformId || null)
        }
        return
      }

      if (hasChainRestriction) {
        const currentChainId = isSelectingFromToken ? fromChainId : toChainId
        const nextChainId =
          currentChainId && allowedChainIds?.includes(currentChainId)
            ? currentChainId
            : (allowedChainIds?.[0] ?? null)

        setIsSelectAll(false)
        setSelectedChain(nextChainId)
        setSelectedChainByPlatformId(isSelectingFromToken ? null : toChainPlatformId)
        return
      }

      if (isSelectingFromToken) {
        setDisableArcTestnetLimit(toChainId !== ArcTestnetChainId)
      } else {
        setDisableArcTestnetLimit(fromChainId !== ArcTestnetChainId)
      }
      if (tempSelectAll) {
        const shouldRestoreArcTestnet = isSelectingFromToken
          ? toChainId === ArcTestnetChainId
          : fromChainId === ArcTestnetChainId

        if (shouldRestoreArcTestnet && tempSelectedChain !== null) {
          setIsSelectAll(false)
          setSelectedChain(tempSelectedChain)
          if (tempSelectedPlatformId !== null) {
            setSelectedChainByPlatformId(tempSelectedPlatformId)
          }
          setTempSelectAll(false)
          setTempSelectedChain(null)
          setTempSelectedPlatformId(null)
        }
      }

      if (isSelectingFromToken) {
        if (isLoadingUserBalances) return
        if (isArcTestnetShortLink) {
          setIsSelectAll(false)
          setSelectedChain(ArcTestnetChainId)
        } else if (
          userBalances &&
          userBalances.length > 0 &&
          !userHasSelectedFromNetwork &&
          !tempSelectAll
        ) {
          setIsSelectAll(true)
          setSelectedChain(null)
        } else {
          setIsSelectAll(false)
          setSelectedChain(fromChainId)
        }
      } else {
        setIsSelectAll(false)
        setSelectedChain(toChainId)
        setSelectedChainByPlatformId(toChainPlatformId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    fromChainId,
    toChainId,
    toChainPlatformId,
    isSelectingFromToken,
    isLoadingUserBalances,
    hideChainSelector,
    hasChainRestriction,
    allowedChainIds
  ])

  const { favoriteChains, nonFavoriteChains } = useMemo(() => {
    return processChains(favorites, orderedChains || [])
  }, [favorites, orderedChains])

  function filterChainsByConfig<T extends { chain_id: number }>(items?: T[]) {
    if (!items) return items
    return items.filter((item) => {
      const passChain =
        !allowedChainIds || allowedChainIds.includes(item.chain_id)
      const passTokenChain =
        !availableAllowedTokenChainIds ||
        availableAllowedTokenChainIds.has(item.chain_id)
      return passChain && passTokenChain
    })
  }

  function filterTokensByConfig<
    T extends { chain_id: number; address?: string | null }
  >(items?: T[]) {
    if (!items) return items
    return items.filter((item) => {
      const passChain =
        !allowedChainIds || allowedChainIds.includes(item.chain_id)
      const passToken =
        !allowedTokens?.length ||
        isTokenAllowed(
          isSelectingFromToken ? 'from' : 'to',
          item.chain_id,
          item.address ?? null
        )
      return passChain && passToken
    })
  }

  const normalChains = useMemo(() => {
    return filterChainsByConfig(nonFavoriteChains)?.filter(
      (item) => !item.hasOwnProperty('platform_id')
    )
  }, [allowedChainIds, availableAllowedTokenChainIds, nonFavoriteChains])

  const predictionChains = useMemo(() => {
    return filterChainsByConfig(nonFavoriteChains)?.filter((item) =>
      item.hasOwnProperty('platform_id')
    )
  }, [allowedChainIds, availableAllowedTokenChainIds, nonFavoriteChains])

  const filteredPopularChains = useMemo(
    () => filterChainsByConfig(popularChains),
    [allowedChainIds, availableAllowedTokenChainIds, popularChains]
  )
  const filteredSearchChains = useMemo(
    () => filterChainsByConfig(searchChains),
    [allowedChainIds, availableAllowedTokenChainIds, searchChains]
  )
  const filteredFavoriteChains = useMemo(
    () => filterChainsByConfig(favoriteChains),
    [allowedChainIds, availableAllowedTokenChainIds, favoriteChains]
  )
  const filteredTokens = useMemo(
    () => filterTokensByConfig(tokens),
    [allowedChainIds, allowedTokens, isSelectingFromToken, isTokenAllowed, tokens]
  )
  const filteredSearchTokensInfo = useMemo(
    () => filterTokensByConfig(searchTokensInfo),
    [
      allowedChainIds,
      allowedTokens,
      isSelectingFromToken,
      isTokenAllowed,
      searchTokensInfo
    ]
  )
  const filteredAllChains = useMemo(
    () => filterChainsByConfig(allChains),
    [allChains, allowedChainIds, availableAllowedTokenChainIds]
  )

  const handleSelectChains = useCallback(
    (chainId: number, platformId: number | undefined) => {
      if (allowedChainIds && !allowedChainIds.includes(chainId)) return
      if (isSelectingFromToken) {
        setUserHasSelectedFromNetwork(true)
      }
      setIsSelectAll(false)
      setSelectedChain(chainId)
      setSelectedChainByPlatformId(platformId || null)
    },
    [allowedChainIds, isSelectingFromToken, setUserHasSelectedFromNetwork]
  )

  const handleSelectAll = useCallback(() => {
    if (hideChainSelector || hasChainRestriction) return
    setTempSelectedChain(selectedChain)
    setTempSelectedPlatformId(selectedChainByPlatformId)
    setTempSelectAll(true)

    setUserHasSelectedFromNetwork(false)
    setIsSelectAll(true)
    setSelectedChain(null)
  }, [
    hasChainRestriction,
    hideChainSelector,
    setUserHasSelectedFromNetwork,
    selectedChain,
    selectedChainByPlatformId
  ])

  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => {
      resetSearch()
      setIsMobileChainsOpen(false)
    }, 100)
  }, [onClose, resetSearch])

  const _onSelectToken = useCallback(
    (tokenInfo: TokenInfo) => {
      setTempSelectAll(false)
      setTempSelectedChain(null)
      setTempSelectedPlatformId(null)

      onSelectToken(tokenInfo)
      handleClose()
    },
    [handleClose, onSelectToken]
  )

  // mobile search
  const [isMobileChainsOpen, setIsMobileChainsOpen] = useState(false)

  const selectedChainInfo = filteredAllChains?.find((chain) => {
    if (selectedChainByPlatformId) {
      return chain.platform_id === selectedChainByPlatformId
    } else {
      return chain.chain_id === selectedChain
    }
  })

  // console.log('selectedChainInfo', selectedChainInfo)

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={handleClose}
      placement={'center'}
      trapFocus={false}
      scrollBehavior="outside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner px={4}>
          <Dialog.Content
            pos={'relative'}
            p={{
              base: 2,
              md: 4
            }}
            maxW={{
              base: '430px',
              md: '700px'
            }}
            borderRadius={'24px'}
            boxShadow={'0px 12px 36px 0px #007B9D59'}
            h={'min(85vh, 756px)'}
            bg={'white'}
            {...widgetStyles.tokenModalContent}
          >
            <VStack
              gap={{
                base: 6
              }}
              w={'100%'}
              h={'100%'}
              alignItems={'center'}
            >
              <Dialog.Header justifyContent={'center'} p={0}>
                <Heading
                  variant={{
                    base: 'heading10',
                    md: 'heading8'
                  }}
                  mt={1.5}
                  {...widgetStyles.tokenModalTitleText}
                >
                  Select {isSelectingFromToken ? '"From"' : '"To"'}{' '}
                  {hideChainSelector ? 'token' : 'chain and token'}
                </Heading>
              </Dialog.Header>

              <Dialog.Body flex={1} w={'100%'} overflow={'hidden'} p={0}>
                {/* desktop */}
                <DesktopContent
                  isLoading={
                    isLoadingUserBalances ||
                    isLoadingChains ||
                    isLoadingSearchTokenInfo
                  }
                  searchChainsValue={searchChainsValue}
                  handleSearchChains={handleSearchChains}
                  isSelectAll={isSelectAll}
                  hideChainSelector={hideChainSelector}
                  disableSelectAll={hasChainRestriction}
                  selectedChain={selectedChain}
                  selectedPlatform={selectedChainByPlatformId || 0}
                  handleSelectAll={handleSelectAll}
                  handleSelectChains={handleSelectChains}
                  searchTokensValue={searchTokensValue}
                  handleSearchTokens={handleSearchTokens}
                  onSelectToken={_onSelectToken}
                  popularChains={filteredPopularChains}
                  orderedChains={normalChains}
                  favChains={filteredFavoriteChains}
                  orderedPredictionChains={predictionChains}
                  tokens={filteredTokens}
                  userBalances={userBalances}
                  searchChains={filteredSearchChains}
                  searchTokensInfo={filteredSearchTokensInfo}
                  isSelectingFromToken={isSelectingFromToken}
                  chainId={selectedChain}
                  resetSearch={resetSearch}
                  disableArcTestnetLimit={disableArcTestnetLimit}
                  setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                />

                {/* mobile */}
                <MobileContent
                  isLoading={
                    isLoadingUserBalances ||
                    isLoadingChains ||
                    isLoadingSearchTokenInfo
                  }
                  isSelectAll={isSelectAll}
                  hideChainSelector={hideChainSelector}
                  disableSelectAll={hasChainRestriction}
                  isMobileChainsOpen={isMobileChainsOpen}
                  searchTokensValue={searchTokensValue}
                  searchChainsValue={searchChainsValue}
                  handleSearchTokens={handleSearchTokens}
                  handleSearchChains={handleSearchChains}
                  handleSelectChains={handleSelectChains}
                  handleSelectAll={handleSelectAll}
                  setIsMobileChainsOpen={setIsMobileChainsOpen}
                  onSelectToken={_onSelectToken}
                  popularChains={filteredPopularChains}
                  orderedChains={normalChains}
                  favChains={filteredFavoriteChains}
                  tokens={filteredTokens}
                  selectedChainInfo={selectedChainInfo}
                  userBalances={userBalances}
                  searchTokensInfo={filteredSearchTokensInfo}
                  chainId={selectedChain}
                  selectedChain={selectedChain}
                  selectedPlatform={selectedChainByPlatformId || 0}
                  orderedPredictionChains={predictionChains}
                  resetSearch={resetSearch}
                  isSelectingFromToken={isSelectingFromToken}
                  disableArcTestnetLimit={disableArcTestnetLimit}
                  setDisableArcTestnetLimit={setDisableArcTestnetLimit}
                />
              </Dialog.Body>
            </VStack>

            <Dialog.CloseTrigger
              left={4}
              top={3.5}
              right={'auto'}
              color={'#81728C'}
              cursor={'pointer'}
              hideBelow={'md'}
            >
              <AssetIcon src={BackIcon} alt="back" boxSize={'40px'} />
            </Dialog.CloseTrigger>
            {/* do not use asChild, the ios 10 will not show the close icon */}
            <Dialog.CloseTrigger
              top={3}
              right={3}
              left={'auto'}
              cursor={'pointer'}
              hideFrom={'md'}
            >
              <AssetIcon src={CloseIcon} alt="close" boxSize={'24px'} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default memo(SelectTokenModal)
