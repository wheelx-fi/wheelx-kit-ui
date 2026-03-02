import { HStack, Image, VStack } from '@chakra-ui/react'
import ethereumIcon from '../assets/images/networks/1.png'
import bnbIcon from '../assets/images/networks/56.png'
import baseIcon from '../assets/images/networks/8453.png'
import arbitrumIcon from '../assets/images/networks/42161.png'
import { getAssetSrc } from '../utils/getAssetSrc'

export const AllChainsIcon = () => {
  return (
    <VStack w={'24px'} h={'24px'} gap={1}>
      <HStack gap={1}>
        <Image src={getAssetSrc(ethereumIcon)} alt="ethereum" w="10px" h="10px" borderRadius={'full'} />
        <Image src={getAssetSrc(bnbIcon)} alt="bnb" w="10px" h="10px" borderRadius={'full'} />
      </HStack>
      <HStack gap={1}>
        <Image src={getAssetSrc(baseIcon)} alt="base" w="10px" h="10px" borderRadius={'full'} />
        <Image src={getAssetSrc(arbitrumIcon)} alt="arbitrum" w="10px" h="10px" borderRadius={'full'} />
      </HStack>
    </VStack>
  )
}
