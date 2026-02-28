import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  InputGroup,
  Popover,
  Portal
} from '@chakra-ui/react'

import { MobileTooltip } from '../ui/tooltip'
import InfoIcon from '../assets/icons/info.svg?url'
import { useSwapAndBridgeContextStore } from './hooks'
import { Heading, Text } from '../ui'
import { slippageStore } from '../utils'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { FiSettings } from 'react-icons/fi'
import { Props } from './FormTop'
import { useChainsStore } from '../stores'
import {
  bridgeAutoSlippage,
  swapAutoSlippage,
  crossChainSwapAutoSlippage
} from './utils/index'
import { useWheelxWidgetStyles } from '../../config'
import { AssetIcon } from '../ui/AssetIcon'

export const SlippageSettings = ({ refetchQuote }: Props) => {
  const widgetStyles = useWheelxWidgetStyles()
  const slippageTriggerStyles = widgetStyles.slippageSettingsTrigger || {}
  const slippageAutoButtonStyles = widgetStyles.slippageAutoButton || {}
  const slippageCustomInputStyles = widgetStyles.slippageCustomInput || {}
  const slippageTitleTextStyles = widgetStyles.slippageTitleText || {}
  const slippageDescriptionTextStyles =
    widgetStyles.slippageDescriptionText || {}
  const slippageButtonTextStyles = widgetStyles.slippageButtonText || {}
  const { address } = useAccount()
  const {
    slippage,
    setSlippage,
    fromTokenInfo,
    toTokenInfo,
    autoSlippage,
    setAutoSlippage
  } = useSwapAndBridgeContextStore()
  const { chains } = useChainsStore()

  const isAuto = slippage === undefined

  useEffect(() => {
    if (address) {
      const slippage = slippageStore.get(address)
      if (slippage && slippage.value) {
        setSlippage(parseFloat(slippage.value).toString())
      } else {
        setSlippage(undefined)
      }
    }
  }, [address, setSlippage])

  const handleChangeSlippage = ({ value }: { value: string }) => {
    if (value === 'auto') {
      setSlippage(undefined)
      if (address) {
        slippageStore.remove(address)
        if (fromTokenInfo && toTokenInfo) {
          let currentSlippage = autoSlippage
          if (fromTokenInfo.chain_id === toTokenInfo.chain_id) {
            setAutoSlippage(swapAutoSlippage)
            currentSlippage = swapAutoSlippage
          } else {
            const fromChainInfo = chains?.find(
              (chain) => chain.chain_id === fromTokenInfo.chain_id
            )
            const toChainInfo = chains?.find(
              (chain) => chain.chain_id === toTokenInfo.chain_id
            )
            const from_eth = fromTokenInfo.address == fromChainInfo?.eth_token
            const to_eth = toTokenInfo.address == toChainInfo?.eth_token
            if (from_eth && to_eth) {
              setAutoSlippage(bridgeAutoSlippage)
              currentSlippage = bridgeAutoSlippage
            } else {
              setAutoSlippage(crossChainSwapAutoSlippage)
              currentSlippage = crossChainSwapAutoSlippage
            }
          }
          refetchQuote({
            isAutoSlippage: true,
            slippageValue: (currentSlippage / 100).toString()
          })
        }
      }
    } else {
      if (value === '' || /^\d*(\.\d{0,2})?$/.test(value)) {
        setSlippage(value)
        if (address) {
          slippageStore.set(address, { value })
          if (value) {
            refetchQuote({ slippageValue: value })
          }
        }
      }
    }
  }

  return (
    <Popover.Root positioning={{ placement: 'bottom-end' }} autoFocus={false}>
      <Popover.Trigger>
        <HStack cursor={'pointer'} {...slippageTriggerStyles}>
          <Icon
            as={FiSettings}
            boxSize={{
              base: '20px',
              md: '22px'
            }}
            color={'#81728C'}
          />
        </HStack>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w={{
              base: '140px',
              md: '170px'
            }}
            boxShadow={'0px 4px 12px 0px #545AB4'}
            borderRadius={'12px'}
            {...widgetStyles.slippagePopoverContent}
          >
            <Popover.Body
              p={{
                base: 2,
                md: 3
              }}
            >
              <Popover.Title>
                <HStack color={'brand-grey4'}>
                  <Heading
                    variant={{
                      base: 'heading13',
                      md: 'heading11'
                    }}
                    {...slippageTitleTextStyles}
                  >
                    Slippage Tolerance
                  </Heading>
                  <MobileTooltip
                    contentProps={{
                      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)'
                    }}
                    content={
                      <Text
                        variant={{
                          base: 'content8',
                          md: 'content7'
                        }}
                        p={4}
                        lineHeight={1.2}
                        color={'brand-grey4'}
                        {...slippageDescriptionTextStyles}
                      >
                        If the price changes unfavorably by more than the
                        entered percentage, the transaction will be reverted.
                      </Text>
                    }
                    openDelay={100}
                    closeDelay={100}
                    interactive
                  >
                    <AssetIcon src={InfoIcon} alt="info" boxSize={'10px'} />
                  </MobileTooltip>
                </HStack>
              </Popover.Title>

              <HStack mt={2}>
                <Button
                  h={'26px'}
                  border={'1px solid'}
                  borderColor={isAuto ? '#8143FF' : '#B5B5B5'}
                  bg={isAuto ? '#8143FF' : 'white'}
                  color={isAuto ? 'white' : '#81728C'}
                  px={2}
                  py={0.5}
                  variant={'outline'}
                  borderRadius={'4px'}
                  onClick={() => handleChangeSlippage({ value: 'auto' })}
                  {...slippageAutoButtonStyles}
                >
                  <Text
                    variant={{
                      base: 'content9',
                      md: 'content8'
                    }}
                    {...slippageButtonTextStyles}
                  >
                    Auto
                  </Text>
                </Button>

                <Box>
                  <InputGroup
                    endElement={'%'}
                    endElementProps={{
                      pr: 2,
                      fontSize: {
                        base: '10px',
                        md: '12px'
                      }
                    }}
                  >
                    <Input
                      id="slippage-input"
                      width="76px"
                      borderRadius={'md'}
                      h={'26px'}
                      px={3}
                      style={{ paddingInlineEnd: 20 }}
                      placeholder={'Custom'}
                      fontSize={{
                        base: '10px',
                        md: '12px'
                      }}
                      fontWeight={400}
                      textAlign={'center'}
                      borderColor={isAuto ? '#B5B5B5' : '#8143FF'}
                      _focus={{
                        borderColor: '#8143FF',
                        outlineWidth: '0px'
                      }}
                      autoComplete="off"
                      inputMode="decimal"
                      type="text"
                      value={
                        slippage
                          ? slippage.toString()
                          : autoSlippage || autoSlippage === 0
                            ? (autoSlippage / 100).toString()
                            : ''
                      }
                      onFocus={() => {
                        setAutoSlippage(undefined)
                      }}
                      onChange={(e) =>
                        handleChangeSlippage({ value: e.target.value })
                      }
                      {...slippageCustomInputStyles}
                    />
                  </InputGroup>
                </Box>
              </HStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
