import { Image, type ImageProps } from '@chakra-ui/react'

import { getAssetSrc } from '../utils/getAssetSrc'

type AssetSource = string | { src: string }

interface AssetIconProps extends Omit<ImageProps, 'src'> {
  src: AssetSource
  alt?: string
}

export const AssetIcon = ({
  src,
  alt = '',
  display = 'inline-block',
  flexShrink = 0,
  ...props
}: AssetIconProps) => {
  return (
    <Image
      src={getAssetSrc(src)}
      alt={alt}
      display={display}
      flexShrink={flexShrink}
      {...props}
    />
  )
}
