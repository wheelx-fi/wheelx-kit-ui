import { defineChain } from 'viem'

export const giwa = /*#__PURE__*/ defineChain({
  id: 91342,
  name: 'GIWA Testnet',
  network: 'GIWA',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.giwa.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia-explorer.giwa.io'
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
