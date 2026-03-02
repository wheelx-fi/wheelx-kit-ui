export async function withRetry<T>(
  task: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  exponentialBackoff: boolean = true,
  onRetry?: (attempt: number, error: unknown) => void
): Promise<T> {
  let attempts = 0
  let lastError: unknown

  while (attempts <= maxRetries) {
    try {
      if (attempts > 0) {
        const delay = exponentialBackoff
          ? baseDelayMs * Math.pow(2, attempts - 1)
          : baseDelayMs
        console.log(`try again #${attempts}, wait ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
      return await task()
    } catch (error) {
      lastError = error
      attempts++
      if (onRetry) {
        onRetry(attempts, error)
      }
      console.log(`try again#${attempts} fail:`, error)
      if (attempts > maxRetries) {
        // Preserve a hook point if retry metadata needs to be attached before rethrowing.
        if (lastError && typeof lastError === 'object') {
          // lastError.retryAttempts = attempts
        }
        break
      }
    }
  }

  throw lastError
}
