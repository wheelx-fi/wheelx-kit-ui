export const sliceAddress = (
  address?: `0x${string}` | string,
  startLength: number = 4,
  endLength: number = 4
) => {
  if (!address) return ''

  if (address.length <= startLength + endLength) {
    return address
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}
