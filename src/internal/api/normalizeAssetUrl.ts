import { BASE_API_URL } from './consts'

const ABSOLUTE_URL = /^(https?:)?\/\//i
const DATA_OR_BLOB_URL = /^(data:|blob:)/i

export const normalizeAssetUrl = (assetUrl?: string | null): string => {
  if (!assetUrl) return ''
  if (ABSOLUTE_URL.test(assetUrl) || DATA_OR_BLOB_URL.test(assetUrl)) {
    return assetUrl
  }

  const normalizedBase = BASE_API_URL.endsWith('/')
    ? BASE_API_URL
    : `${BASE_API_URL}/`
  return new URL(assetUrl, normalizedBase).toString()
}
