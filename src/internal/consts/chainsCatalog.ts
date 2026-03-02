import {
  arbitrum,
  arbitrumSepolia,
  sepolia,
  optimism,
  optimismSepolia,
  baseSepolia,
  unichainSepolia,
  unichain,
  base,
  ink,
  linea,
  soneium,
  bsc,
  worldchain,
  opBNB,
  mode,
  lisk,
  zksync,
  celo,
  polygon,
  avalanche,
  plumeMainnet,
  zora,
  sonic,
  berachain,
  abstract,
  morph,
  bob,
  taiko,
  scroll,
  hemi,
  xLayer,
  mantle,
  cronos,
  gravity,
  blast,
  manta,
  zircuit,
  xdc,
  sei,
  plume,
  gnosis,
  hashkey,
  flowMainnet,
  etherlink,
  ronin,
  flare,
  rootstock,
  iota,
  arcTestnet
} from 'wagmi/chains'
import { Chain } from 'wagmi/chains'

import { katana } from './katana'
import { hyperevm } from './hyperevm'
import { giwa } from './giwa'
import { plasma } from './plasma'
import { rari } from './rari'
import { stabletestnet } from './stabletestnet'
import { stable } from './stable'
import { monad } from './monad'
import { mainnet } from './mainnet'
import { metis } from './metis'
import { polygonZkEvm } from './polygonZkEvm'
import { tempo } from './tempo'
import { megaeth } from './megaeth'

export const allChains: { chain: Chain; networkType: 'mainnet' | 'testnet' }[] =
  [
    { chain: mainnet, networkType: 'mainnet' },
    { chain: arbitrum, networkType: 'mainnet' },
    { chain: optimism, networkType: 'mainnet' },
    { chain: unichain, networkType: 'mainnet' },
    { chain: base, networkType: 'mainnet' },
    { chain: ink, networkType: 'mainnet' },
    { chain: linea, networkType: 'mainnet' },
    { chain: soneium, networkType: 'mainnet' },
    { chain: bsc, networkType: 'mainnet' },
    { chain: worldchain, networkType: 'mainnet' },
    { chain: opBNB, networkType: 'mainnet' },
    { chain: mode, networkType: 'mainnet' },
    { chain: lisk, networkType: 'mainnet' },
    { chain: zksync, networkType: 'mainnet' },
    { chain: celo, networkType: 'mainnet' },
    { chain: polygon, networkType: 'mainnet' },
    { chain: avalanche, networkType: 'mainnet' },
    { chain: plumeMainnet, networkType: 'mainnet' },
    { chain: zora, networkType: 'mainnet' },
    { chain: sonic, networkType: 'mainnet' },
    { chain: berachain, networkType: 'mainnet' },
    { chain: bob, networkType: 'mainnet' },
    { chain: abstract, networkType: 'mainnet' },
    { chain: morph, networkType: 'mainnet' },
    { chain: katana, networkType: 'mainnet' },
    { chain: taiko, networkType: 'mainnet' },
    { chain: scroll, networkType: 'mainnet' },
    { chain: hemi, networkType: 'mainnet' },
    { chain: xLayer, networkType: 'mainnet' },
    { chain: hyperevm, networkType: 'mainnet' },
    { chain: mantle, networkType: 'mainnet' },
    { chain: cronos, networkType: 'mainnet' },
    { chain: plasma, networkType: 'mainnet' },
    { chain: gravity, networkType: 'mainnet' },
    { chain: blast, networkType: 'mainnet' },
    { chain: rari, networkType: 'mainnet' },
    { chain: manta, networkType: 'mainnet' },
    { chain: zircuit, networkType: 'mainnet' },
    { chain: polygonZkEvm, networkType: 'mainnet' },
    { chain: xdc, networkType: 'mainnet' },
    { chain: monad, networkType: 'mainnet' },
    { chain: metis, networkType: 'mainnet' },
    { chain: sei, networkType: 'mainnet' },
    { chain: stable, networkType: 'mainnet' },
    { chain: plume, networkType: 'mainnet' },
    { chain: gnosis, networkType: 'mainnet' },
    { chain: hashkey, networkType: 'mainnet' },
    { chain: flowMainnet, networkType: 'mainnet' },
    { chain: etherlink, networkType: 'mainnet' },
    { chain: ronin, networkType: 'mainnet' },
    { chain: flare, networkType: 'mainnet' },
    { chain: rootstock, networkType: 'mainnet' },
    { chain: iota, networkType: 'mainnet' },
    { chain: megaeth, networkType: 'mainnet' },
    { chain: sepolia, networkType: 'testnet' },
    { chain: arbitrumSepolia, networkType: 'testnet' },
    { chain: optimismSepolia, networkType: 'testnet' },
    { chain: baseSepolia, networkType: 'testnet' },
    { chain: unichainSepolia, networkType: 'testnet' },
    { chain: stabletestnet, networkType: 'testnet' },
    { chain: giwa, networkType: 'testnet' },
    { chain: tempo, networkType: 'testnet' },
    { chain: arcTestnet, networkType: 'testnet' }
  ]

const _defaultRpc: Record<number, string> = {
  [mainnet.id]: 'https://eth-mainnet.public.blastapi.io',
  [arbitrum.id]: 'https://arbitrum.gateway.tenderly.co',
  [optimism.id]: 'https://optimism.gateway.tenderly.co',
  [base.id]: 'https://mainnet.base.org',
  [unichain.id]: 'https://rpc.therpc.io/unichain',
  [xLayer.id]: 'https://rpc.xlayer.io',
  [sepolia.id]: 'https://ethereum-sepolia.publicnode.com',
  [arbitrumSepolia.id]: 'https://sepolia-rollup.arbitrum.io/rpc',
  [optimismSepolia.id]: 'https://optimism-sepolia.gateway.tenderly.co',
  [baseSepolia.id]: 'https://sepolia.base.org',
  [unichainSepolia.id]: 'https://sepolia.unichain.org',
  [arcTestnet.id]: 'https://rpc.testnet.arc.network',
  [stabletestnet.id]: 'https://rpc.testnet.stable.xyz',
  [giwa.id]: 'https://sepolia-rpc.giwa.io'
}

export const defaultRpc = allChains.reduce(
  (acc, item) => {
    acc[item.chain.id] =
      _defaultRpc[item.chain.id] ?? item.chain.rpcUrls.default.http[0]
    return acc
  },
  {} as Record<number, string>
)

export const explorerUrl: Record<number, string> = {
  [mainnet.id]: 'https://etherscan.io',
  [arbitrum.id]: 'https://arbiscan.io',
  [optimism.id]: 'https://optimistic.etherscan.io',
  [base.id]: 'https://basescan.org',
  [unichain.id]: 'https://uniscan.xyz',
  [sepolia.id]: 'https://sepolia.etherscan.io',
  [arbitrumSepolia.id]: 'https://sepolia.arbiscan.io',
  [optimismSepolia.id]: 'https://optimism-sepolia.blockscout.com',
  [baseSepolia.id]: 'https://sepolia.basescan.org',
  [unichainSepolia.id]: 'https://sepolia.uniscan.xyz',
  [arcTestnet.id]: 'https://rpc.testnet.arc.network',
  [stabletestnet.id]: 'https://rpc.testnet.stable.xyz',
  [giwa.id]: 'https://sepolia-rpc.giwa.io'
}
