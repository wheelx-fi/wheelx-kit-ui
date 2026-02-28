'use client'

import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

export type WidgetMode = 'bridge-and-swap' | 'swap'
export type WidgetChainFilter = 'all' | number | number[]
export type WidgetSide = 'from' | 'to'

export interface WidgetNetworksConfig {
  from?: WidgetChainFilter
  to?: WidgetChainFilter
}

export interface WidgetDefaultTokenConfig {
  chainId: number
  address: string
  symbol?: string
}

export interface WidgetDefaultTokensConfig {
  from?: WidgetDefaultTokenConfig
  to?: WidgetDefaultTokenConfig
}

interface WidgetAllowedTokenConfig {
  chainId: number
  address: string
}

export interface WidgetAllowedTokenGroupConfig {
  chainId: number
  tokens: string[]
}

export interface WidgetAllowedTokensConfig {
  from?: WidgetAllowedTokenGroupConfig[]
  to?: WidgetAllowedTokenGroupConfig[]
}

export interface WidgetStyleOverrides {
  formContainer?: Record<string, unknown>
  formTitleText?: Record<string, unknown>
  sectionContainer?: Record<string, unknown>
  sectionLabelText?: Record<string, unknown>
  tokenSelector?: Record<string, unknown>
  tokenPrimaryText?: Record<string, unknown>
  tokenSecondaryText?: Record<string, unknown>
  balanceText?: Record<string, unknown>
  recipientBadge?: Record<string, unknown>
  amountInputContainer?: Record<string, unknown>
  amountInputText?: Record<string, unknown>
  amountUsdText?: Record<string, unknown>
  primaryButton?: Record<string, unknown>
  primaryButtonLoading?: Record<string, unknown>
  primaryButtonWarning?: Record<string, unknown>
  primaryButtonText?: Record<string, unknown>
  tokenModalContent?: Record<string, unknown>
  tokenModalTitleText?: Record<string, unknown>
  tokenModalSearchInput?: Record<string, unknown>
  tokenModalChainPanel?: Record<string, unknown>
  tokenModalTokenPanel?: Record<string, unknown>
  tokenModalSectionLabelText?: Record<string, unknown>
  tokenModalChainRow?: Record<string, unknown>
  tokenModalChainRowHover?: Record<string, unknown>
  tokenModalChainRowActive?: Record<string, unknown>
  tokenModalChainText?: Record<string, unknown>
  tokenModalChainsWithAssetsRow?: Record<string, unknown>
  tokenModalChainsWithAssetsRowActive?: Record<string, unknown>
  tokenModalTokenRow?: Record<string, unknown>
  tokenModalTokenRowHover?: Record<string, unknown>
  tokenModalTokenPrimaryText?: Record<string, unknown>
  tokenModalTokenSecondaryText?: Record<string, unknown>
  tokenModalCategoryTab?: Record<string, unknown>
  tokenModalCategoryTabActive?: Record<string, unknown>
  tokenModalCategoryTabText?: Record<string, unknown>
  quickHalfButton?: Record<string, unknown>
  quickMaxButton?: Record<string, unknown>
  slippageSettingsTrigger?: Record<string, unknown>
  slippagePopoverContent?: Record<string, unknown>
  slippageAutoButton?: Record<string, unknown>
  slippageCustomInput?: Record<string, unknown>
  slippageTitleText?: Record<string, unknown>
  slippageDescriptionText?: Record<string, unknown>
  slippageButtonText?: Record<string, unknown>
  quoteInfoContainer?: Record<string, unknown>
  quoteTooltipContent?: Record<string, unknown>
  quoteInfoCard?: Record<string, unknown>
  quoteInfoLabel?: Record<string, unknown>
  quoteInfoValue?: Record<string, unknown>
  quoteInfoFreeBadge?: Record<string, unknown>
  txStateCard?: Record<string, unknown>
  txStateRouteContainer?: Record<string, unknown>
  txStateSummaryContainer?: Record<string, unknown>
  txStateTokenCard?: Record<string, unknown>
  txStateLabel?: Record<string, unknown>
  txStateValue?: Record<string, unknown>
  txStatePrimaryButton?: Record<string, unknown>
  txStateStatusLink?: Record<string, unknown>
  txStateStatusError?: Record<string, unknown>
  txStateStatusWarning?: Record<string, unknown>
  txStateStatusProgress?: Record<string, unknown>
}

export interface WheelxWidgetConfig {
  mode?: WidgetMode
  networks?: WidgetNetworksConfig
  defaultTokens?: WidgetDefaultTokensConfig
  allowedTokens?: WidgetAllowedTokensConfig
  styles?: WidgetStyleOverrides
}

