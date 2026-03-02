import { ChainInfo, TokenInfo, TokenInfoWithBalance } from '../api'
import { Fraction } from 'bi-fraction'
import { FavoriteItem } from './FavoritesContext'

export function getOrderedTokens(
  tokens?: TokenInfoWithBalance[],
  selectedChain?: number | null
) {
  return tokens
    ?.filter((token) => {
      if (!selectedChain) return true
      return token.chain_id === selectedChain
    })
    .sort((a, b) => {
      // pin tokens should be at the first
      const aIsPin = a.tags.includes('pin')
      const bIsPin = b.tags.includes('pin')
      if (aIsPin && !bIsPin) return -1
      if (!aIsPin && bIsPin) return 1

      //
      const aIsTop = a.tags.includes('top')
      const bIsTop = b.tags.includes('top')
      if (aIsTop && !bIsTop) return -1
      if (!aIsTop && bIsTop) return 1

      // no pin / top tokens, order by usd balance
      if (a.usdPrice && b.usdPrice && a.balance && b.balance) {
        if (a.balance === 'NaN' && b.balance !== 'NaN') {
          return -1
        }
        if (a.balance !== 'NaN' && b.balance === 'NaN') {
          return 1
        }
        if (a.balance === 'NaN' && b.balance === 'NaN') {
          return 0
        }
        const aBalance = new Fraction(a.usdPrice).mul(a.balance)
        const bBalance = new Fraction(b.usdPrice).mul(b.balance)
        if (aBalance.gt(bBalance)) return -1
        if (aBalance.lt(bBalance)) return 1
      }

      // if usd price is not available, order by balance amount
      if (a.balance && b.balance) {
        if (a.balance === 'NaN' && b.balance !== 'NaN') {
          return -1
        }
        if (a.balance !== 'NaN' && b.balance === 'NaN') {
          return 1
        }
        if (a.balance === 'NaN' && b.balance === 'NaN') {
          return 0
        }
        if (new Fraction(a.balance).gt(new Fraction(b.balance))) return -1
        if (new Fraction(a.balance).lt(new Fraction(b.balance))) return 1
      }

      if (a.balance && !b.balance) return -1
      if (!a.balance && b.balance) return 1

      const aIsDin = a.token_type === 'preset'
      const bIsDin = b.token_type === 'preset'

      if (aIsDin && !bIsDin) return -1
      if (!aIsDin && bIsDin) return 1

      return 0
    })
}

