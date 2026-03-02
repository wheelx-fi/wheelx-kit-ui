import { defineRecipe } from '@chakra-ui/react'

export const buttonRecipe = defineRecipe({
  base: {
    borderRadius: '8px'
  },
  variants: {
    colorPalette: {
      lightBlue: {
        bg: 'rgb(90 127 242)',
        color: 'white',
        _hover: { bg: 'color-mix(in srgb, rgb(90 127 242) 90%, transparent)' }
      },
      blue: {
        bg: 'rgba(0,82,255,1)',
        color: 'white',
        _hover: { bg: 'color-mix(in srgb, rgba(0,82,255,1) 90%, transparent)' }
      },
      red: {
        bg: 'rgba(255,4,33,1)',
        color: 'white',
        _hover: { bg: 'color-mix(in srgb, rgba(255,4,33,1) 90%, transparent)' }
      },
      lightCyan: {
        bg: '#067eb7',
        color: 'white',
        _hover: { bg: 'color-mix(in srgb, #067eb7 90%, transparent)' }
      },
      black: {
        bg: 'blackAlpha.900',
        color: 'white',
        _hover: {
          bg: 'color-mix(in srgb, var(--chakra-colors-black-alpha-900) 90%, transparent)'
        }
      },
      pink: {
        bg: '#f50cb4',
        color: 'white',
        _hover: { bg: 'color-mix(in srgb, #f50cb4 90%, transparent)' }
      },
      green: {
        bg: '#09cd6e',
        color: 'white',
        _hover: { bg: 'color-mix(in srgb, #09cd6e 90%, transparent)' }
      },
      orange: {
        bg: '#f25d00',
        color: 'white',
        _hover: { bg: 'color-mix(in srgb, #f25d00 90%, transparent)' }
      },
      teal: {
        bg: '#98fbe5',
        color: 'blackAlpha.900',
        _hover: { bg: 'color-mix(in srgb, #98fbe5 90%, transparent)' }
      },
      purple: {
        bg: '#8143FF',
        color: 'white',
        _hover: { bg: 'color-mix(in srgb, #8143FF 90%, transparent)' }
      },
      yellow900: {
        bg: '#F6FF09',
        color: '#083286',
        _hover: { bg: 'color-mix(in srgb, #F6FF09 90%, transparent)' }
      },
      green800: {
        bg: '#00AB00',
        color: 'white',
        _hover: { bg: 'color-mix(in srgb, #00AB00 90%, transparent)' }
      },
      blue600: {
        bg: '#02FEFF',
        color: '#5E7290',
        _hover: { bg: 'color-mix(in srgb, #02FEFF 90%, transparent)' }
      },
      blue900: {
        bg: '#02132f',
        color: '#fff',
        _hover: { bg: 'color-mix(in srgb, #02132f 90%, transparent)' }
      },
      blue1000: {
        bg: '#081e1b',
        color: '#fff',
        _hover: { bg: 'color-mix(in srgb, #081e1b 90%, transparent)' }
      },
      wheel: {
        bg: 'linear-gradient(90deg, #4BBAFF 0%, #8143FF 100%)',
        color: 'white',
        border: 'none',
        _hover: {
          bg: 'linear-gradient(90deg, #4BBAFF 0%, #8143FF 100%)',
          opacity: 0.9
        },
        _disabled: {
          bg: 'linear-gradient(264.36deg, #B49BA4 0.54%, #869AA6 108.37%)',
          opacity: 1
        }
      }
    }
  }
})