interface NormalizedWheelxWidgetConfig {
  mode: WidgetMode
  networks: {
    from: number[] | null
    to: number[] | null
  }
  defaultTokens: WidgetDefaultTokensConfig
  allowedTokens: {
    from: WidgetAllowedTokenConfig[] | null
    to: WidgetAllowedTokenConfig[] | null
  }
  styles: WidgetStyleOverrides
}

const defaultConfig: NormalizedWheelxWidgetConfig = {
  mode: 'bridge-and-swap',
  networks: {
    from: null,
    to: null
  },
  defaultTokens: {},
  allowedTokens: {
    from: null,
    to: null
  },
  styles: {}
}

const WheelxWidgetConfigContext =
  createContext<NormalizedWheelxWidgetConfig>(defaultConfig)

function normalizeChainFilter(filter?: WidgetChainFilter): number[] | null {
  if (filter === undefined || filter === 'all') return null
  if (typeof filter === 'number') return [filter]
  const unique = Array.from(new Set(filter.filter((v) => Number.isFinite(v))))
  return unique.length > 0 ? unique : null
}

function normalizeConfig(
  config?: WheelxWidgetConfig
): NormalizedWheelxWidgetConfig {
  const mode = config?.mode ?? defaultConfig.mode
  let from = normalizeChainFilter(config?.networks?.from)
  let to = normalizeChainFilter(config?.networks?.to)

  if (mode === 'swap' && from && to) {
    const shared = from.filter((id) => to?.includes(id))
    const normalizedShared = shared.length > 0 ? shared : from
    from = normalizedShared
    to = normalizedShared
  }

  const normalizeAllowedTokens = (
    tokens?: WidgetAllowedTokenGroupConfig[]
  ): WidgetAllowedTokenConfig[] | null => {
    if (!tokens?.length) return null

    const normalized: WidgetAllowedTokenConfig[] = []

    tokens.forEach((token) => {
      if (!Number.isFinite(token.chainId)) {
        return
      }

      const validAddresses = (Array.isArray(token.tokens) ? token.tokens : [])
        .filter((address) => typeof address === 'string' && address.trim().length > 0)
        .map((address) => address.toLowerCase())

      validAddresses.forEach((address) => {
        normalized.push({
          chainId: token.chainId,
          address
        })
      })
    })

    if (normalized.length === 0) return null
    const dedup = Array.from(
      new Map(
        normalized.map((token) => [
          `${token.chainId}:${token.address}`,
          token
        ])
      ).values()
    )
    return dedup.length ? dedup : null
  }

  const normalizedAllowedTokens = {
    from: normalizeAllowedTokens(config?.allowedTokens?.from),
    to: normalizeAllowedTokens(config?.allowedTokens?.to)
  }

  return {
    mode,
    networks: {
      from,
      to
    },
    defaultTokens: config?.defaultTokens ?? {},
    allowedTokens: normalizedAllowedTokens,
    styles: config?.styles ?? {}
  }
}

export function WheelxWidgetConfigProvider({
  children,
  config
}: PropsWithChildren<{ config?: WheelxWidgetConfig }>) {
  const normalized = useMemo(() => normalizeConfig(config), [config])

  return (
    <WheelxWidgetConfigContext.Provider value={normalized}>
      {children}
    </WheelxWidgetConfigContext.Provider>
  )
}

export function useWheelxWidgetConfig() {
  const config = useContext(WheelxWidgetConfigContext)

  const isChainAllowed = (side: WidgetSide, chainId?: number | null) => {
    if (!chainId) return false
    const allowed = config.networks[side]
    if (!allowed) return true
    return allowed.includes(chainId)
  }

  const getAllowedChainIds = (side: WidgetSide) => config.networks[side]
  const getAllowedTokens = (side: WidgetSide) => config.allowedTokens[side]

  const isTokenAllowed = (
    side: WidgetSide,
    chainId?: number | null,
    address?: string | null
  ) => {
    if (!chainId) return false
    const allowed = config.allowedTokens[side]
    if (!allowed) return true
    const chainScopedRules = allowed.filter((item) => item.chainId === chainId)
    // Restrict only chains explicitly configured in allowedTokens.
    // Unconfigured chains remain unrestricted.
    if (chainScopedRules.length === 0) return true
    if (!address) return false
    const normalizedAddress = address.toLowerCase()
    return chainScopedRules.some(
      (item) =>
        item.chainId === chainId && item.address === normalizedAddress
    )
  }

  return {
    ...config,
    getAllowedChainIds,
    isChainAllowed,
    getAllowedTokens,
    isTokenAllowed
  }
}

export function useWheelxWidgetStyles() {
  return useWheelxWidgetConfig().styles
}
