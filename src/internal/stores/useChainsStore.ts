import { create } from 'zustand'

import { ChainInfo, TokenInfo } from '../api/useChainsAndTokens'

interface ChainsStore {
  chains: ChainInfo[] | null
  setChains: (chains: ChainInfo[]) => void
  isSelectPredictionChain: boolean
  setIsSelectPredictionChain: (isSelectPredictionChain: boolean) => void
}
interface TokenStore {
  tokens: TokenInfo[] | null
  setTokens: (tokens: TokenInfo[]) => void
}
export const useChainsStore = create<ChainsStore>((set) => ({
  chains: null,
  setChains: (chains: ChainInfo[]) => set({ chains }),
  isSelectPredictionChain: false,
  setIsSelectPredictionChain: (isSelectPredictionChain: boolean) =>
    set({ isSelectPredictionChain })
}))
export const useTokensStore = create<TokenStore>((set) => ({
  tokens: null,
  setTokens: (tokens: TokenInfo[]) => set({ tokens })
}))
