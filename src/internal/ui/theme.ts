import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

import { buttonRecipe } from './componentRecipes'

const config = defineConfig({
  theme: {
    // breakpoints: {
    //   sm: '320px',
    //   md: '768px',
    //   lg: '960px',
    //   xl: '1200px'
    // },
    tokens: {
      colors: {
        'brand-purple': {
          value: '#8143FF'
        },
        'brand-grey1': {
          value: '#071D2C'
        },
        'brand-grey2': {
          value: '#5D5C5D'
        },
        'brand-grey3': {
          value: '#BEBEBE'
        },
        'brand-grey4': {
          value: '#81728C'
        },
        'state-progress': {
          value: '#0890FE'
        },
        'state-success': {
          value: '#00CBB3'
        },
        'state-error': {
          value: '#FF4267'
        },
        'state-warning': {
          value: '#F2BD19'
        }
      }
    },
    semanticTokens: {},
    recipes: { button: buttonRecipe },
    keyframes: {
      spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' }
      }
    }
  }
})

export const system = createSystem(defaultConfig, config)
