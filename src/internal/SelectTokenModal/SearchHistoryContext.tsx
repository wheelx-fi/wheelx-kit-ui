import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react'
import { useAccount } from 'wagmi'
import { isLocalStorageSupported } from './storageUtils'
import { Tag } from '../api/useChainsAndTokens'

export interface TokenSearchHistoryItem {
  chain_id: number
  address: `0x${string}`
  symbol: string
  decimals: number
  logo: string
  name: string
  timestamp?: number
  tags: Tag[]
  categories?: string[]
}

interface TokenSearchHistoryContextType {
  searchHistory: TokenSearchHistoryItem[]
  addSearchHistory: (
    chainId: number,
    tokenAddress: `0x${string}`,
    symbol: string,
    decimals: number,
    logo: string,
    name: string,
    tags: Tag[]
  ) => void
  removeSearchHistory: (chainId: number, tokenAddress: string) => void
  isSearchHistory: (chainId: number, tokenAddress: string) => boolean
  clearSearchHistory: () => void
  isLoading: boolean
  walletAddress: string | undefined
  storageError: string | null
}

const TokenSearchHistoryContext = createContext<TokenSearchHistoryContextType>({
  searchHistory: [],
  addSearchHistory: () => {},
  removeSearchHistory: () => {},
  isSearchHistory: () => false,
  clearSearchHistory: () => {},
  isLoading: true,
  walletAddress: undefined,
  storageError: null
})

interface TokenSearchHistoryProviderProps {
  children: ReactNode
}

export const TokenSearchHistoryProvider: React.FC<
  TokenSearchHistoryProviderProps
> = ({ children }) => {
  const { address, isConnected } = useAccount()
  const [searchHistory, setSearchHistory] = useState<TokenSearchHistoryItem[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)
  const [storageError, setStorageError] = useState<string | null>(null)

  const getStorageKey = useCallback((): string | null => {
    if (!address) return null
    return `web3-token-searchHistory-${address.toLowerCase()}`
  }, [address])

  useEffect(() => {
    const loadSearchHistory = async () => {
      if (!address) {
        setSearchHistory([])
        setIsLoading(false)
        return
      }

      try {
        const storageKey = getStorageKey()
        if (!storageKey) {
          setIsLoading(false)
          return
        }

        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsedSearchHistory = JSON.parse(
            stored
          ) as TokenSearchHistoryItem[]
          setSearchHistory(parsedSearchHistory)
        }
      } catch (error) {
        console.error('Failed to load searchHistory from localStorage:', error)
        setSearchHistory([])
      } finally {
        setIsLoading(false)
      }
    }

    loadSearchHistory()
  }, [address, getStorageKey])

  const saveSearchHistory = (newSearchHistory: TokenSearchHistoryItem[]) => {
    if (typeof window === 'undefined') return

    if (!isLocalStorageSupported()) {
      setStorageError('you browser can not using local storage')
      return
    }

    const storageKey = getStorageKey()
    if (!storageKey) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(newSearchHistory))
      setSearchHistory(newSearchHistory)
    } catch (error) {
      console.error('Failed to save searchHistory to localStorage:', error)
    }
  }

  const addSearchHistory = (
    chainId: number,
    tokenAddress: `0x${string}`,
    symbol: string,
    decimals: number,
    logo: string,
    name: string,
    tags: Tag[]
  ) => {
    if (!isConnected || !address) {
      console.warn('Cannot add favorite: No wallet connected')
      return
    }
    const existingIndex = searchHistory.findIndex(
      (fav) => fav.chain_id === chainId && fav.address === tokenAddress
    )

    if (existingIndex === -1) {
      const newSearchHistory: TokenSearchHistoryItem = {
        chain_id: chainId,
        address: tokenAddress,
        symbol,
        decimals,
        logo,
        name,
        tags: tags,
        timestamp: Date.now()
      }
      const updatedSearchHistory = [...searchHistory, newSearchHistory]
      saveSearchHistory(updatedSearchHistory)
    }
  }

  const removeSearchHistory = (chainId: number, tokenAddress: string) => {
    if (!isConnected || !address) {
      console.warn('Cannot remove favorite: No wallet connected')
      return
    }

    // const updatedSearchHistory = searchHistory.filter(
    //   (fav) => !(fav.chainId === chainId && fav.tokenAddress === tokenAddress)
    // )
    // saveSearchHistory(updatedSearchHistory)
    setSearchHistory((prevSearchHistory) => {
      const updatedSearchHistory = prevSearchHistory.filter(
        (fav) => !(fav.chain_id === chainId && fav.address === tokenAddress)
      )
      saveSearchHistory(updatedSearchHistory)
      return updatedSearchHistory
    })
  }

  const isSearchHistory = (chainId: number, tokenAddress: string): boolean => {
    return searchHistory.some(
      (fav) => fav.chain_id === chainId && fav.address === tokenAddress
    )
  }

  const clearSearchHistory = () => {
    if (!isConnected || !address) return

    const storageKey = getStorageKey()
    if (!storageKey) return

    try {
      localStorage.removeItem(storageKey)
      setSearchHistory([])
    } catch (error) {
      console.error('Failed to clear searchHistory:', error)
    }
  }

  const contextValue: TokenSearchHistoryContextType = {
    searchHistory,
    addSearchHistory,
    removeSearchHistory,
    isSearchHistory,
    clearSearchHistory,
    isLoading,
    storageError,
    walletAddress: address
  }

  return (
    <TokenSearchHistoryContext.Provider value={contextValue}>
      {children}
    </TokenSearchHistoryContext.Provider>
  )
}

export const useTokenSearchHistoryContext = () => {
  const context = useContext(TokenSearchHistoryContext)
  if (context === undefined) {
    throw new Error(
      'useSearchHistoryContext must be used within a token SearchHistoryProvider'
    )
  }
  return context
}
