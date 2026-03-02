import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react'
import { useAccount } from 'wagmi'

export interface FavoriteItem {
  networkId: number
  networkName?: string
  timestamp: number
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  addFavorite: (networkId: number, networkName?: string) => void
  removeFavorite: (networkId: number) => void
  isFavorite: (networkId: number) => boolean
  clearFavorites: () => void
  isLoading: boolean
  walletAddress: string | undefined
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  clearFavorites: () => {},
  isLoading: true,
  walletAddress: undefined
})

interface FavoritesProviderProps {
  children: ReactNode
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({
  children
}) => {
  const { address, isConnected } = useAccount()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getStorageKey = useCallback((): string | null => {
    if (!address) return null
    return `web3-favorites-${address.toLowerCase()}`
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
          const parsedFavorites = JSON.parse(stored) as FavoriteItem[]
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

  const saveFavorites = (newFavorites: FavoriteItem[]) => {
    if (typeof window === 'undefined') return

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
    networkId: number,
    networkName: string = 'Unknown Network'
  ) => {
    if (!isConnected || !address) {
      console.warn('Cannot add favorite: No wallet connected')
      return
    }

    const existingIndex = favorites.findIndex(
      (fav) => fav.networkId === networkId
    )

    if (existingIndex === -1) {
      const newFavorite: FavoriteItem = {
        networkId,
        networkName,
        timestamp: Date.now()
      }
      const updatedFavorites = [...favorites, newFavorite]
      // console.log('###### updatedFavorites ########:', updatedFavorites)
      saveFavorites(updatedFavorites)
    }
  }

  const removeFavorite = (networkId: number) => {
    if (!isConnected || !address) {
      console.warn('Cannot remove favorite: No wallet connected')
      return
    }

    const updatedFavorites = favorites.filter(
      (fav) => fav.networkId !== networkId
    )
    saveFavorites(updatedFavorites)
  }

  const isFavorite = (networkId: number): boolean => {
    return favorites.some((fav) => fav.networkId === networkId)
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

  const contextValue: FavoritesContextType = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    isLoading,
    walletAddress: address
  }

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error(
      'useFavoritesContext must be used within a FavoritesProvider'
    )
  }
  return context
}
