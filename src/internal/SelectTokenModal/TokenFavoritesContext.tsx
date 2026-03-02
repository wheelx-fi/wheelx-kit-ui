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

export interface TokenFavoriteItem {
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

interface TokenFavoritesContextType {
  favorites: TokenFavoriteItem[]
  addFavorite: (
    chainId: number,
    tokenAddress: `0x${string}`,
    symbol: string,
    decimals: number,
    logo: string,
    name: string,
    tags: Tag[]
  ) => void
  removeFavorite: (chainId: number, tokenAddress: string) => void
  isFavorite: (chainId: number, tokenAddress: string) => boolean
  clearFavorites: () => void
  isLoading: boolean
  walletAddress: string | undefined
  storageError: string | null
}

const TokenFavoritesContext = createContext<TokenFavoritesContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  clearFavorites: () => {},
  isLoading: true,
  walletAddress: undefined,
  storageError: null
})

interface TokenFavoritesProviderProps {
  children: ReactNode
}

export const TokenFavoritesProvider: React.FC<TokenFavoritesProviderProps> = ({
  children
}) => {
  const { address, isConnected } = useAccount()
  const [favorites, setFavorites] = useState<TokenFavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [storageError, setStorageError] = useState<string | null>(null)

  const getStorageKey = useCallback((): string | null => {
    if (!address) return null
    return `web3-token-favorites-${address.toLowerCase()}`
  }, [address])

  useEffect(() => {
    const loadFavorites = async () => {
      if (!address) {
        setFavorites([])
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
          const parsedFavorites = JSON.parse(stored) as TokenFavoriteItem[]
          setFavorites(parsedFavorites)
        }
      } catch (error) {
        console.error('Failed to load favorites from localStorage:', error)
        setFavorites([])
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [address, getStorageKey])

  const saveFavorites = (newFavorites: TokenFavoriteItem[]) => {
    if (typeof window === 'undefined') return

    if (!isLocalStorageSupported()) {
      setStorageError('you browser can not using local storage')
      return
    }

    const storageKey = getStorageKey()
    if (!storageKey) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(newFavorites))
      setFavorites(newFavorites)
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error)
    }
  }

  const addFavorite = (
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
    const existingIndex = favorites.findIndex(
      (fav) => fav.chain_id === chainId && fav.address === tokenAddress
    )

    if (existingIndex === -1) {
      const newFavorite: TokenFavoriteItem = {
        chain_id: chainId,
        address: tokenAddress,
        symbol,
        decimals,
        logo,
        name,
        tags: tags,
        timestamp: Date.now()
      }
      const updatedFavorites = [...favorites, newFavorite]
      saveFavorites(updatedFavorites)
    }
  }

  const removeFavorite = (chainId: number, tokenAddress: string) => {
    if (!isConnected || !address) {
      console.warn('Cannot remove favorite: No wallet connected')
      return
    }

    // const updatedFavorites = favorites.filter(
    //   (fav) => !(fav.chainId === chainId && fav.tokenAddress === tokenAddress)
    // )
    // saveFavorites(updatedFavorites)
    setFavorites((prevFavorites) => {
      const updatedFavorites = prevFavorites.filter(
        (fav) => !(fav.chain_id === chainId && fav.address === tokenAddress)
      )
      saveFavorites(updatedFavorites)
      return updatedFavorites
    })
  }

  const isFavorite = (chainId: number, tokenAddress: string): boolean => {
    return favorites.some(
      (fav) => fav.chain_id === chainId && fav.address === tokenAddress
    )
  }

  const clearFavorites = () => {
    if (!isConnected || !address) return

    const storageKey = getStorageKey()
    if (!storageKey) return

    try {
      localStorage.removeItem(storageKey)
      setFavorites([])
    } catch (error) {
      console.error('Failed to clear favorites:', error)
    }
  }

  const contextValue: TokenFavoritesContextType = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    isLoading,
    storageError,
    walletAddress: address
  }

  return (
    <TokenFavoritesContext.Provider value={contextValue}>
      {children}
    </TokenFavoritesContext.Provider>
  )
}

export const useTokenFavoritesContext = () => {
  const context = useContext(TokenFavoritesContext)
  if (context === undefined) {
    throw new Error(
      'useFavoritesContext must be used within a token FavoritesProvider'
    )
  }
  return context
}
