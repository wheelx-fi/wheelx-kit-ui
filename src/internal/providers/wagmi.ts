import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  walletConnectWallet,
  coinbaseWallet,
  metaMaskWallet,
  rabbyWallet,
  okxWallet,
  tokenPocketWallet,
  bitgetWallet,
  gateWallet,
  imTokenWallet,
  trustWallet,
  zerionWallet,
  coin98Wallet,
  baseAccount,
  phantomWallet
} from '@rainbow-me/rainbowkit/wallets'
import { naboxWallet } from './nabox'
import { fallback, http } from 'viem'
import { Config, createConfig } from 'wagmi'
import { Chain } from 'wagmi/chains'
import { mainnet } from '../consts/mainnet'

import { allChains, defaultRpc } from '../consts/chainsCatalog'
import { logger } from '../utils'

import binanceWallet from '@binance/w3w-rainbow-connector-v2'

// Combine chains based on environment variable
// Always include mainnet
const supportedChains: Chain[] = [mainnet]
allChains.forEach(({ chain, networkType }) => {
  if (networkType === 'mainnet' && chain.id !== mainnet.id) {
    supportedChains.push(chain)
  }
  if (networkType === 'testnet') {
    supportedChains.push(chain)
  }
})
logger.log('🚀 ~ supportedChains:', supportedChains)

// get default transports from defaultRpc
const defaultTransports = allChains.reduce(
  (acc, chain) => {
    acc[chain.chain.id] = fallback([http(), http(defaultRpc[chain.chain.id])])
    return acc
  },
  {} as Record<number, ReturnType<typeof fallback>>
)

// Build transports dynamically from rpcMap or fallback to defaults
function buildTransports(rpcMap: Record<string, string[]> | null) {
  logger.log('🚀 ~ buildTransports ~ rpcMap:', rpcMap)
  if (!rpcMap) return defaultTransports

  // Override defaults with API-provided RPC URLs
  const dynamicTransports: Record<number, ReturnType<typeof fallback>> = {}
  supportedChains.forEach((chain: Chain) => {
    const chainId = chain.id.toString()
    const rpcUrls = rpcMap[chainId]
    if (rpcUrls && rpcUrls.length > 0) {
      dynamicTransports[chain.id] = fallback(
        rpcUrls.map((url: string) => http(url))
      )
    } else {
      dynamicTransports[chain.id] = defaultTransports[chain.id] || http()
    }
  })
  logger.log('🚀 ~ buildTransports ~ dynamicTransports:', dynamicTransports)

  return dynamicTransports
}

// Singleton config instance
let config: Config | null = null

// Initialize or return wagmi config
export function getConfig(
  rpcMap: Record<string, string[]> | null = null
): Config {
  if (!config) {
    const transports = buildTransports(rpcMap)
    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Popular',
          wallets: [
            metaMaskWallet,
            binanceWallet,
            okxWallet,
            tokenPocketWallet,
            bitgetWallet,
            baseAccount,
            coinbaseWallet,
            rabbyWallet,
            naboxWallet,
            walletConnectWallet,
            gateWallet,
            imTokenWallet,
            trustWallet,
            zerionWallet,
            coin98Wallet,
            phantomWallet
          ]
        }
      ],
      {
        appName: 'WheelX',
        projectId:
          process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'
      }
    )

    config = createConfig({
      chains: [supportedChains[0], ...supportedChains.slice(1)] as [
        Chain,
        ...Chain[]
      ],
      transports,
      connectors,
      // If your dApp uses server side rendering (SSR)
      ssr: true
    })
  }
  return config
}
