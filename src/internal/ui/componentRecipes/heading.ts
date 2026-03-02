import { chakra, defineRecipe } from '@chakra-ui/react'

export const headingRecipe = defineRecipe({
  variants: {
    variant: {
      heading5: {
        fontWeight: 700,
        fontSize: '26px',
        lineHeight: '26px'
      },
      heading6: {
        fontWeight: 700,
        fontSize: '24px',
        lineHeight: '24px'
      },
      heading7: {
        fontWeight: 600,
        fontSize: '22px',
        lineHeight: '22px'
      },
      heading8: {
        fontWeight: 600,
        fontSize: '20px',
        lineHeight: '20px'
      },
      heading9: {
        fontWeight: 600,
        fontSize: '18px',
        lineHeight: '18px'
      },
      heading10: {
        fontWeight: 600,
        fontSize: '16px',
        lineHeight: '16px'
      },
      heading11: {
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '14px'
      },
      heading12: {
        fontWeight: 600,
        fontSize: '12px',
        lineHeight: '12px'
      },
      heading13: {
        fontWeight: 600,
        fontSize: '10px',
        lineHeight: '10px'
      }
    }
  }
})

export const Heading = chakra('h2', headingRecipe)
