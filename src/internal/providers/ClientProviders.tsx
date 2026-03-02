'use client'

import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC } from 'react'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { getConfig } from './wagmi'

export const ClientProviders: FC<PropsWithChildren> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)
  const queryClient = useMemo(() => new QueryClient(), [])
  const wagmiConfig = useMemo(
    () => (isMounted ? getConfig() : null),
    [isMounted]
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !wagmiConfig) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider
          modalSize="compact"
          locale="en-US"
          theme={lightTheme({
            accentColor: '#8143FF',
            accentColorForeground: '#ffffff',
            borderRadius: 'medium',
            fontStack: 'system'
          })}
          appInfo={{ appName: 'WheelX Widget' }}
        >
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
