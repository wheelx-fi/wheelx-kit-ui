/**
 * Check if the error is a storage quota exceeded error
 */
export function isQuotaExceededError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.code === 22 ||
      err.code === 1014 ||
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}

/**
 * Check if localStorage is available (compatible with private browsing mode)
 */
export function isLocalStorageSupported(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false
  }

  const TEST_KEY = '__storage_test__'
  try {
    localStorage.setItem(TEST_KEY, 'test')
    localStorage.removeItem(TEST_KEY)
    return true
  } catch (e) {
    return isQuotaExceededError(e) // Private mode also triggers errors
  }
}

/**
 * Calculate the used space of localStorage (in character count)
 */
export function getLSUsedSpace(): number {
  if (typeof window === 'undefined' || !isLocalStorageSupported()) {
    return 0
  }

  return Object.keys(localStorage).reduce((total, curKey) => {
    if (!localStorage.hasOwnProperty(curKey)) {
      return total
    }
    // Sum of key and value character counts
    total += curKey.length + localStorage[curKey].length
    return total
  }, 0)
}

/**
 * Get detailed information about storage usage
 */
export interface StorageUsageInfo {
  used: number // Used bytes
  quota: number | null // Total quota (bytes), null means unknown
  percentage: number // Usage percentage
  usedFormatted: string // Formatted used size
  quotaFormatted: string // Formatted total size
}

export function getStorageUsage(): StorageUsageInfo {
  if (typeof window === 'undefined') {
    return {
      used: 0,
      quota: null,
      percentage: 0,
      usedFormatted: '0 B',
      quotaFormatted: 'Unknown'
    }
  }

  try {
    // Method 1: Precisely calculate used space
    const usedBytes = getLSUsedSpace()

    // Assume standard limit of 5MB (5 * 1024 * 1024 bytes)
    const defaultQuota = 5 * 1024 * 1024
    const percentage = Math.round((usedBytes / defaultQuota) * 100)

    // Format bytes to human-readable format
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 B'
      if (bytes < 1024) {
        return `${bytes} B`
      } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`
      } else {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
      }
    }

    return {
      used: usedBytes,
      quota: defaultQuota,
      percentage: Math.min(percentage, 100),
      usedFormatted: formatBytes(usedBytes),
      quotaFormatted: formatBytes(defaultQuota)
    }
  } catch (error) {
    console.error('Failed to get storage usage:', error)
    return {
      used: 0,
      quota: null,
      percentage: 0,
      usedFormatted: '0 B',
      quotaFormatted: 'Unknown'
    }
  }
}

/**
 * Check if there is enough storage space for new data
 */
export function checkStorageSpace(dataSize: number): {
  isSufficient: boolean
  message?: string
  usage?: StorageUsageInfo
} {
  if (typeof window === 'undefined') {
    return {
      isSufficient: false,
      message: 'Non-browser environment'
    }
  }

  // Check if localStorage is available
  if (!isLocalStorageSupported()) {
    return {
      isSufficient: false,
      message: 'Browser does not support local storage or is in private mode'
    }
  }

  try {
    const usage = getStorageUsage()

    if (usage.quota !== null && usage.used + dataSize > usage.quota) {
      return {
        isSufficient: false,
        message: `Local storage space insufficient. Used: ${usage.usedFormatted}, Limit: ${usage.quotaFormatted}`,
        usage
      }
    }

    // If usage exceeds 80%, give warning but don't block operation
    if (usage.percentage > 80) {
      return {
        isSufficient: true,
        message: `Storage usage is high: ${usage.percentage}%`,
        usage
      }
    }

    return {
      isSufficient: true,
      usage
    }
  } catch (error) {
    console.error('Failed to check storage space:', error)
    return {
      isSufficient: false,
      message: 'Error occurred while checking storage space'
    }
  }
}

/**
 * Safely store data, will check if there is enough space
 */
export function safeSetItem(
  key: string,
  data: unknown
): {
  success: boolean
  message?: string
  error?: Error
} {
  try {
    // Estimate data size
    const dataStr = JSON.stringify(data)
    const dataSize = new TextEncoder().encode(dataStr).length

    // Check storage space
    const spaceCheck = checkStorageSpace(dataSize)
    if (!spaceCheck.isSufficient) {
      return {
        success: false,
        message: spaceCheck.message
      }
    }

    // Attempt to store
    localStorage.setItem(key, dataStr)
    return { success: true }
  } catch (error) {
    if (isQuotaExceededError(error)) {
      return {
        success: false,
        message:
          'Local storage space is full, unable to save data. Please clear browser cache.',
        error: error as Error
      }
    }
    return {
      success: false,
      message: 'Unknown error occurred while storing data',
      error: error as Error
    }
  }
}

/**
 * Safely retrieve data, includes error handling
 */
export function safeGetItem<T>(key: string): {
  data: T | null
  success: boolean
  error?: Error
} {
  try {
    if (!isLocalStorageSupported()) {
      throw new Error('localStorage not available')
    }

    const item = localStorage.getItem(key)
    if (!item) {
      return { data: null, success: true }
    }

    const data = JSON.parse(item) as T
    return { data, success: true }
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error as Error
    }
  }
}

/**
 * Clear all stored data (dangerous operation, use with caution)
 */
export function clearAllStorage(): { success: boolean; message?: string } {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear()
      return { success: true }
    }
    return { success: false, message: 'localStorage not available' }
  } catch (error) {
    return {
      success: false,
      message: `Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
