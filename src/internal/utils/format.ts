import { Fraction, RoundingMode } from 'bi-fraction'

interface FormatTokenAmountProps {
  amount: Fraction
  decimals?: number
  fixedDecimals?: number
  useGroupSeparator?: boolean
}

export const formatTokenAmount = ({
  amount,
  decimals = 18,
  fixedDecimals = 6,
  useGroupSeparator = true
}: FormatTokenAmountProps) => {
  const isZeroDecimals = decimals === 0
  // if decimals is less than 8, use 6 fixed decimals, otherwise use the fixed decimals
  const _fixedDecimals = decimals > 6 ? fixedDecimals : 6

  const result = amount.shr(decimals).toFixed(isZeroDecimals ? 18 : decimals)

  const [integerPart, decimalPart] = result.split('.')

  if (!decimalPart || decimalPart === '0') {
    return integerPart
  }

  const firstNonZeroIndex = decimalPart.search(/[1-9]/)
  if (firstNonZeroIndex === -1) {
    return integerPart
  }

  if (firstNonZeroIndex >= _fixedDecimals) {
    const displayDecimals = firstNonZeroIndex + 3
    return useGroupSeparator
      ? amount
          .shr(decimals)
          .toFormat({
            decimalPlaces: displayDecimals,
            roundingMode: RoundingMode.ROUND_DOWN,
            trailingZeros: false
          })
          .replace(/\.?0+$/, '')
      : amount
          .shr(decimals)
          .toFixed(displayDecimals, {
            roundingMode: RoundingMode.ROUND_DOWN,
            trailingZeros: false
          })
          .replace(/\.?0+$/, '')
  }

  return useGroupSeparator
    ? amount
        .shr(decimals)
        .toFormat({
          decimalPlaces: _fixedDecimals,
          roundingMode: RoundingMode.ROUND_DOWN,
          trailingZeros: false
        })
        .replace(/\.?0+$/, '')
    : amount
        .shr(decimals)
        .toFixed(_fixedDecimals, {
          roundingMode: RoundingMode.ROUND_DOWN,
          trailingZeros: false
        })
        .replace(/\.?0+$/, '')
}

export const formatDate = (dateString: string) => {
  const dateTime = new Date(dateString)
  const month = String(dateTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(dateTime.getUTCDate()).padStart(2, '0')
  const year = dateTime.getUTCFullYear()
  const hours = String(dateTime.getUTCHours()).padStart(2, '0')
  const minutes = String(dateTime.getUTCMinutes()).padStart(2, '0')
  const seconds = String(dateTime.getUTCSeconds()).padStart(2, '0')

  const formattedTime = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`

  return formattedTime
}

export const dateFormatter = (isoString: string) => {
  const date = new Date(isoString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
}
