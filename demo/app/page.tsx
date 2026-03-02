'use client'

import { useMemo, useState } from 'react'
import {
  WheelxBridgeSwapWidget,
  WheelxWidgetProvider,
  type WheelxWidgetConfig
} from '@wheelx/widget'

type Preset = 'bridge' | 'swap'

const BASE_CHAIN_ID = 8453
const BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const BASE_USDT_ADDRESS = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
const FAKE_BASE_TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111'

const bridgePreset: WheelxWidgetConfig = {
  mode: 'bridge-and-swap',
  allowedTokens: {
    from: [
      {
        chainId: BASE_CHAIN_ID,
        tokens: [BASE_USDT_ADDRESS, FAKE_BASE_TOKEN_ADDRESS]
      }
    ],
    to: [
      {
        chainId: BASE_CHAIN_ID,
        tokens: [BASE_USDC_ADDRESS, FAKE_BASE_TOKEN_ADDRESS]
      }
    ]
  },
  defaultTokens: {
    from: {
      chainId: BASE_CHAIN_ID,
      address: BASE_USDT_ADDRESS,
      symbol: 'USDT'
    },
    to: {
      chainId: BASE_CHAIN_ID,
      address: BASE_USDC_ADDRESS,
      symbol: 'USDC'
    }
  },
}

const swapPreset: WheelxWidgetConfig = {
  mode: 'swap',
  networks: {
    from: [1, 8453],
    to: [1, 8453]
  },
  allowedTokens: {
    from: [
      {
        chainId: BASE_CHAIN_ID,
        tokens: [BASE_USDC_ADDRESS, FAKE_BASE_TOKEN_ADDRESS]
      }
    ],
    to: [
      {
        chainId: BASE_CHAIN_ID,
        tokens: [BASE_USDT_ADDRESS, FAKE_BASE_TOKEN_ADDRESS]
      }
    ]
  },
  defaultTokens: {
    from: {
      chainId: BASE_CHAIN_ID,
      address: BASE_USDC_ADDRESS,
      symbol: 'USDC'
    },
    to: {
      chainId: BASE_CHAIN_ID,
      address: BASE_USDT_ADDRESS,
      symbol: 'USDT'
    }
  },
}

export default function Home() {
  const [preset, setPreset] = useState<Preset>('bridge')

  const config = useMemo(
    () => (preset === 'bridge' ? bridgePreset : swapPreset),
    [preset]
  )

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background:
          'radial-gradient(circle at 15% 20%, #E0F2FE 0%, #EDE9FE 45%, #FEF3C7 100%)'
      }}
    >
      <div style={{ width: '100%', maxWidth: 760 }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 14,
            justifyContent: 'center'
          }}
        >
          <button
            onClick={() => setPreset('bridge')}
            style={{
              padding: '10px 14px',
              borderRadius: 999,
              border: '2px solid #0F172A',
              background: preset === 'bridge' ? '#0F172A' : '#FFFFFF',
              color: preset === 'bridge' ? '#FFFFFF' : '#0F172A',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Bridge + Swap
          </button>
          <button
            onClick={() => setPreset('swap')}
            style={{
              padding: '10px 14px',
              borderRadius: 999,
              border: '2px solid #0F172A',
              background: preset === 'swap' ? '#0F172A' : '#FFFFFF',
              color: preset === 'swap' ? '#FFFFFF' : '#0F172A',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Swap Only
          </button>
        </div>

        <WheelxWidgetProvider>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 14
            }}
          >
          </div>
          <WheelxBridgeSwapWidget config={config} />
        </WheelxWidgetProvider>
      </div>
    </main>
  )
}
