type AssetSource = string | { src: string }

export const getAssetSrc = (asset: AssetSource): string => {
  return typeof asset === 'string' ? asset : asset.src
}
