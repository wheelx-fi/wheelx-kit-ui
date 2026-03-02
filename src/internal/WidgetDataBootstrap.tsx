'use client'

import { PropsWithChildren, useEffect, useMemo } from 'react'

import { useChainsAndTokens } from './api'
import { useChainsStore, useTokensStore } from './stores'
import { useWheelxWidgetConfig } from '../config'

export function WidgetDataBootstrap({ children }: PropsWithChildren) {
  const { data } = useChainsAndTokens()
  const { chains: currentChains, setChains } = useChainsStore()
  const { tokens: currentTokens, setTokens } = useTokensStore()
  const { isTokenAllowed } = useWheelxWidgetConfig()

  const chains = data?.chains || []
  const tokens = data?.tokens || []
  const predictionChains = data?.deposit_platforms?.prediction?.chains || []
  const predictionTokens = data?.deposit_platforms?.prediction?.tokens || []

  const allChainsRaw = useMemo(
    () => [...chains, ...predictionChains],
    [chains, predictionChains]
  )
  const allTokensRaw = useMemo(
    () => [...tokens, ...predictionTokens],
    [tokens, predictionTokens]
  )

  const allTokens = useMemo(() => {
    return allTokensRaw.filter(
      (token) =>
        isTokenAllowed('from', token.chain_id, token.address) ||
        isTokenAllowed('to', token.chain_id, token.address)
    )
  }, [allTokensRaw, isTokenAllowed])

  const allChains = useMemo(() => {
    const availableChainIds = new Set(allTokens.map((token) => token.chain_id))
    return allChainsRaw.filter((chain) => availableChainIds.has(chain.chain_id))
  }, [allChainsRaw, allTokens])

  useEffect(() => {
    if (!data) return
    if (JSON.stringify(allChains) !== JSON.stringify(currentChains || [])) {
      setChains(allChains)
    }
  }, [allChains, currentChains, data, setChains])

  useEffect(() => {
    if (!data) return
    if (JSON.stringify(allTokens) !== JSON.stringify(currentTokens || [])) {
      setTokens(allTokens)
    }
  }, [allTokens, currentTokens, data, setTokens])

  return <>{children}</>
}
