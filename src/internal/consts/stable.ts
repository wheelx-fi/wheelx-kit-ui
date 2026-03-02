import { defineChain } from 'viem'

export const stable = /*#__PURE__*/ defineChain({
  id: 988,
  name: 'Stable',
  network: 'stable',
  nativeCurrency: {
    name: 'USD Coin',
    symbol: 'gUSDT',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [' https://rpc.stable.xyz']
    }
  },
  blockExplorers: {
    default: {
      name: 'Stablescan',
      url: 'https://stablescan.xyz'
    }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1898013
    }
  },
  testnet: false
})
