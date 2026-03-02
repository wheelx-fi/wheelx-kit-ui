import { chakra, defineRecipe } from '@chakra-ui/react'

const textRecipe = defineRecipe({
  variants: {
    variant: {
      content3: {
        fontWeight: 400,
        fontSize: '28px',
        lineHeight: '28px'
      },
      content4: {
        fontWeight: 400,
        fontSize: '24px',
        lineHeight: '24px'
      },
      content5: {
        fontWeight: 400,
        fontSize: '22px',
        lineHeight: '22px'
      },
      content6: {
        fontWeight: 400,
        fontSize: '18px',
        lineHeight: '18px'
      },
      content6_1: {
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: '16px'
      },
      content7: {
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '14px'
      },
      content7_2: {
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: 1.4
      },
      content8: {
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '12px'
      },
      content8_2: {
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: 1.4
      },
      content9: {
        fontWeight: 400,
        fontSize: '10px',
        lineHeight: '10px'
      }
    }
  }
})

export const Text = chakra('p', textRecipe)
