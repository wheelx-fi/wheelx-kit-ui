import { HStack, Icon } from '@chakra-ui/react'
import { FiRefreshCw } from 'react-icons/fi'

import { SlippageSettings } from './SlippageSettings'
import { Heading } from '../ui'
import { useRefreshLoading } from './hooks/useRefreshLoading'
import { QuoteInfo } from './MainForm'
import { useWheelxWidgetStyles } from '../../config'

export interface RefetchQuoteParams {
  slippageValue?: string
  isAutoSlippage?: boolean
}

export interface Props {
  refetchQuote: (params?: RefetchQuoteParams) => void
  quoteInfo?: QuoteInfo
}
export const FormTop = ({ refetchQuote, quoteInfo }: Props) => {
  const { isLoading: isLoadingRefresh } = useRefreshLoading()
  const widgetStyles = useWheelxWidgetStyles()

  return (
    <HStack justify={'space-between'} w={'100%'}>
      <Heading
        variant={{
          base: 'heading11',
          md: 'heading9'
        }}
        {...widgetStyles.formTitleText}
      >
        Bridge & Swap
      </Heading>
      <HStack color={'#81728C'}>
        <HStack
          w={'24px'}
          h={'24px'}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          background={'transparent'}
        >
          <Icon
            as={FiRefreshCw}
            boxSize={'22px'}
            cursor={'pointer'}
            onClick={() => {
              refetchQuote()
            }}
            className="animation-loading"
            animationName={isLoadingRefresh ? 'keyframes-loading' : undefined}
            color={'#81728C'}
            style={{
              animation:
                isLoadingRefresh || !quoteInfo?.request_id
                  ? undefined
                  : 'svg_loader 30s linear 0s infinite normal'
            }}
          />
        </HStack>
        <SlippageSettings refetchQuote={refetchQuote} />
      </HStack>
    </HStack>
  )
}
