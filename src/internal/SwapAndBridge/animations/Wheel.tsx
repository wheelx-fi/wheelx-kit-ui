'use client'

import { Box, BoxProps } from '@chakra-ui/react'

const wheelAnimationCss = `
  @keyframes widget-wheel-rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @keyframes widget-wheel-rotate-reverse {
    from {
      transform: rotate(360deg);
    }

    to {
      transform: rotate(0deg);
    }
  }

  @keyframes widget-wheel-pulse {
    0%, 100% {
      opacity: 0.55;
      transform: scale(0.94);
    }

    50% {
      opacity: 1;
      transform: scale(1.04);
    }
  }
`

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
      display="flex"
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <style>{wheelAnimationCss}</style>
      <Box
        position="relative"
        w="100%"
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          position="absolute"
          inset="8%"
          borderRadius="full"
          border="3px solid rgba(124, 58, 237, 0.14)"
        />
        <Box
          position="absolute"
          inset="8%"
          borderRadius="full"
          border="3px solid transparent"
          borderTopColor="#7C3AED"
          borderRightColor="#38BDF8"
          style={{
            animation: 'widget-wheel-rotate 1.15s linear infinite'
          }}
        />
        <Box
          position="absolute"
          inset="19%"
          borderRadius="full"
          border="2px solid transparent"
          borderBottomColor="rgba(95, 194, 171, 0.95)"
          borderLeftColor="rgba(95, 194, 171, 0.55)"
          style={{
            animation: 'widget-wheel-rotate-reverse 1.6s linear infinite'
          }}
        />
        <Box
          w="42%"
          h="42%"
          borderRadius="full"
          background="radial-gradient(circle at 30% 30%, rgba(255,255,255,0.96), rgba(95,194,171,0.95) 34%, rgba(59,130,246,0.72) 100%)"
          boxShadow="0 0 0 10px rgba(95, 194, 171, 0.1)"
          style={{
            animation: 'widget-wheel-pulse 1.35s ease-in-out infinite'
          }}
        />
      </Box>
    </Box>
  )
}
