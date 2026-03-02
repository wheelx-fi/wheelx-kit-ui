import { defineChain } from 'viem'

export const megaeth = /*#__PURE__*/ defineChain({
  id: 4326,
  name: 'MegaETH',
  network: 'MegaETH',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.megaeth.com/rpc']
    }
  },
  blockExplorers: {
    default: {
      name: 'megaeth explorer',
      url: 'https://megaeth.blockscout.com/'
    }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0
    }
  },
  testnet: false
})
