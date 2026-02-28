import {
  Box,
  BoxProps,
  Tooltip as ChakraTooltip,
  Portal,
  useDisclosure
} from '@chakra-ui/react'
import * as React from 'react'
import { useWheelxWidgetStyles } from '../../config'

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
  content: React.ReactNode
  contentProps?: ChakraTooltip.ContentProps
  disabled?: boolean
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled = true,
      content,
      contentProps,
      portalRef,
      ...rest
    } = props

    if (disabled) return children

    const widgetStyles = useWheelxWidgetStyles()
    const tooltipContentStyles = widgetStyles.quoteTooltipContent || {}
    const tooltipBg =
      typeof tooltipContentStyles.bg === 'string'
        ? tooltipContentStyles.bg
        : typeof tooltipContentStyles.backgroundColor === 'string'
          ? tooltipContentStyles.backgroundColor
          : 'white'

    return (
      <ChakraTooltip.Root {...rest}>
        <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content
              ref={ref}
              color={'black'}
              css={{
                '--tooltip-bg': tooltipBg
              }}
              {...tooltipContentStyles}
              {...contentProps}
            >
              {showArrow && (
                <ChakraTooltip.Arrow>
                  <ChakraTooltip.ArrowTip />
                </ChakraTooltip.Arrow>
              )}
              {content}
            </ChakraTooltip.Content>
          </ChakraTooltip.Positioner>
        </Portal>
      </ChakraTooltip.Root>
    )
  }
)

type MobileTooltipProps = TooltipProps & {
  boxProps?: BoxProps
}

export const MobileTooltip = (props: MobileTooltipProps) => {
  const { boxProps, ...tooltipProps } = props
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <Tooltip open={open} {...tooltipProps}>
      <Box
        onClick={onOpen}
        onMouseLeave={onClose}
        onMouseEnter={onOpen}
        {...boxProps}
        fontSize={0}
      >
        {props.children}
      </Box>
    </Tooltip>
  )
}
