'use client'

import { ChakraProvider } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { system } from './theme'
import { bottomToaster, Toaster } from './toaster'

export function Provider({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={system}>
      {children}
      <Toaster />
      <Toaster defaultToaster={bottomToaster} />
    </ChakraProvider>
  )
}
