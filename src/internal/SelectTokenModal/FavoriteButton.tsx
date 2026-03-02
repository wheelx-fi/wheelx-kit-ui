import { Box, Icon } from '@chakra-ui/react'
import { MdOutlineStarOutline, MdOutlineStarPurple500 } from 'react-icons/md'
import { useFavoritesContext } from './FavoritesContext'

interface FavoriteButtonProps {
  networkId: number
  networkName?: string
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  networkId,
  networkName
}) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesContext()
  const favorited = isFavorite(networkId)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    try {
      if (favorited) {
        removeFavorite(networkId)
      } else {
        addFavorite(networkId, networkName)
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
          as={MdOutlineStarOutline}
          fontSize="16px"
          color="gray.500"
          transition="opacity 0.2s ease-in-out"
        />
      ) : (
        <Icon
          as={MdOutlineStarPurple500}
          fontSize="16px"
          color="#8A40FF"
          transition="opacity 0.2s ease-in-out"
        />
      )}
    </Box>
  )
}
