import { create } from 'zustand'

interface DifferentAddressProp {
  differentAddress: `0x${string}` | undefined
  setDifferentAddress: (address: `0x${string}` | undefined) => void
  isDepositPlatformToken: boolean
  setIsDepositPlatformToken: (isDepositPlatformToken: boolean) => void
}
export const useDifferentAddressStore = create<DifferentAddressProp>((set) => ({
  differentAddress: undefined,
  setDifferentAddress: (differentAddress) => set({ differentAddress }),
  isDepositPlatformToken: false,
  setIsDepositPlatformToken: (isDepositPlatformToken) =>
    set({ isDepositPlatformToken })
}))
