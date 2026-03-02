'use client'
import { formatTokenAmount } from '../utils'
import { countLeadingZerosAfterDecimal } from './utils'
import { Heading } from '../ui'
import { Fraction } from 'bi-fraction'

interface Props extends React.ComponentProps<typeof Heading> {
  amount: Fraction
  prefix?: string
  suffix?: string
  decimals?: number
}

export const TokenAmountHeading = ({
  amount,
  decimals,
  prefix,
  suffix,
  ...props
}: Props) => {
  const _amount = formatTokenAmount({
    amount,
    decimals
  })

  const leadingZeros = countLeadingZerosAfterDecimal(_amount)
  if (leadingZeros > 5) {
    return (
      <Heading variant={'heading8'} {...props} as="div">
        {prefix} {_amount.slice(0, 3)}
        <span
          style={{
            display: 'inline-block',
            transform: 'scale(0.6) translateY(8px)'
          }}
        >
          {leadingZeros}
        </span>
        {_amount.slice(leadingZeros + 2)} {suffix}
      </Heading>
    )
  }

  return (
    <Heading variant={'heading11'} {...props} as="div">
      {prefix} {_amount} {suffix}
    </Heading>
  )
}
