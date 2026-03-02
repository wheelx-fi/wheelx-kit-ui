'use client'
import { HStack, VStack, Icon, Box } from '@chakra-ui/react'
import { Heading, Text } from '../ui'
import { Fraction } from 'bi-fraction'
import { FaGasPump } from 'react-icons/fa6'
// import { PiWaveSineFill } from 'react-icons/pi'
import { TokenInfo } from '../api'
import { useEffect, useState } from 'react'

interface TipsContentProps {
  priceImpact: {
    bridgeFee: string
    dstGasFee: string
    swapFee: string
    before_discount_fee: string
    discount_percentage: string | undefined
  }
  toTokenInfo: TokenInfo
  fromTokenInfo: TokenInfo
  router_type: string | null | undefined
  fromAmountToUsd: string | null | undefined
  toAmountToUsd: string | null | undefined
}

export const TipsContent = ({
  priceImpact,
  fromTokenInfo,
  toTokenInfo,
  // router_type,
  fromAmountToUsd,
  toAmountToUsd
}: TipsContentProps) => {
  const { chain_id: toChainId /*symbol: toTokenSymbol*/ } = toTokenInfo
  const { chain_id: fromChainId /*symbol: fromTokenSymbol*/ } = fromTokenInfo
  const totalPriceImpact = new Fraction(priceImpact.bridgeFee)
    .add(priceImpact.dstGasFee)
    .add(priceImpact.swapFee)

  const [hasDiscount, setHasDiscount] = useState(false)

  useEffect(() => {
    if (priceImpact) {
      if (
        priceImpact.before_discount_fee &&
        priceImpact.before_discount_fee !== priceImpact.swapFee &&
        // priceImpact.swapFee !== '0' &&
        priceImpact.before_discount_fee !== '0'
      ) {
        setHasDiscount(true)
      } else {
        setHasDiscount(false)
      }
    }
  }, [priceImpact])

  const renderTotalPriceImpact = () => {
    if (toAmountToUsd === null) {
      return '-'
    }
    // only exact match 0, return free, if 0.00000 is not free
    if (
      priceImpact.bridgeFee === '0' &&
      priceImpact.dstGasFee === '0' &&
      priceImpact.swapFee === '0'
    ) {
      return 'Free'
    }

    const priceImpactValue = +totalPriceImpact.toFormat({ decimalPlaces: 2 })
    const sif = +swapImpactFee()
    // console.log('priceImpactValue:', priceImpactValue, 'sif:', sif)
    const total = -priceImpactValue + -sif

    if (total < 0) {
      return `-$${(-total).toFixed(2)}`
    }
    return `+$${total.toFixed(2)}`
  }
  // const renderTotalPriceImpact = () => {
  //   // only exact match 0, return free, if 0.00000 is not free
  //   if (
  //     +fromAmountToUsd - +toAmountToUsd === 0 ||
  //     +fromAmountToUsd - +toAmountToUsd < 0
  //   ) {
  //     return 'Free'
  //   }
  //   return `-$${(+fromAmountToUsd - +toAmountToUsd).toFixed(2)} `
  // }

  const renderDiscount = (beforeFee: string, afterFee: string) => {
    if (beforeFee && afterFee) {
      return (
        <HStack gap={0}>
          <Box color={'brand-purple'} marginRight={'3px'}>
            -${new Fraction(afterFee).toFormat({ decimalPlaces: 2 })}
          </Box>
          <Box textDecoration={'line-through'} color="gray">
            ${new Fraction(beforeFee).toFormat({ decimalPlaces: 2 })}
          </Box>
          {renderDiscountPercentage()}
        </HStack>
      )
    }
    return null
  }

  const renderDiscountPercentage = () => {
    if (priceImpact.discount_percentage) {
      return (
        <Box
          color={'#000'}
          backgroundColor={'#ffd400'}
          width={'30px'}
          borderRadius={'4px'}
          textAlign={'center'}
          fontSize={'10px'}
          marginLeft={'3px'}
        >
          {priceImpact.discount_percentage}%
        </Box>
      )
    }
    return null
  }

  const renderFee = (fee: string) => {
    if (fee === '0') {
      return (
        <Text
          variant={'content9'}
          color={'white'}
          bg={'#00CBB3'}
          p={'3px'}
          borderRadius={'4px'}
        >
          Free
        </Text>
      )
    }
    return (
      <Text
        variant={{
          base: 'content9',
          md: 'content8'
        }}
        color={'brand-grey1'}
      >
        -${new Fraction(fee).toFormat({ decimalPlaces: 2 })}
      </Text>
    )
  }

  const swapImpactFee = () => {
    const i = fromAmountToUsd ? +fromAmountToUsd.replace(/,/g, '') : 0
    const o = toAmountToUsd ? +toAmountToUsd.replace(/,/g, '') : 0
    const fee = +totalPriceImpact.toFormat({ decimalPlaces: 2 })
    const fio = i - (o + fee)
    return fio.toFixed(2)
  }

  const renderSwapImpactFee = () => {
    const sif = +swapImpactFee()
    if (toAmountToUsd === null) {
      return (
        <Text
          variant={{
            base: 'content9',
            md: 'content8'
          }}
          color={'brand-grey1'}
        >
          -
        </Text>
      )
    }
    // console.log('sif:', sif)
    if (sif > 0 || sif === 0) {
      return (
        <Text
          variant={{
            base: 'content9',
            md: 'content8'
          }}
          color={'brand-grey1'}
        >
          -${sif}
        </Text>
      )
    }
    return (
      <Text
        variant={{
          base: 'content9',
          md: 'content8'
        }}
        color={'brand-grey1'}
      >
        +${-sif}
      </Text>
    )
  }

  // if (
  //   router_type === 'bridge' &&
  //   fromTokenSymbol === 'ETH' &&
  //   toTokenSymbol === 'ETH'
  // ) {
  //   // console.log('Cross-chain only (ETH only)')
  //   return (
  //     <VStack p={4}>
  //       <Heading
  //         variant={{
  //           base: 'heading13',
  //           md: 'heading12'
  //         }}
  //         borderBottom={'1px solid #B5B5B5'}
  //         pb={2}
  //         w={'100%'}
  //         textAlign={'center'}
  //       >
  //         Total Price Impact: {renderTotalPriceImpact()}
  //       </Heading>
  //       {/* <HStack justify={'space-between'} w={'100%'}>
  //         <Text
  //           variant={{
  //             base: 'content9',
  //             md: 'content8'
  //           }}
  //           color={'brand-grey4'}
  //         >
  //           Provider Fee
  //         </Text>
  //         {renderFee(priceImpact.swapFee)}
  //       </HStack> */}
  //       <HStack justify={'space-between'} w={'100%'}>
  //         <Text
  //           variant={{
  //             base: 'content9',
  //             md: 'content8'
  //           }}
  //           color={'brand-grey4'}
  //         >
  //           Dst. Gas Fee
  //         </Text>
  //         <HStack gap={1}>
  //           {priceImpact.dstGasFee !== '0' && (
  //             <Icon boxSize={'10px'} as={FaGasPump} color={'#c1c8cd'} />
  //           )}
  //           {renderFee(priceImpact.dstGasFee)}
  //         </HStack>
  //       </HStack>
  //       <HStack justify={'space-between'} w={'100%'}>
  //         <Text
  //           variant={{
  //             base: 'content9',
  //             md: 'content8'
  //           }}
  //           color={'brand-grey4'}
  //         >
  //           WheelX Fee
  //         </Text>
  //         {priceImpact.bridgeFee === '0' && priceImpact.swapFee === '0' ? (
  //           <Text
  //             variant={'content9'}
  //             color={'white'}
  //             bg={'#00CBB3'}
  //             p={'3px'}
  //             borderRadius={'4px'}
  //           >
  //             Free
  //           </Text>
  //         ) : hasDiscount ? (
  //           renderDiscount(
  //             priceImpact.before_discount_fee,
  //             priceImpact.bridgeFee + priceImpact.swapFee
  //           )
  //         ) : (
  //           <>
  //             {renderFee(priceImpact.bridgeFee + priceImpact.swapFee)}
  //             {renderDiscountPercentage()}
  //           </>
  //         )}
  //       </HStack>
  //     </VStack>
  //   )
  // }
  if (fromChainId === toChainId) {
    return (
      <VStack p={4}>
        <Heading
          variant={{
            base: 'heading13',
            md: 'heading12'
          }}
          borderBottom={'1px solid #B5B5B5'}
          pb={2}
          w={'100%'}
          textAlign={'center'}
        >
          Total Price Impact: {renderTotalPriceImpact()}
        </Heading>
        <HStack justify={'space-between'} w={'100%'}>
          <Text
            variant={{
              base: 'content9',
              md: 'content8'
            }}
            color={'brand-grey4'}
          >
            Swap Impact
          </Text>
          <HStack gap={1}>
            {/* {
              <Icon
                boxSize={'10px'}
                as={PiWaveSineFill}
                color={'#c1c8cd'}
                position={'relative'}
                left={'1px'}
              />
            } */}
            {renderSwapImpactFee()}
          </HStack>
        </HStack>
        <HStack justify={'space-between'} w={'100%'}>
          <Text
            variant={{
              base: 'content9',
              md: 'content8'
            }}
            color={'brand-grey4'}
          >
            WheelX Fee
          </Text>
          {priceImpact.bridgeFee === '0' && priceImpact.swapFee === '0' ? (
            <Text
              variant={'content9'}
              color={'white'}
              bg={'#00CBB3'}
              p={'3px'}
              borderRadius={'4px'}
            >
              Free
            </Text>
          ) : hasDiscount ? (
            renderDiscount(
              priceImpact.before_discount_fee,
              priceImpact.bridgeFee + priceImpact.swapFee
            )
          ) : (
            <>
              {renderFee(priceImpact.bridgeFee + priceImpact.swapFee)}
              {renderDiscountPercentage()}
            </>
          )}
        </HStack>
        {/* <HStack justify={'space-between'} w={'100%'}>
          <Text
            variant={{
              base: 'content9',
              md: 'content8'
            }}
            color={'brand-grey4'}
          >
            Gas Fee
          </Text>
          <HStack gap={1}>
            {priceImpact.dstGasFee !== '0' && (
              <Icon boxSize={'10px'} as={FaGasPump} color={'#c1c8cd'} />
            )}
            {renderFee(priceImpact.dstGasFee)}
          </HStack>
        </HStack> */}
      </VStack>
    )
  }
  return (
    <VStack p={4}>
      <Heading
        variant={{
          base: 'heading13',
          md: 'heading12'
        }}
        borderBottom={'1px solid #B5B5B5'}
        pb={2}
        w={'100%'}
        textAlign={'center'}
      >
        Total Price Impact: {renderTotalPriceImpact()}
      </Heading>

      {/* <HStack justify={'space-between'} w={'100%'}>
        <Text
          variant={{
            base: 'content9',
            md: 'content8'
          }}
          color={'brand-grey4'}
        >
          Provider Fee
        </Text>
        <HStack gap={1}>
          {priceImpact.dstGasFee !== '0' && (
            <Icon boxSize={'10px'} as={FaGasPump} color={'#c1c8cd'} />
          )}
          {renderFee(priceImpact.dstGasFee)}
        </HStack>
      </HStack> */}
      <HStack justify={'space-between'} w={'100%'}>
        <Text
          variant={{
            base: 'content9',
            md: 'content8'
          }}
          color={'brand-grey4'}
        >
          Swap Impact
        </Text>
        <HStack gap={1}>
          {/* {
            <Icon
              boxSize={'10px'}
              as={PiWaveSineFill}
              color={'#c1c8cd'}
              position={'relative'}
              left={'1px'}
            />
          } */}
          {renderSwapImpactFee()}
        </HStack>
      </HStack>
      <HStack justify={'space-between'} w={'100%'}>
        <Text
          variant={{
            base: 'content9',
            md: 'content8'
          }}
          color={'brand-grey4'}
        >
          Dst. Gas Fee
        </Text>
        <HStack gap={1}>
          {priceImpact.dstGasFee !== '0' && (
            <Icon boxSize={'10px'} as={FaGasPump} color={'#c1c8cd'} />
          )}
          {renderFee(priceImpact.dstGasFee)}
        </HStack>
      </HStack>
      <HStack justify={'space-between'} w={'100%'}>
        <Text
          variant={{
            base: 'content9',
            md: 'content8'
          }}
          color={'brand-grey4'}
        >
          WheelX Fee
        </Text>
        {priceImpact.bridgeFee === '0' && priceImpact.swapFee === '0' ? (
          <Text
            variant={'content9'}
            color={'white'}
            bg={'#00CBB3'}
            p={'3px'}
            borderRadius={'4px'}
          >
            Free
          </Text>
        ) : hasDiscount ? (
          renderDiscount(
            priceImpact.before_discount_fee,
            priceImpact.bridgeFee + priceImpact.swapFee
          )
        ) : (
          <>
            {renderFee(priceImpact.bridgeFee + priceImpact.swapFee)}
            {renderDiscountPercentage()}
          </>
        )}
      </HStack>
    </VStack>
  )
}
