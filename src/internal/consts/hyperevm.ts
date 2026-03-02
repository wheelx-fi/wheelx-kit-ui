import { defineChain } from 'viem';

export const hyperevm = /*#__PURE__*/ defineChain({
  id: 999,
  name: 'HyperEVM',
  network: 'HYPE',
  nativeCurrency: {
    name: 'HYPER',
    symbol: 'HYPER',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm', 'https://rpc.hypurrscan.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Purrsec',
      url: 'https://hyperevmscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 13051,
    },
  },
  testnet: false,
})
