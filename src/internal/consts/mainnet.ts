import { defineChain } from 'viem'
export const mainnet = /*#__PURE__*/ defineChain({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockTime: 12_000,
  rpcUrls: {
    default: {
      // http: ['https://eth.merkle.io']
      http: [
        'https://eth.merkle.io',
        'https://eth-mainnet.public.blastapi.io',
        'https://eth.llamarpc.com',
        'https://rpc.poolz.finance/eth',
        'https://eth.rpc.blxrbdn.com',
        'https://rpc.eth.gateway.fm',
        'https://eth.rpc.blxrbdn.com'
      ]
    }
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
      apiUrl: 'https://api.etherscan.io/api'
    }
  },
  contracts: {
    ensUniversalResolver: {
      address: '0xeeeeeeee14d718c2b47d9923deab1335e144eeee',
      blockCreated: 23_085_558
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14_353_601
    }
  }
})
