import type { WheelxWidgetConfig } from '@wheelx/widget'

export const BASE_CHAIN_ID = 8453
export const BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
export const BASE_USDT_ADDRESS = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'

export const demoWidgetConfig: WheelxWidgetConfig = {
  mode: 'bridge-and-swap',
  defaultTokens: {
    from: {
      chainId: BASE_CHAIN_ID,
      address: BASE_USDT_ADDRESS,
      symbol: 'USDT'
    },
    to: {
      chainId: BASE_CHAIN_ID,
      address: BASE_USDC_ADDRESS,
      symbol: 'USDC'
    }
  }
}
