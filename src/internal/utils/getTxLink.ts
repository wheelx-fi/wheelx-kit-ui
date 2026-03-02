import { allChains, explorerUrl } from '../consts/chainsCatalog'

export const getTxLink = (txHash: string, chainId: number) => {
  const chain = allChains.find((item) => item.chain.id === chainId)
  const explorer =
    chain?.chain.blockExplorers?.default.url || explorerUrl[chainId]
  return `${explorer}/tx/${txHash}`
}

export const getAddressLink = (
  address: `0x${string}` | string,
  chainId: number
) => {
  const chain = allChains.find((item) => item.chain.id === chainId)
  const explorer =
    chain?.chain.blockExplorers?.default.url || explorerUrl[chainId]
  return `${explorer}/address/${address}`
}

export const getWithdrawAddressLink = (
  address: `0x${string}` | string,
  chainId: number
) => {
  const chain = allChains.find((item) => item.chain.id === chainId)
  const explorer =
    chain?.chain.blockExplorers?.default.url || explorerUrl[chainId]
  return `${explorer}/tx/${address}`
}
