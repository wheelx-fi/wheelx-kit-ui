import { useCallback, useRef } from 'react'
import { create } from 'zustand'

interface RefreshLoadingState {
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

const useRefreshLoadingStore = create<RefreshLoadingState>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading })
}))

export const useRefreshLoading = () => {
  const { isLoading, setIsLoading } = useRefreshLoadingStore()

  const timer = useRef<NodeJS.Timeout | null>(null)
  const autoRestoreTimer = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }

    if (autoRestoreTimer.current) {
      clearTimeout(autoRestoreTimer.current)
      autoRestoreTimer.current = null
    }

    if (!isLoading) {
      setIsLoading(true)

      timer.current = setTimeout(() => {
        setIsLoading(false)
        timer.current = null
      }, 1500)
    } else {
      setIsLoading(false)

      autoRestoreTimer.current = setTimeout(() => {
        setIsLoading(true)
        autoRestoreTimer.current = null

        timer.current = setTimeout(() => {
          setIsLoading(false)
          timer.current = null
        }, 1500)
      }, 200)
    }
  }, [isLoading, setIsLoading])

  return { isLoading, startLoading }
}
