import { useState, useEffect } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'

interface RpcError {
  name?: string | undefined
  message?: string
  code?: string | number
  // Additional properties may exist depending on the RPC provider.
}

export function useRetryAbleTransactionReceipt(
  hash: `0x${string}` | undefined,
  chain_id: number, // Corrected parameter name: china_id -> chain_id
  maxRetries = 6
) {
  const [retryCount, setRetryCount] = useState(0)
  const [shouldRetry, setShouldRetry] = useState(false)
  const [lastError, setLastError] = useState<RpcError | null>(null)

  const result = useWaitForTransactionReceipt({
    hash: hash || undefined,
    chainId: chain_id
  })

  useEffect(() => {
    // Check whether the failure is retryable, such as RPC or transient network errors.
    if (result.isError) {
      const error = result.error as RpcError
      setLastError(error)

      // Detect RPC or network-level failures that are worth retrying.
      const isRpcError =
        error?.name === 'UnknownRpcError' ||
        error?.message?.includes('RPC endpoint') ||
        error?.message?.includes('HTTP client error') ||
        error?.code === 'NETWORK_ERROR' ||
        error?.code === 'TIMEOUT'

      // User rejection should not be retried.
      const isUserRejected =
        error?.code === 4001 ||
        error?.message?.includes('user rejected') ||
        error?.message?.includes('rejected the transaction')

      // Retry only while under the limit and the error is retryable.
      if (retryCount < maxRetries && isRpcError && !isUserRejected) {
        console.warn(
          `Retryable RPC error detected, scheduling retry ${retryCount + 1}/${maxRetries}...`,
          error.message
        )

        const delay = 1000 * Math.pow(2, retryCount) // Exponential backoff: 1s, 2s, 4s...
        const timer = setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          setShouldRetry((prev) => !prev) // Trigger the next retry attempt.
        }, delay)

        return () => clearTimeout(timer)
      } else if (retryCount >= maxRetries) {
        console.log(
          `Transaction receipt polling failed after reaching the retry limit (${maxRetries}).`,
          error
        )
      } else if (isUserRejected) {
        console.log('Transaction rejected by user. Skipping retries.', error)
      }
    }
  }, [result.isError, result.error, retryCount, maxRetries])

  // Reset retry state after a successful receipt fetch.
  useEffect(() => {
    if (result.isSuccess) {
      setRetryCount(0)
      setLastError(null)
    }
  }, [result.isSuccess])

  // Return early when there is no transaction hash to poll.
  if (!hash) {
    return {
      ...result,
      retryCount: 0,
      isMaxRetriesExceeded: false,
      lastError: null
    }
  }

  return {
    ...result,
    retryCount,
    shouldRetry,
    isMaxRetriesExceeded: result.isError && retryCount >= maxRetries,
    lastError
  }
}
