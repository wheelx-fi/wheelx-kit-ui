'use client'

import { VStack } from '@chakra-ui/react'
import { MainForm } from './internal/SwapAndBridge/MainForm'
import { FavoritesProvider } from './internal/SelectTokenModal/FavoritesContext'
import { TokenFavoritesProvider } from './internal/SelectTokenModal/TokenFavoritesContext'
import { TokenSearchHistoryProvider } from './internal/SelectTokenModal/SearchHistoryContext'
import { WidgetDataBootstrap } from './internal/WidgetDataBootstrap'
import {
  WheelxWidgetConfig,
  WheelxWidgetConfigProvider
} from './config'

export interface WheelxBridgeSwapWidgetProps {
  config?: WheelxWidgetConfig
}

export function WheelxBridgeSwapWidget({
  config
}: WheelxBridgeSwapWidgetProps) {
  return (
    <WheelxWidgetConfigProvider config={config}>
      <WidgetDataBootstrap>
        <FavoritesProvider>
          <TokenFavoritesProvider>
            <TokenSearchHistoryProvider>
              <VStack gap={0}>
                <MainForm />
              </VStack>
            </TokenSearchHistoryProvider>
          </TokenFavoritesProvider>
        </FavoritesProvider>
      </WidgetDataBootstrap>
    </WheelxWidgetConfigProvider>
  )
}
