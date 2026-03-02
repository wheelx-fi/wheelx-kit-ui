import { Box, Icon } from '@chakra-ui/react'
// import { MdOutlineStarOutline, MdOutlineStarPurple500 } from 'react-icons/md'
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import { useTokenFavoritesContext } from './TokenFavoritesContext'
import { TokenInfo } from '../api'

interface FavoriteButtonProps {
  tokenInfo: TokenInfo
}

export const TokenFavoriteButton: React.FC<FavoriteButtonProps> = ({
  tokenInfo
}) => {
  const {
    chain_id: chainId,
    address: tokenAddress,
    symbol,
    decimals,
    logo,
    name,
    tags
  } = tokenInfo
  const { isFavorite, addFavorite, removeFavorite } = useTokenFavoritesContext()
  const favorited = isFavorite(chainId, tokenAddress)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    try {
      if (favorited) {
        removeFavorite(chainId, tokenAddress)
      } else {
        addFavorite(chainId, tokenAddress, symbol, decimals, logo, name, tags)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  return (
    <Box
      onClick={handleToggleFavorite}
      w={'22px'}
      h={'22px'}
      backgroundColor={'transparent'}
      cursor="pointer"
    >
      {!favorited ? (
        <Icon
          as={MdFavoriteBorder}
          fontSize="16px"
          color="gray.500"
          marginLeft={'4px'}
        />
      ) : (
        <Icon
          as={MdFavorite}
          fontSize="16px"
          marginLeft={'4px'}
          color="#EB4D4D"
        />
      )}
    </Box>
  )
}
