const DEFAULT_BASE_API_URL = 'https://api.wheelx.fi'

const normalizeBaseApiUrl = (url: string): string => {
  return url
    .replace('dev-api.wheelx.com', 'api.wheelx.fi')
    .replace('dev-api.wheelx.fi', 'api.wheelx.fi')
}

export const BASE_API_URL = normalizeBaseApiUrl(
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_API_URL
)