export function getOrderedTokensAssets(
  tokens?: TokenInfoWithBalance[],
  selectedChain?: number | null,
  propertyName?: string
) {
  // console.log('###### assets sort ##########')
  return tokens
    ?.filter((token) => {
      if (!selectedChain) return true
      if (propertyName === 'platform_id') {
        return token.platform_id === selectedChain
      }
      return token.chain_id === selectedChain
    })
    .sort((a, b) => {
      if (a.usdPrice === null && b.usdPrice === null) {
        if (a.balance && b.balance) {
          if (a.balance === 'NaN' && b.balance !== 'NaN') return -1
          if (a.balance !== 'NaN' && b.balance === 'NaN') return 1
          if (a.balance === 'NaN' && b.balance === 'NaN') return 0
          if (new Fraction(a.balance).gt(new Fraction(b.balance))) return -1
          if (new Fraction(a.balance).lt(new Fraction(b.balance))) return 1
        }
        if (a.balance && !b.balance) return -1
        if (!a.balance && b.balance) return 1
        return 0
      }

      if (a.usdPrice === null) return 1
      if (b.usdPrice === null) return -1
      // no pin / top tokens, order by usd balance
      if (a.usdPrice && b.usdPrice && a.balance && b.balance) {
        if (a.balance === 'NaN' && b.balance !== 'NaN') {
          return -1
        }
        if (a.balance !== 'NaN' && b.balance === 'NaN') {
          return 1
        }
        if (a.balance === 'NaN' && b.balance === 'NaN') {
          return 0
        }
        const aBalance = new Fraction(a.usdPrice).mul(a.balance)
        const bBalance = new Fraction(b.usdPrice).mul(b.balance)
        if (aBalance.gt(bBalance)) return -1
        if (aBalance.lt(bBalance)) return 1
      }

      // if usd price is not available, order by balance amount
      if (a.balance && b.balance) {
        if (a.balance === 'NaN' && b.balance !== 'NaN') {
          return -1
        }
        if (a.balance !== 'NaN' && b.balance === 'NaN') {
          return 1
        }
        if (a.balance === 'NaN' && b.balance === 'NaN') {
          return 0
        }
        if (new Fraction(a.balance).gt(new Fraction(b.balance))) return -1
        if (new Fraction(a.balance).lt(new Fraction(b.balance))) return 1
      }

      if (a.balance && !b.balance) return -1
      if (!a.balance && b.balance) return 1

      const firstCharA = a.name.toLowerCase()
      const firstCharB = b.name.toLowerCase()
      if (firstCharA < firstCharB) return -1
      if (firstCharA > firstCharB) return 1

      return 0
    })
}
export function getOrderedTokensChainNormal(
  tokens?: TokenInfoWithBalance[],
  selectedChain?: number | null,
  propertyName?: string
) {
  // console.log('###### chain normal sort ##########')
  return tokens
    ?.filter((token) => {
      if (!selectedChain) return true
      if (propertyName === 'platform_id') {
        return token.platform_id === selectedChain
      }
      return token.chain_id === selectedChain
    })
    .sort((a, b) => {
      // pin tokens should be at the first
      const aIsPin = a.tags.includes('pin')
      const bIsPin = b.tags.includes('pin')
      if (aIsPin && !bIsPin) return -1
      if (!aIsPin && bIsPin) return 1

      //
      const aIsTop = a.tags.includes('top')
      const bIsTop = b.tags.includes('top')

      if (aIsTop && !bIsTop) return -1
      if (!aIsTop && bIsTop) return 1

      // no pin / top tokens, order by usd balance
      if (a.usdPrice && b.usdPrice && a.balance && b.balance) {
        if (a.balance === 'NaN' && b.balance !== 'NaN') {
          return -1
        }
        if (a.balance !== 'NaN' && b.balance === 'NaN') {
          return 1
        }
        if (a.balance === 'NaN' && b.balance === 'NaN') {
          return 0
        }
        const aBalance = new Fraction(a.usdPrice).mul(a.balance)
        const bBalance = new Fraction(b.usdPrice).mul(b.balance)
        if (aBalance.gt(bBalance)) return -1
        if (aBalance.lt(bBalance)) return 1
      }

      // if usd price is not available, order by balance amount
      if (a.balance && b.balance) {
        if (a.balance === 'NaN' && b.balance !== 'NaN') {
          return -1
        }
        if (a.balance !== 'NaN' && b.balance === 'NaN') {
          return 1
        }
        if (a.balance === 'NaN' && b.balance === 'NaN') {
          return 0
        }
        if (new Fraction(a.balance).gt(new Fraction(b.balance))) return -1
        if (new Fraction(a.balance).lt(new Fraction(b.balance))) return 1
      }

      if (a.balance && !b.balance) return -1
      if (!a.balance && b.balance) return 1

      // const firstCharA = a.name.toLowerCase()
      // const firstCharB = b.name.toLowerCase()
      // if (firstCharA < firstCharB) return -1
      // if (firstCharA > firstCharB) return 1

      return 0
    })
}

export function getOrderedTokensChainSearch(
  tokens?: TokenInfoWithBalance[],
  selectedChain?: number | null
) {
  // console.log('###### chain search sort ##########')
  return tokens
    ?.filter((token) => {
      if (!selectedChain) return true
      return token.chain_id === selectedChain
    })
    .sort((a, b) => {
      // no pin / top tokens, order by usd balance
      if (a.usdPrice && b.usdPrice && a.balance && b.balance) {
        if (a.balance === 'NaN' && b.balance !== 'NaN') {
          return -1
        }
        if (a.balance !== 'NaN' && b.balance === 'NaN') {
          return 1
        }
        if (a.balance === 'NaN' && b.balance === 'NaN') {
          return 0
        }
        const aBalance = new Fraction(a.usdPrice).mul(a.balance)
        const bBalance = new Fraction(b.usdPrice).mul(b.balance)
        if (aBalance.gt(bBalance)) return -1
        if (aBalance.lt(bBalance)) return 1
      }

      // if usd price is not available, order by balance amount
      if (a.balance && b.balance) {
        if (a.balance === 'NaN' && b.balance !== 'NaN') {
          return -1
        }
        if (a.balance !== 'NaN' && b.balance === 'NaN') {
          return 1
        }
        if (a.balance === 'NaN' && b.balance === 'NaN') {
          return 0
        }
        if (new Fraction(a.balance).gt(new Fraction(b.balance))) return -1
        if (new Fraction(a.balance).lt(new Fraction(b.balance))) return 1
      }

      if (a.balance && !b.balance) return -1
      if (!a.balance && b.balance) return 1

      const aIsDin = a.token_type === 'preset'
      const bIsDin = b.token_type === 'preset'

      if (aIsDin && !bIsDin) return -1
      if (!aIsDin && bIsDin) return 1

      // const firstCharA = a.name.toLowerCase()
      // const firstCharB = b.name.toLowerCase()
      // if (firstCharA < firstCharB) return -1
      // if (firstCharA > firstCharB) return 1

      return 0
    })
}

