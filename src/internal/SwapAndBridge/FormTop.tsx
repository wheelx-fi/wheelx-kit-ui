import { Box } from '@chakra-ui/react'
import { HStack } from '@chakra-ui/react'

import { SlippageSettings } from './SlippageSettings'
import { Heading } from '../ui'
import { useRefreshLoading } from './hooks/useRefreshLoading'
import { QuoteInfo } from './MainForm'
import loaderMask from '../assets/images/loader.png'
import { getAssetSrc } from '../utils/getAssetSrc'
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
          <Box
            w="22px"
            h="22px"
            position="relative"
            maskImage={`url(${getAssetSrc(loaderMask)})`}
            maskPosition={'center center'}
            maskRepeat={'no-repeat'}
            maskSize={'100%'}
            top={'1px'}
            cursor={'pointer'}
            onClick={() => {
              refetchQuote()
            }}
            className="animation-loading"
            animationName={isLoadingRefresh ? 'keyframes-loading' : undefined}
          >
            <svg
              height="24"
              width="24"
              style={{
                backgroundColor: '#81728C',
                stroke: 'rgb(185, 206, 252)',
                strokeDasharray: '0, 101',
                fill: 'none',
                transform: 'translate(-50%, -50%) rotate(-91deg)',
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '22px',
                height: '22px',
                transition: 'background-color 0.15ms',
                animation:
                  isLoadingRefresh || !quoteInfo?.request_id
                    ? undefined
                    : 'svg_loader 30s linear 0s infinite normal'
              }}
            >
              <circle cx="50%" cy="50%" r="50%" strokeWidth="100%"></circle>
            </svg>
          </Box>
        </HStack>
        <SlippageSettings refetchQuote={refetchQuote} />
      </HStack>
    </HStack>
  )
}
