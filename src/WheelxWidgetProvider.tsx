'use client'

import { PropsWithChildren } from 'react'

import { Provider } from './internal/ui/provider'
import { ClientProviders } from './internal/providers/ClientProviders'
import { WidgetAnimationsGlobalStyle } from './internal/ui/WidgetAnimationsGlobalStyle'

export function WheelxWidgetProvider({ children }: PropsWithChildren) {
  return (
    <Provider>
      <WidgetAnimationsGlobalStyle />
      <ClientProviders>{children}</ClientProviders>
    </Provider>
  )
}
