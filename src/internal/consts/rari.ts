import { defineChain } from 'viem'

export const rari = /*#__PURE__*/ defineChain({
  id: 1380012617,
  name: 'RARI',
  network: 'rari',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.rpc.rarichain.org/http']
    }
  },
  blockExplorers: {
    default: {
      name: 'RARI explorer',
      url: 'https://mainnet.explorer.rarichain.org/'
    }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1898013
    }
  },
  testnet: true
})
