import { InputGroup, Input } from '@chakra-ui/react'
import SearchIcon from '../assets/icons/search.svg?url'
import { useCallback, useEffect, useState } from 'react'
import { debounce } from '../SwapAndBridge/utils'
import { useWheelxWidgetStyles } from '../../config'
import { AssetIcon } from '../ui/AssetIcon'

interface Props {
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

export const SearchInput = ({ placeholder, value, onChange }: Props) => {
  const widgetStyles = useWheelxWidgetStyles()
  const [localValue, setLocalValue] = useState(value)

  const debouncedOnChange = useCallback(debounce(onChange, 500), [onChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setLocalValue(inputValue)
    debouncedOnChange(inputValue)
  }

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <InputGroup
      startElement={
        <AssetIcon
          src={SearchIcon}
          alt="search"
          boxSize={{
            base: '20px',
            md: '24px'
          }}
        />
      }
      startElementProps={{
        pl: 2.5
      }}
      px={2}
      pb={2}
    >
      <Input
        placeholder={placeholder}
        px={2}
        border={'1px solid #81728C'}
        borderRadius={'12px'}
        fontSize={{
          base: '12px',
          md: '14px'
        }}
        h={'40px'}
        _placeholder={{
          color: '#B5B5B5'
        }}
        _focus={{
          borderColor: '#8143FF',
          outlineWidth: '0px'
        }}
        value={localValue}
        onChange={handleChange}
        {...widgetStyles.tokenModalSearchInput}
      />
    </InputGroup>
  )
}
