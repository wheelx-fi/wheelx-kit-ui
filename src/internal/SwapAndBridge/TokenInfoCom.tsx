import { HStack, VStack } from '@chakra-ui/react'

import { TokenInfo } from '../api'
import { useChainsStore } from '../stores'

import { TokenIconWithNetworkLogo } from '../commons/TokenIconWithNetworkLogo'
import { Heading, Text } from '../ui'
import { useWheelxWidgetStyles } from '../../config'

interface Props {
  tokenInfo: TokenInfo
}

export const TokenInfoCom = ({ tokenInfo }: Props) => {
  const widgetStyles = useWheelxWidgetStyles()
  const { chain_id, symbol, platform_id } = tokenInfo

  const { chains } = useChainsStore()
  const chainInfo = chains?.find((chain) => {
    if (platform_id && platform_id > 0) {
      return chain.platform_id === platform_id
    } else {
      return chain.chain_id === chain_id
    }
  })

  // console.log('#######chainInfo#########:', chainInfo)

  return (
    <HStack>
      <TokenIconWithNetworkLogo
        tokenInfo={tokenInfo}
        customChainLogo={chainInfo?.chain_icon}
      />
      <VStack align={'start'} gap={1} flex={1}>
        <Heading
          variant={{
            base: 'heading11',
            md: 'heading10'
          }}
          color={'brand-grey1'}
          lineClamp={1}
          wordBreak={'break-all'}
          {...widgetStyles.tokenPrimaryText}
        >
          {symbol}
        </Heading>
        <Text
          variant={{
            base: 'content9',
            md: 'content8'
          }}
          color={'brand-grey4'}
          lineClamp={1}
          wordBreak={'break-all'}
          {...widgetStyles.tokenSecondaryText}
        >
          {chainInfo?.name}
        </Text>
      </VStack>
    </HStack>
  )
}
