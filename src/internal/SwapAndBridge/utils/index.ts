export * from './getErc20Approval'
export * from './debounce'
export * from './slippage'
export * from './consts'

export const bridgeAutoSlippage = 0
export const swapAutoSlippage = 50
export const crossChainSwapAutoSlippage = 200

function formatNumberAmerican(value: number, maximumFractionDigits = 6): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits
  }).format(value)
}

export function formatDecimalNum(
  num: number,
  fixedDecimals = 8
): number | string {
  const numStr = num.toString()
  const decimalPart = numStr.split('.')[1]
  if (!decimalPart || decimalPart.length <= fixedDecimals) {
    if (num > 100000) {
      return formatNumberAmerican(num, 6)
    }
    return num
  } else {
    if (num > 0.000001) {
      if (num > 100000) {
        return formatNumberAmerican(num, 6)
      }
      return parseFloat(num.toFixed(fixedDecimals))
    } else {
      return formatSmallNumber(num)
    }
  }
}

export function formatSmallNumber(num: number | string): string {
  let actualNum: number
  if (typeof num === 'string') {
    if (num.includes('e') || num.includes('E')) {
      const sciRegex = /^([-+]?\d*\.?\d+)([eE][-+]?\d+)$/
      const match = num.match(sciRegex)
      if (match) {
        const base = parseFloat(match[1])
        const exponent = parseInt(match[2].slice(1), 10)
        actualNum = base * Math.pow(10, exponent)
      } else {
        actualNum = parseFloat(num)
      }
    } else {
      actualNum = parseFloat(num)
    }
    if (isNaN(actualNum)) {
      return 'Invalid number'
    }
  } else {
    actualNum = num
  }
  const absNum = Math.abs(actualNum)
  const isNegative = actualNum < 0
  if (absNum === 0) {
    return '0'
  }
  const exponent = Math.floor(Math.log10(absNum))
  const coefficient = absNum / Math.pow(10, exponent)
  const coefficientStr = coefficient.toPrecision(4)
  const digits = coefficientStr.replace('.', '')
  const zeroCount = -exponent - 1
  const subscriptZeros = toSubscriptNumber(zeroCount)
  const prefix = isNegative ? '-' : ''
  return `${prefix}0.0${subscriptZeros}${digits}`
}

export function toSubscriptNumber(num: number): string {
  const digits = num.toString().split('')
  const subscriptDigits = digits.map((d) => {
    switch (d) {
      case '0':
        return '₀'
      case '1':
        return '₁'
      case '2':
        return '₂'
      case '3':
        return '₃'
      case '4':
        return '₄'
      case '5':
        return '₅'
      case '6':
        return '₆'
      case '7':
        return '₇'
      case '8':
        return '₈'
      case '9':
        return '₉'
      default:
        return d
    }
  })
  return subscriptDigits.join('')
}

export function extractVPathSegment(): string | null {
  try {
    const url = window?.location.href
    if (!url) {
      return null
    }
    const parsedUrl = new URL(url)
    const pathname = parsedUrl.pathname
    const match = pathname.match(/^\/v\/([^/]+)(?=\/|$)/)
    return match ? decodeURIComponent(match[1]) : null
  } catch (error) {
    console.error('Invalid URL:', error)
    return null
  }
}

export function isValueInArray(arr: number[], value: number): boolean {
  return arr.includes(value)
}

type TokenAmount = string | number

export function toUSDCBigint(amount: TokenAmount, decimals = 6): bigint {
  const amountStr = String(amount).replace(/,/g, '')
  const [integerPart, decimalPart = ''] = amountStr.split('.')
  const combined = integerPart + decimalPart
  const padded = combined.padEnd(decimals, '0').substring(0, decimals)

  return BigInt(padded)
}

export function toBigInt(
  balance: string | number,
  decimals: number = 6
): bigint {
  const balanceStr = typeof balance === 'number' ? balance.toString() : balance
  const [integerPart, decimalPart = ''] = balanceStr.split('.')

  const integerBigInt = BigInt(integerPart)
  const neededDecimalDigits = Math.min(decimalPart.length, decimals)
  const trimmedDecimal = decimalPart.slice(0, neededDecimalDigits)
  const paddedDecimal = trimmedDecimal.padEnd(decimals, '0')
  const decimalBigInt = BigInt(paddedDecimal)

  const multiplier = BigInt(10 ** decimals)
  return integerBigInt * multiplier + decimalBigInt
}
