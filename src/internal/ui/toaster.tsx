'use client'

import {
  Toaster as ChakraToaster,
  CreateToasterReturn,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster
} from '@chakra-ui/react'

export const toaster: CreateToasterReturn = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true
})

export const bottomToaster: CreateToasterReturn = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true
})

export const topToaster: CreateToasterReturn = createToaster({
  placement: 'top',
  pauseOnPageIdle: true
})

export const Toaster = ({
  defaultToaster = toaster
}: {
  defaultToaster?: CreateToasterReturn
}) => {
  return (
    <Portal>
      <ChakraToaster toaster={defaultToaster} insetInline={{ mdDown: '4' }}>
        {(toast) => (
          <Toast.Root width={{ md: 'sm' }} alignItems={'center'} px={5}>
            {toast.type === 'loading' ? (
              <Spinner size="sm" color="blue.solid" />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap="1" flex="1" maxWidth="100%" py={5}>
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.meta?.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
