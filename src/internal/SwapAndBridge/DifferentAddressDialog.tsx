'use client'
import {
  Box,
  Button,
  Dialog,
  HStack,
  Input,
  Portal,
  VStack
} from '@chakra-ui/react'
import { Heading } from '../ui'
import CloseIcon from '../assets/icons/close.svg'
import { useCallback, useEffect, useRef, useState } from 'react'

import { isAddress } from 'viem'
import { bottomToaster } from '../ui/toaster'
import { useDifferentAddressStore } from '../stores/useDifferentAddressStore'
import { IoClose } from 'react-icons/io5'
import { useAccount } from 'wagmi'
import { AssetIcon } from '../ui/AssetIcon'

/**
 *
 * @param address
 * @returns
 */
export function isValidEVMAddress(address: string): boolean {
  if (
    !address ||
    typeof address !== 'string' ||
    !address.startsWith('0x') ||
    address.length !== 42
  ) {
    return false
  }
  return isAddress(address)
}

interface DifferentAddressDialogProps {
  isOpen: boolean
  onClose: () => void
}

const DifferentAddressDialog = ({
  isOpen,
  onClose
}: DifferentAddressDialogProps) => {
  const [isAddressError, setIsAddressError] = useState(false)
  const { address } = useAccount()
  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState<`0x${string}` | undefined>(
    undefined
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const { setDifferentAddress, differentAddress, isDepositPlatformToken } =
    useDifferentAddressStore()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.startsWith('0x')) {
      setInputValue(value as `0x${string}`)
    } else {
      setInputValue(undefined)
    }
    if (isAddressError && value) {
      setIsAddressError(false)
    }
  }

  const handleClearInput = useCallback(() => {
    setInputValue(undefined)
    setIsAddressError(false)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    setIsAddressError(false)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  const handleClose = useCallback(() => {
    setInputValue(undefined)
    setIsAddressError(false)
    onClose?.()
  }, [onClose])

  const onSave = useCallback(() => {
    if (!inputValue || inputValue.trim() === '') {
      setIsAddressError(false)
      setDifferentAddress(undefined)
      handleClose()
      return
    }
    if (isValidEVMAddress(inputValue)) {
      setIsAddressError(false)
      setDifferentAddress(inputValue)
      handleClose()
    } else {
      setIsAddressError(true)
    }
  }, [inputValue, setDifferentAddress, handleClose])

  useEffect(() => {
    if (isAddressError) {
      bottomToaster.error({
        description: 'This address is not a EVM address.',
        duration: 3000
      })
    }
  }, [isAddressError])
  useEffect(() => {
    if (!isOpen) {
      setInputValue(undefined)
      setIsAddressError(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (address) {
      if (!isDepositPlatformToken) {
        setInputValue(address)
      } else {
        setInputValue(undefined)
      }
    }
  }, [address, isDepositPlatformToken])

  useEffect(() => {
    if (differentAddress) {
      setInputValue(differentAddress)
    }
  }, [differentAddress])

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={handleClose}
      placement={'center'}
      trapFocus={false}
      scrollBehavior="outside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner px={4}>
          <Dialog.Content w={['100%', '480px']}>
            <Dialog.Header justifyContent={'center'}>
              <Heading
                variant={{
                  base: 'heading10',
                  md: 'heading8'
                }}
                mt={1.5}
                padding={'20px 0'}
                color={'#101010'}
                fontSize={'18px'}
              >
                To Address
              </Heading>
            </Dialog.Header>
            <Dialog.Body>
              <VStack>
                <HStack w="100%" marginBottom={'17px'}>
                  <Box margin={'0 15px'} flex={1} position={'relative'}>
                    <Input
                      placeholder={'Please enter the EVM address'}
                      w={'100%'}
                      paddingLeft={'15px'}
                      _placeholder={{
                        color: 'brand-grey3'
                      }}
                      // defaultValue={address}
                      color={isAddressError ? 'red' : 'brand-grey1'}
                      borderColor={
                        isFocused
                          ? '#8143FF'
                          : isAddressError
                            ? 'red'
                            : '#B5B5B5'
                      }
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      outline={'none'}
                      ref={inputRef}
                      value={inputValue || ''}
                      onChange={handleInputChange}
                    />
                    {inputValue && (
                      <Box
                        onClick={handleClearInput}
                        width={'14px'}
                        height={'14px'}
                        position={'absolute'}
                        top={'50%'}
                        right={'10px'}
                        transform={'translateY(-50%)'}
                        cursor={'pointer'}
                      >
                        <IoClose color={'#81728C'} />
                      </Box>
                    )}
                  </Box>
                </HStack>
                <HStack w={'100%'} paddingBottom={'21px'}>
                  <Button
                    flex={1}
                    margin={'0 15px'}
                    backgroundColor={'#E3E4FA'}
                    color={'#101010'}
                    onClick={handleClose}
                    _hover={{
                      backgroundColor: '#D5D6F0'
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    flex={1}
                    margin={'0 15px'}
                    backgroundColor={'#8143FF'}
                    color={'#fff'}
                    onClick={onSave}
                    _hover={{
                      backgroundColor: '#7035E0'
                    }}
                    // disabled={!inputValue.trim()}
                  >
                    Save
                  </Button>
                </HStack>
              </VStack>
            </Dialog.Body>
            <Dialog.CloseTrigger
              top={3}
              right={3}
              left={'auto'}
              cursor={'pointer'}
            >
              <AssetIcon src={CloseIcon} alt="close" boxSize={'24px'} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default DifferentAddressDialog
