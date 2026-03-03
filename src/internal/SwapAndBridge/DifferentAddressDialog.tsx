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
import { useCallback, useEffect, useRef, useState } from 'react'

import { isAddress } from 'viem'
import { bottomToaster } from '../ui/toaster'
import { useDifferentAddressStore } from '../stores/useDifferentAddressStore'
import { IoClose } from 'react-icons/io5'
import { useAccount } from 'wagmi'
import { useWheelxWidgetStyles } from '../../config'

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
  const widgetStyles = useWheelxWidgetStyles()
  const dialogContentStyles =
    widgetStyles.differentAddressDialogContent ||
    widgetStyles.tokenModalContent ||
    {}
  const dialogTitleStyles =
    widgetStyles.differentAddressDialogTitleText ||
    widgetStyles.tokenModalTitleText ||
    {}
  const dialogInputStyles =
    widgetStyles.differentAddressDialogInput ||
    widgetStyles.tokenModalSearchInput ||
    {}
  const dialogInputColor =
    typeof dialogInputStyles.color === 'string'
      ? dialogInputStyles.color
      : 'inherit'
  const dialogInputBorderColor =
    typeof dialogInputStyles.borderColor === 'string'
      ? dialogInputStyles.borderColor
      : '#B5B5B5'
  const dialogInputFocusBorderColor =
    typeof dialogInputStyles._focus === 'object' &&
    dialogInputStyles._focus &&
    'borderColor' in dialogInputStyles._focus &&
    typeof dialogInputStyles._focus.borderColor === 'string'
      ? dialogInputStyles._focus.borderColor
      : '#8143FF'
  const dialogInputPlaceholderStyles =
    typeof dialogInputStyles._placeholder === 'object'
      ? dialogInputStyles._placeholder
      : { color: 'brand-grey3' }
  const dialogCancelButtonStyles =
    widgetStyles.differentAddressDialogCancelButton ||
    widgetStyles.tokenModalCategoryTab ||
    {}
  const dialogSaveButtonStyles =
    widgetStyles.differentAddressDialogSaveButton ||
    widgetStyles.primaryButton ||
    {}
  const dialogCloseButtonStyles =
    widgetStyles.differentAddressDialogCloseButton ||
    widgetStyles.slippageSettingsTrigger ||
    {}
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
          <Dialog.Content
            w={['100%', '480px']}
            borderRadius={'24px'}
            p={0}
            {...dialogContentStyles}
          >
            <Dialog.Header justifyContent={'center'} p={0}>
              <Heading
                variant={{
                  base: 'heading10',
                  md: 'heading8'
                }}
                mt={1.5}
                padding={'20px 0'}
                fontSize={'18px'}
                {...dialogTitleStyles}
              >
                To Address
              </Heading>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <VStack>
                <HStack w="100%" marginBottom={'17px'}>
                  <Box margin={'0 15px'} flex={1} position={'relative'}>
                    <Input
                      placeholder={'Please enter the EVM address'}
                      w={'100%'}
                      paddingLeft={'15px'}
                      {...dialogInputStyles}
                      _placeholder={dialogInputPlaceholderStyles as any}
                      // defaultValue={address}
                      color={isAddressError ? 'red' : dialogInputColor}
                      borderColor={
                        isFocused
                          ? dialogInputFocusBorderColor
                          : isAddressError
                            ? 'red'
                            : dialogInputBorderColor
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
                      {...dialogCancelButtonStyles}
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
                      {...dialogSaveButtonStyles}
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
              <Box
                w={'38px'}
                h={'38px'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                {...dialogCloseButtonStyles}
              >
                <IoClose size={22} />
              </Box>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default DifferentAddressDialog
