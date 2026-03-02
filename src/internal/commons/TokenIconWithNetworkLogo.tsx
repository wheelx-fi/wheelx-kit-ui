import { Box, Image, BoxProps, ConditionalValue } from '@chakra-ui/react'

import { TokenInfo } from '../api'
import { useChainsStore } from '../stores'
import defaultTokenIcon from '../assets/images/default-token-icon.png'
import { getAssetSrc } from '../utils/getAssetSrc'

interface TokenIconProps extends BoxProps {
  smallW?: ConditionalValue<number | string> | undefined
  smallH?: ConditionalValue<number | string> | undefined
  smallT?: ConditionalValue<number | string> | undefined
  smallB?: ConditionalValue<number | string> | undefined
  smallL?: ConditionalValue<number | string> | undefined
  smallR?: ConditionalValue<number | string> | undefined
  tokenInfo?: TokenInfo | null
  customChainLogo?: string
}

export const TokenIconWithNetworkLogo = ({
  tokenInfo,
  customChainLogo,
  w = {
    base: '28px',
    md: '32px'
  },
  h = {
    base: '28px',
    md: '32px'
  },
  smallW = {
    base: 3,
    md: 4
  },
  smallH = {
    base: 3,
    md: 4
  },
  smallB = -1,
  smallR = 0,
  pr = {
    base: '4px',
    md: '8px'
  },
  ...props
}: TokenIconProps) => {
  const { name, chain_id, logo, chain_icon } = tokenInfo ?? {}
  const { chains } = useChainsStore()
  const chain = chains?.find((item) => item.chain_id === chain_id)

  const networkLogo = customChainLogo || chain?.chain_icon || chain_icon || ''

  return (
    <Box
      pos={'relative'}
      w={w}
      h={h}
      pr={pr}
      boxSizing={'content-box'}
      {...props}
    >
      <Image
        w={w}
        h={h}
        borderRadius={'full'}
        src={logo || getAssetSrc(defaultTokenIcon)}
        alt={name || ''}
      />
      {networkLogo ? (
        <Image
          pos={'absolute'}
          bottom={smallB ? smallB : -1}
          right={smallR ? smallR : 0}
          src={networkLogo}
          alt={chain?.name ?? ''}
          w={smallW}
          h={smallH}
          borderRadius={'full'}
          border={'1px solid white'}
          bg={'white'}
        />
      ) : null}
    </Box>
  )
}