export function processChains(
  favorites: FavoriteItem[],
  allNetworks: ChainInfo[]
) {
  const favoriteNetworkIds = new Set(favorites.map((fav) => fav.networkId))
  const favoriteChains = allNetworks.filter((network) =>
    favoriteNetworkIds.has(network.chain_id)
  )
  const nonFavoriteChains = allNetworks.filter(
    (network) => !favoriteNetworkIds.has(network.chain_id)
  )
  return { favoriteChains, nonFavoriteChains }
}

export function mergeAndDeduplicateChains(
  arr1: ChainInfo[],
  arr2: ChainInfo[]
): ChainInfo[] {
  const networkMap = new Map<number, ChainInfo>()
  const combinedArray = [...arr1, ...arr2]
  combinedArray.forEach((network) => {
    if (!networkMap.has(network.chain_id)) {
      networkMap.set(network.chain_id, network)
    }
  })
  return Array.from(networkMap.values())
}

export function mergeAndDeduplicate(arr1: TokenInfo[], arr2: TokenInfo[]) {
  const mergedArray = [...arr1, ...arr2]
  const map = new Map()

  for (const item of mergedArray) {
    const key = `${item.address}-${item.chain_id}`
    if (!map.has(key)) {
      map.set(key, item)
    } else {
      const existingItem = map.get(key)
      const existingHasPreset = existingItem.token_type === 'preset'
      const currentHasPreset = item.token_type === 'preset'
      if (existingHasPreset && !currentHasPreset) {
        continue
      } else if (!existingHasPreset && currentHasPreset) {
        map.set(key, item)
      } else {
        continue
      }
    }
  }

  return Array.from(map.values())
}

export function filterTokenByType(
  items: TokenInfo[],
  searchString: string
): TokenInfo[] {
  return items.filter((item) => item.categories?.includes(searchString))
}

export function filterTokenUnType(
  items: TokenInfo[],
  searchString: string
): TokenInfo[] {
  return items.filter((item) => !item.categories?.includes(searchString))
}

export function getOrderedTokensChainPrediction(
  tokens?: TokenInfoWithBalance[],
  selectedChain?: number | null
) {
  // console.log('###### chain normal sort ##########')
  return tokens
    ?.filter((token) => {
      if (!selectedChain) return true
      return token.platform_id === selectedChain
    })
    .sort((a, b) => {
      // pin tokens should be at the first
      const aIsPin = a.tags.includes('pin')
      const bIsPin = b.tags.includes('pin')
      if (aIsPin && !bIsPin) return -1
      if (!aIsPin && bIsPin) return 1

      //
      const aIsTop = a.tags.includes('top')
      const bIsTop = b.tags.includes('top')

      if (aIsTop && !bIsTop) return -1
      if (!aIsTop && bIsTop) return 1

      // no pin / top tokens, order by usd balance
      if (a.usdPrice && b.usdPrice && a.balance && b.balance) {
        if (a.balance === 'NaN' && b.balance !== 'NaN') {
          return -1
        }
        if (a.balance !== 'NaN' && b.balance === 'NaN') {
          return 1
        }
        if (a.balance === 'NaN' && b.balance === 'NaN') {
          return 0
        }
        const aBalance = new Fraction(a.usdPrice).mul(a.balance)
        const bBalance = new Fraction(b.usdPrice).mul(b.balance)
        if (aBalance.gt(bBalance)) return -1
        if (aBalance.lt(bBalance)) return 1
      }

      // if usd price is not available, order by balance amount
      if (a.balance && b.balance) {
        if (a.balance === 'NaN' && b.balance !== 'NaN') {
          return -1
        }
        if (a.balance !== 'NaN' && b.balance === 'NaN') {
          return 1
        }
        if (a.balance === 'NaN' && b.balance === 'NaN') {
          return 0
        }
        if (new Fraction(a.balance).gt(new Fraction(b.balance))) return -1
        if (new Fraction(a.balance).lt(new Fraction(b.balance))) return 1
      }

      if (a.balance && !b.balance) return -1
      if (!a.balance && b.balance) return 1

      // const firstCharA = a.name.toLowerCase()
      // const firstCharB = b.name.toLowerCase()
      // if (firstCharA < firstCharB) return -1
      // if (firstCharA > firstCharB) return 1

      return 0
    })
}
