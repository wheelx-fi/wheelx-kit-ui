import { useAccount, useBalance } from 'wagmi'

interface Props {
  chainId: number
  tokenAddress?: `0x${string}`
  connectAddress?: `0x${string}`
}

export const useTokenBalance = ({
  chainId,
  tokenAddress,
  connectAddress
}: Props) => {
  const { address } = useAccount()
  const { data: balance } = useBalance({
    address: connectAddress ? connectAddress : address,
    chainId: chainId,
    token: tokenAddress
  })
  return balance
}
