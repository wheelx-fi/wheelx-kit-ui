import { Box, BoxProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export const BoxWithBg = ({
  children,
  ...props
}: PropsWithChildren<BoxProps>) => {
  return (
    <Box w={'100%'} bg={'#F5F6FF'} borderRadius={'16px'} p={3} {...props}>
      {children}
    </Box>
  )
}
