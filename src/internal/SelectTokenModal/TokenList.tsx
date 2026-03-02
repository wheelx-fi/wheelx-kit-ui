import { HStack, Icon, Spinner, VStack, Image } from '@chakra-ui/react'
import { TokenAndAddress } from './TokenAndAddress'
import { TokenInfo, TokenInfoWithBalance, TokenBalance } from '../api'
import { Text } from '../ui'
// import { use, useMemo } from 'react'
import {
  filterTokenByType,
  filterTokenUnType,
  getOrderedTokensAssets
} from './utils'
import { useEffect, useMemo, useState } from 'react'
import { useTokenFavoritesContext } from './TokenFavoritesContext'
import { useTokenSearchHistoryContext } from './SearchHistoryContext'

import AllIcon from '../assets/icons/all2.svg'
import StablecoinIcon from '../assets/icons/stab.svg'
import StockIcon from '../assets/icons/stock.svg'
import LikedIcon from '../assets/icons/liked.svg'
import SearchIcon from '../assets/icons/search-history.svg'
import AIIcon from '../assets/icons/ai.svg'
import { useAccount } from 'wagmi'
import { useChainsStore } from '../stores'
import noDataImage from '../assets/images/no_data.png'
import { getAssetSrc } from '../utils/getAssetSrc'
import { useWheelxWidgetStyles } from '../../config'

const deduplicateByAddressAndChainId = (tokens: TokenInfo[]): TokenInfo[] => {
  const addressMap = new Map<string, TokenInfo>()
  return tokens.filter((token) => {
    const key = `${token.address}-${token.chain_id.toString()}`
    if (addressMap.has(key)) {
      return false
    }
    addressMap.set(key, token)
    return true
  })
}

const tabList = [
  {
    name: 'All',
    type: 'all',
    icon: AllIcon
  },
  {
    name: 'AI',
    type: 'ai',
    icon: AIIcon
  },
  {
    name: 'Stablecoin',
    type: 'stablecoin',
    icon: StablecoinIcon
  },
  {
    name: 'Stock',
    type: 'stock',
    icon: StockIcon
  },
  {
    name: 'Liked',
    type: 'liked',
    icon: LikedIcon
  },
  {
    name: 'Searched',
    type: 'history',
    icon: SearchIcon
  }
]

interface Props {
  isLoading: boolean
  isSelectAll: boolean
  userBalances?: TokenBalance[]
  tokens?: TokenInfo[]
  searchTokensInfo?: TokenInfoWithBalance[]
  onSelectToken: (tokenInfo: TokenInfo) => void
  chainId?: number | null
  resetSearch: () => void
  searchTokensValue: string
  isSelectingFromToken: boolean
}

