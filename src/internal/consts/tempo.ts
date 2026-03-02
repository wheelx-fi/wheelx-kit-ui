import { defineChain } from 'viem'

export const tempo = /*#__PURE__*/ defineChain({
  id: 42429,
  name: 'Tempo Testnet',
  network: 'Tempo Testnet',
  nativeCurrency: {
    name: 'USD',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.tempo.xyz']
    }
  },
  blockExplorers: {
    default: {
      name: 'tempo explorer',
      url: 'https://explore.tempo.xyz'
    }
  },
  contracts: {
    // multicall3: {
    //   address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    //   blockCreated: 1898013
    // }
  },
  testnet: true
})
