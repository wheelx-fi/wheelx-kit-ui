import { TokenInfo } from '../api'

export interface ChainInfoShort {
  name: string
  rpc_url: string
  rpc_fallback: string[]
  chain_icon: string
  chain_id: number
  platform_id?: number
}
export function countLeadingZerosAfterDecimal(numStr: string): number {
  if (!numStr.includes('.')) return 0

  const [, decimalPart] = numStr.split('.')
  const firstNonZeroIndex = decimalPart.search(/[1-9]/)

  if (firstNonZeroIndex === -1) return 0
  return firstNonZeroIndex
}
export function findItemByName(
  arr: Array<ChainInfoShort>,
  targetName: string
): [boolean, ChainInfoShort | undefined] {
  const foundItem = arr.find(
    (item) =>
      item.name.replace(/\s+/g, '').toLowerCase() ===
      targetName.replace(/\s+/g, '').toLowerCase()
  )
  return [foundItem !== undefined, foundItem]
}
export function findItemBySymbol(
  arr: Array<TokenInfo>,
  targetName: string,
  chainId: number | undefined,
  platform_id?: number | undefined
): [boolean, TokenInfo | undefined] {
  const foundItem = arr.find((item) => {
    if (platform_id && platform_id > 0) {
      return (
        item.symbol.replace(/\s+/g, '').toLowerCase() ===
          targetName.replace(/\s+/g, '').toLowerCase() &&
        item.platform_id === platform_id
      )
    } else {
      return (
        item.symbol.replace(/\s+/g, '').toLowerCase() ===
          targetName.replace(/\s+/g, '').toLowerCase() &&
        item.chain_id === chainId
      )
    }
  })
  return [foundItem !== undefined, foundItem]
}

export function getBaseUrl(): string {
  return window.location.origin + window.location.pathname
}

/**
 * Formats a number with appropriate units (K for thousands, M for millions),
 * displaying integers without decimal parts for whole numbers and removing trailing zeros in decimals.
 * @param num - The number to be formatted.
 * @returns The formatted string with unit suffix if applicable.
 */
export function formatNumberWithUnits(num: number): string {
  if (num < 100000) {
    // For numbers less than 100,000: display integers directly, decimals as-is but remove trailing zeros
    const numStr = num.toString()
    return numStr.includes('.') ? numStr.replace(/\.?0+$/, '') : numStr
  } else if (num < 1000000) {
    // Between 100,000 and 1,000,000: convert to K (thousands) unit
    const valueInK = num / 1000
    // Display as XK for integers, X.XXK for decimals (remove trailing zeros)
    const formatted =
      valueInK % 1 === 0
        ? `${valueInK}K`
        : `${valueInK.toFixed(2)}K`.replace(/\.?0+K$/, 'K')
    return formatted
  } else {
    // For 1,000,000 and above: convert to M (millions) unit
    const valueInM = num / 1000000
    // Display as XM for integers, X.XXXM for decimals (remove trailing zeros)
    const formatted =
      valueInM % 1 === 0
        ? `${valueInM}M`
        : `${valueInM.toFixed(3)}M`.replace(/\.?0+M$/, 'M')
    return formatted
  }
}

/**
 * Formats a numeric string to have at most 3 decimal places with rounding.
 * Preserves existing decimals if less than or equal to 3, shows integer if no decimals.
 * @param numericString - The string representation of the number to format.
 * @returns Formatted string with appropriate decimal places (rounded if necessary).
 * @throws Error if the input string is not a valid number.
 */
export function formatDecimalStringWithRounding(numericString: string): string {
  // Convert the input string to a number
  const numberValue = parseFloat(numericString)

  // Check if the conversion resulted in a valid number
  if (isNaN(numberValue)) {
    throw new Error(
      'Invalid numeric string provided. Input must be a valid number.'
    )
  }

  // Find the position of the decimal point in the original string
  const decimalIndex = numericString.indexOf('.')

  // If there's no decimal point, return the string as it represents an integer
  if (decimalIndex === -1) {
    return numericString
  }

  // Calculate the number of decimal places in the original string
  const decimalPlaces = numericString.length - decimalIndex - 1

  let result: string

  // If there are 3 or fewer decimal places, use the original string
  if (decimalPlaces <= 3) {
    result = numericString
  } else {
    // Use toFixed(3) to round and keep exactly 3 decimal places
    result = numberValue.toFixed(3)
  }

  // Remove trailing zeros after the decimal point[6,8](@ref)
  // If all decimals are zeros, remove the decimal point as well
  result = result.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1')

  return result
}
