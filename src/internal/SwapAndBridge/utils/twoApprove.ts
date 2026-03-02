import { useState } from 'react'
import { WalletClient } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

export const usdtAbi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

export type UsdtAbi = typeof usdtAbi

// Special function to handle double approval for Ethereum mainnet USDT
export async function handleEthereumUSDTApprove({
  tokenAddress,
  owner,
  spender,
  amount,
  publicClient,
  walletClient
}: {
  tokenAddress: `0x${string}`
  owner: `0x${string}` | undefined
  spender: `0x${string}`
  amount: bigint
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publicClient: any
  walletClient: WalletClient
}) {
  if (!owner) {
    return
  }
  if (!walletClient) {
    throw new Error('Wallet client is required and cannot be undefined.')
  }
  if (!publicClient) {
    throw new Error('Public client is required.')
  }

  try {
    // 1. Read current allowance
    const currentAllowance = await publicClient.readContract({
      address: tokenAddress,
      abi: usdtAbi,
      functionName: 'allowance',
      args: [owner, spender]
    })

    // If current allowance is sufficient, no need to proceed
    if (currentAllowance >= amount) {
      console.log('USDT allowance is sufficient, no additional approval needed')
      return
    }

    // Get current chain information
    const chain = publicClient.chain

    // 2. If current allowance is greater than 0, need to reset to zero first
    if (currentAllowance > 0n) {
      console.log('Performing USDT allowance reset to zero')

      const zeroApproveHash = await walletClient.writeContract({
        account: owner,
        address: tokenAddress,
        abi: usdtAbi,
        functionName: 'approve',
        args: [spender, 0n],
        chain: chain // Add chain parameter
      })

      // Wait for zero-approval transaction confirmation
      console.log('Waiting for USDT zero-approval transaction confirmation...')
      await publicClient.waitForTransactionReceipt({
        hash: zeroApproveHash
      })
      console.log('USDT zero-approval completed')
    }

    // 3. Perform target amount approval
    console.log('Performing USDT target amount approval')
    const approveHash = await walletClient.writeContract({
      account: owner,
      address: tokenAddress,
      abi: usdtAbi,
      functionName: 'approve',
      args: [spender, amount],
      chain: chain // Add chain parameter
    })

    // Wait for approval transaction confirmation
    console.log(
      'Waiting for USDT target amount approval transaction confirmation...'
    )
    await publicClient.waitForTransactionReceipt({
      hash: approveHash
    })
    console.log('USDT double approval process completed')
  } catch (error) {
    console.error('USDT double approval failed:', error)
    throw error
  }
}
export function useUSDTHandler() {
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async (
    tokenAddress: `0x${string}`,
    spender: `0x${string}`,
    amount: bigint
  ) => {
    setError(null)
    setIsLoading(true)
    try {
      if (!walletClient) {
        const errorMsg =
          'Wallet client is not ready. Please click approve button again or connect your wallet.'
        setError(errorMsg)
        throw new Error(errorMsg)
      }
      const owner = walletClient.account?.address
      if (!owner) {
        const errorMsg = 'No account available from wallet client.'
        setError(errorMsg)
        throw new Error(errorMsg)
      }
      return await handleEthereumUSDTApprove({
        tokenAddress,
        owner,
        spender,
        amount,
        publicClient,
        walletClient
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Authorization operation failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }
  return { handleApprove, error, isLoading }
}
