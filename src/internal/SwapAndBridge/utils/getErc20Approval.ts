import {
  writeContract,
  waitForTransactionReceipt,
  readContract
} from '@wagmi/core'
import { erc20Abi } from 'viem'
import { Config } from 'wagmi'

interface Props {
  chainId: number
  tokenAddress: `0x${string}`
  owner?: `0x${string}`
  spender?: `0x${string}`
}

interface PropsWithAmount extends Props {
  amount: bigint
}

export const getErc20Approval = (config: Config) => {
  const getAllowance = async ({
    chainId,
    tokenAddress,
    owner,
    spender
  }: Props) => {
    if (!owner || !spender) {
      return BigInt(0)
    }
    const allowance = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress,
      functionName: 'allowance',
      chainId,
      args: [owner, spender]
    })
    return allowance
  }

  const isNeedApprove = async ({
    chainId,
    tokenAddress,
    owner,
    spender,
    amount
  }: PropsWithAmount) => {
    if (!owner || !spender || !tokenAddress) {
      return false
    }
    const allowance = await getAllowance({
      chainId,
      tokenAddress,
      owner,
      spender
    })
    return allowance < amount
  }

  const approve = async ({
    chainId,
    tokenAddress,
    owner,
    spender,
    amount
  }: PropsWithAmount) => {
    if (!owner || !spender || !tokenAddress) {
      return false
    }
    const tx = await writeContract(config, {
      abi: erc20Abi,
      address: tokenAddress,
      functionName: 'approve',
      chainId,
      args: [spender, amount]
    })
    const receipt = await waitForTransactionReceipt(config, {
      hash: tx,
      chainId
    })
    if (receipt.status === 'success') {
      return true
    } else {
      return false
    }
  }

  return {
    getAllowance,
    isNeedApprove,
    approve
  }
}
