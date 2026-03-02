import { create } from 'zustand'

interface TxStateContextStore {
  fromTxHash: `0x${string}` | null
  toTxHash: `0x${string}` | null
  setFromTxHash: (fromTxHash: `0x${string}` | null) => void
  setToTxHash: (toTxHash: `0x${string}` | null) => void
  resetTxState: () => void
  startTrading: boolean
  setStartTrading: (startTrading: boolean) => void
  userCancelsTransaction: boolean
  setUserCancelsTransaction: (userCancelsTransaction: boolean) => void
  fromValue?: string | null
  setFromValue?: (fromValue: string | null) => void
  tryAgain?: boolean
  setTryAgain: (tryAgain: boolean) => void
}

const initialState = {
  // fromTxHash:
  //   '0x635470331be4c59357ff80b62c596ba5b09508d8c1572477ad7b2f4f0a0bd1a7' as `0x${string}`,
  fromTxHash: null,
  toTxHash: null,
  startTrading: false
  // fromValue: null,
  // tryAgain: false
}

export const useTxStateContextStore = create<TxStateContextStore>((set) => ({
  ...initialState,
  setFromTxHash: (fromTxHash) => set({ fromTxHash }),
  setToTxHash: (toTxHash) => set({ toTxHash }),
  resetTxState: () => set(initialState),
  setStartTrading: (startTrading) => set({ startTrading }),
  userCancelsTransaction: false,
  setUserCancelsTransaction: (userCancelsTransaction) =>
    set({ userCancelsTransaction }),
  setFromValue: (fromValue) => set({ fromValue }),
  setTryAgain: (tryAgain) => set({ tryAgain })
}))
