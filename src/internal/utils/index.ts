import { getLocalStorage } from './localstorage'

export * from './address'
export * from './format'
export * from './logger'
export * from './consts'
export * from './localstorage'
export * from './getTxLink'

export const uniqueArray = (array: string[]): string[] => {
  return array.filter(
    (item, index, self) => index === self.findIndex((t) => t === item)
  )
}

export function enableTestnet() {
  const enabledInStorage = getLocalStorage('enableTestnet') === 'true'
  if (enabledInStorage) return true
  return process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
}

export interface ApproveInfo {
  spender: string
  amount: bigint
  token: string
}

export function isApproveValid(approve: ApproveInfo | null): boolean {
  return (
    approve != null &&
    typeof approve === 'object' &&
    Object.keys(approve).length > 0 &&
    approve.amount !== undefined &&
    approve.spender !== undefined &&
    approve.token !== undefined
  )
}

export function isValidWeb3TokenAddress(address: string) {
  if (typeof address !== 'string' || !address.startsWith('0x')) {
    return false
  }
  const hexPart = address.substring(2)
  const hexRegex = /^[0-9A-Fa-f]{40}$/
  return hexRegex.test(hexPart)
}
