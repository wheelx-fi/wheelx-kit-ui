import { Box, BoxProps } from '@chakra-ui/react'

export const Wheel = ({ ...props }: BoxProps) => {
  return (
    <Box
      w={{
        base: '96px',
        md: '140px'
      }}
      h={{
        base: '96px',
        md: '140px'
      }}
      {...props}
    >
      <svg viewBox="0, 0, 280, 280" style={{ width: '100%' }}>
        <foreignObject width="280" height="280">
          <div className="animation-wheel"></div>
        </foreignObject>
      </svg>
    </Box>
  )
}
