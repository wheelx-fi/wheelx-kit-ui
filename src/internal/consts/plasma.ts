import { defineChain } from 'viem'

export const plasma = /*#__PURE__*/ defineChain({
  id: 9745,
  name: 'Plasma',
  network: 'Plasma',
  nativeCurrency: {
    name: 'Plasma',
    symbol: 'XPL',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.plasma.to']
    }
  },
  blockExplorers: {
    default: {
      name: 'Plasma explorer',
      url: 'https://plasmascan.to'
    }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1
    }
  },
  testnet: true
})
