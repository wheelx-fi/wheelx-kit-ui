import { Fraction } from 'bi-fraction'

export const calculateSlippage = (slippage?: string) => {
  if (!slippage) return
  // console.log('--------######slippage######------:', slippage)
  const slippageFraction = new Fraction(slippage)

  if (slippageFraction.eq(0)) return
  return Number(slippageFraction.mul(100).toFixed(0))
}

export const formatSlippage = (slippage: number) => {
  return new Fraction(slippage).div(100).toFixed(2)
}
