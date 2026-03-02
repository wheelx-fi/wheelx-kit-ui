import { create } from 'zustand'

interface UserHasSelectedFromNetwork {
  userHasSelectedFromNetwork: boolean
  setUserHasSelectedFromNetwork: (userHasSelectedFromNetwork: boolean) => void
}

export const useUserHasSelectedFromNetwork = create<UserHasSelectedFromNetwork>(
  (set) => ({
    userHasSelectedFromNetwork: false,
    setUserHasSelectedFromNetwork: (userHasSelectedFromNetwork) =>
      set({ userHasSelectedFromNetwork })
  })
)