export const TokenList = ({
  isLoading,
  isSelectAll,
  userBalances,
  tokens,
  searchTokensInfo,
  onSelectToken,
  chainId,
  resetSearch,
  searchTokensValue,
  isSelectingFromToken
}: Props) => {
  const widgetStyles = useWheelxWidgetStyles()
  const categoryTabStyles = widgetStyles.tokenModalCategoryTab || {}
  const categoryTabActiveStyles = widgetStyles.tokenModalCategoryTabActive || {}
  const userTokens = useMemo(() => {
    return userBalances?.map((balance) => {
      return {
        ...balance.token,
        balance: balance.balance,
        usdPrice: balance.price
      }
    })
  }, [userBalances])

  const { favorites } = useTokenFavoritesContext()
  const { searchHistory } = useTokenSearchHistoryContext()
  const [currentTab, setCurrentTab] = useState('all')
  const [showTab, setShowTab] = useState(false)
  // const [showStablecoin, setShowStablecoin] = useState(false)
  // const [showStock, setShowStock] = useState(false)
  const { address } = useAccount()
  const { isSelectPredictionChain } = useChainsStore()

  const currentChainFavTokens = useMemo(() => {
    if (currentTab !== 'liked') {
      return []
    }
    return favorites?.filter((fav) => fav.chain_id === chainId)
  }, [currentTab, favorites, chainId])

  useEffect(() => {
    setCurrentTab('all')
  }, [chainId])

  useEffect(() => {
    if (!searchTokensValue) {
      setCurrentTab('all')
    }
  }, [searchTokensValue])

  const currentChainSearchHistory = useMemo(() => {
    if (currentTab !== 'history') {
      return []
    }
    return searchHistory?.filter((fav) => fav.chain_id === chainId)
  }, [currentTab, searchHistory, chainId])
  const currentTokens = useMemo(() => {
    if (
      currentTab === 'stock' ||
      currentTab === 'stablecoin' ||
      currentTab === 'ai'
    ) {
      return filterTokenByType(tokens || [], currentTab)
    }
    return []
  }, [currentTab, tokens])

  const AllTokens = useMemo(() => {
    if (currentTab !== 'all') {
      return []
    }
    return filterTokenUnType(tokens || [], 'stock')
  }, [currentTab, tokens])

  const isHasStablecoin = useMemo(() => {
    const findToken = tokens?.find((token) =>
      token.categories?.includes('stablecoin')
    )
    if (findToken) {
      return true
    }
    return false
  }, [tokens])
  const isHasStock = useMemo(() => {
    const findToken = tokens?.find((token) =>
      token.categories?.includes('stock')
    )
    if (findToken) {
      return true
    }
    return false
  }, [tokens])

  const isHasAI = useMemo(() => {
    const findToken = tokens?.find((token) => token.categories?.includes('ai'))
    if (findToken) {
      return true
    }
    return false
  }, [tokens])

  // console.log('#### tokens ######:', tokens)

  const render = () => {
    if (isLoading) {
      return (
        <HStack w={'100%'} h={'50px'} justify={'center'} align={'center'}>
          <Spinner />
        </HStack>
      )
    }

    if (searchTokensInfo) {
      if (searchTokensInfo.length > 0) {
        if (isSelectAll) {
          return searchTokensInfo.map((token, index) => {
            if (token.balance) {
              return (
                <TokenAndAddress
                  key={`${token.chain_id}-${token.address}-${index}`}
                  tokenInfo={token}
                  isSelectAll={isSelectAll}
                  onSelectToken={onSelectToken}
                  isSelectingFromToken={isSelectingFromToken}
                />
              )
            }
          })
        } else {
          return searchTokensInfo.map((token, index) => {
            return (
              <TokenAndAddress
                key={`${token.chain_id}-${token.address}-${index}`}
                tokenInfo={token}
                isSelectAll={isSelectAll}
                onSelectToken={onSelectToken}
                isSearchResult={true}
                isSelectingFromToken={isSelectingFromToken}
              />
            )
          })
        }
      } else {
        return (
          <HStack w={'100%'} h={'50px'} justify={'center'} align={'center'}>
            <Text
              color={'#81728C'}
              variant={{
                base: 'content8',
                md: 'content7'
              }}
              {...widgetStyles.tokenModalTokenSecondaryText}
            >
              No results
            </Text>
          </HStack>
        )
      }
    }

    if (isSelectAll) {
      return getOrderedTokensAssets(userTokens)?.map((token, index) => {
        return (
          <TokenAndAddress
            key={`${token.chain_id}-${token.address}-${index}`}
            tokenInfo={token}
            isSelectAll={isSelectAll}
            onSelectToken={onSelectToken}
            isSelectingFromToken={isSelectingFromToken}
          />
        )
      })
    } else {
      let newTokens = AllTokens
      if (currentTab === 'liked') {
        newTokens = currentChainFavTokens
      } else if (currentTab === 'history') {
        newTokens = currentChainSearchHistory
      } else if (
        currentTab === 'stablecoin' ||
        currentTab === 'stock' ||
        currentTab === 'ai'
      ) {
        newTokens = currentTokens
      }
      if (newTokens.length === 0) {
        return (
          <VStack
            height={'300px'}
            justifyContent={'center'}
            gap={4}
            alignItems={'center'}
            background={'#fff'}
            borderRadius={'20px'}
            w={'100%'}
          >
            <Image src={getAssetSrc(noDataImage)} alt="no data" w={'120px'}></Image>
          </VStack>
        )
      }
      return deduplicateByAddressAndChainId(newTokens)?.map((token, index) => (
        <TokenAndAddress
          key={`${token.chain_id}-${token.address}-${index}`}
          tokenInfo={token}
          isSelectAll={isSelectAll}
          onSelectToken={onSelectToken}
          isSelectingFromToken={isSelectingFromToken}
        />
      ))
    }
  }

  const renderTab = () => {
    if (!showTab) {
      return null
    }
    return (
      <HStack w={'100%'} p={2} overflowX={'auto'} overflowY={'hidden'}>
        {tabList.map((item, index) => {
          if (!address) {
            if (item.type === 'liked' || item.type === 'history') {
              return null
            }
          }
          if (item.type === 'stablecoin' && !isHasStablecoin) {
            return null
          }
          if (item.type === 'stock' && !isHasStock) {
            return null
          }
          if (item.type === 'ai' && !isHasAI) {
            return null
          }

          return (
            <HStack
              key={index}
              onClick={() => {
                setCurrentTab(item.type)
                resetSearch()
              }}
              color={currentTab === item.type ? '#8143FF' : '#6C6C6C'}
              backgroundColor={currentTab === item.type ? '#E3E4FC' : '#F5F6FF'}
              h={'26px'}
              padding={'0 9px'}
              borderRadius={'5px'}
              fontSize={'12px'}
              cursor={'pointer'}
              {...categoryTabStyles}
              {...(currentTab === item.type ? categoryTabActiveStyles : {})}
            >
              <Icon as={item.icon} boxSize={'14px'} />
              <Text {...widgetStyles.tokenModalCategoryTabText}>
                {item.name}
              </Text>
            </HStack>
          )
        })}
      </HStack>
    )
  }

  useEffect(() => {
    if (!isSelectAll) {
      if (!address) {
        if (!isHasStock && !isHasStablecoin && !isHasAI) {
          setShowTab(false)
        } else {
          setShowTab(true)
        }
      } else {
        setShowTab(true)
      }
    } else {
      setShowTab(false)
    }
    if (isSelectPredictionChain) {
      setShowTab(false)
    }
  }, [address, isSelectAll, isHasStablecoin, isHasStock, tokens])

  // useEffect(() => {
  //   if (isHasStablecoin) {
  //     setShowStablecoin(true)
  //   } else {
  //     setShowStablecoin(false)
  //   }
  // }, [isHasStablecoin])
  // useEffect(() => {
  //   if (isHasStock) {
  //     setShowStock(true)
  //   } else {
  //     setShowStock(false)
  //   }
  // }, [isHasStock])

  useEffect(() => {
    if (searchTokensInfo) {
      setCurrentTab('')
    }
  }, [searchTokensInfo])

  return (
    <VStack gap={0} w={'100%'} h={'100%'}>
      {renderTab()}
      <VStack
        gap={0}
        w={'100%'}
        flex={1}
        h={0}
        overflowX={'hidden'}
        overflowY={'auto'}
      >
        {render()}
      </VStack>
    </VStack>
  )
}
