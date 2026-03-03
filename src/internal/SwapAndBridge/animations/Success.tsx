'use client'

import { Box, BoxProps } from '@chakra-ui/react'

const successAnimationCss = `
  @keyframes widget-success-circle-in {
    0% {
      opacity: 0;
      transform: scale(0.46);
    }

    55% {
      opacity: 1;
      transform: scale(1.14);
    }

    74% {
      opacity: 1;
      transform: scale(0.94);
    }

    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes widget-success-glow-pulse {
    0% {
      opacity: 0.18;
      transform: scale(0.78);
    }

    100% {
      opacity: 0;
      transform: scale(1.22);
    }
  }

  @keyframes widget-success-check-reveal {
    0% {
      opacity: 0;
      transform: scale(0.42) rotate(-10deg);
    }

    58% {
      opacity: 1;
      transform: scale(1.16) rotate(3deg);
    }

    80% {
      opacity: 1;
      transform: scale(0.92) rotate(-2deg);
    }

    100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }
`

export const Success = ({ ...props }: BoxProps) => {
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
      <svg
        viewBox="0 0 140 140"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{successAnimationCss}</style>
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="#5FC2AB"
          opacity="0.18"
          style={{
            transformOrigin: '50% 50%',
            animation: 'widget-success-glow-pulse 850ms ease-out forwards'
          }}
        />
        <circle
          cx="70"
          cy="70"
          r="44"
          fill="#5FC2AB"
          style={{
            transformOrigin: '50% 50%',
            animation:
              'widget-success-circle-in 720ms cubic-bezier(0.22, 1.12, 0.28, 1) forwards'
          }}
        />
        <path
          d="M47 72.5L61.5 86L94 50"
          stroke="white"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            transformOrigin: '50% 50%',
            animation:
              'widget-success-check-reveal 520ms cubic-bezier(0.2, 1.06, 0.3, 1) 180ms forwards'
          }}
        />
      </svg>
    </Box>
  )
}
