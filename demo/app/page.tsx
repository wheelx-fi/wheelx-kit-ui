'use client'

import Link from 'next/link'

import { WheelxBridgeSwapWidget, WheelxWidgetProvider } from '@wheelx/widget'

import { demoWidgetConfig } from './demo-config'

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(circle at 15% 20%, #cae9ff 0%, #d6e4f6 38%, #ead6ef 100%)'
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'grid',
          alignItems: 'center',
          justifyItems: 'center',
          padding: '32px 20px 24px'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 760,
            display: 'grid',
            justifyItems: 'center'
          }}
        >
          <WheelxWidgetProvider>
            <WheelxBridgeSwapWidget config={demoWidgetConfig} />
          </WheelxWidgetProvider>

          <Link
            href="https://github.com/wheelx-fi/wheelx-contracts/blob/main/audits/ABDK_WheelX_WheelXContracts_v_1_0.pdf"
            target="_blank"
            rel="noreferrer"
            style={{
              marginTop: 30,
              fontSize: 14,
              color: '#5D6270',
              textDecoration: 'none'
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Audited By
              <img
                src="/footer-icons/abdk.png"
                alt="ABDK"
                width={70}
                height={28}
                style={{
                  display: 'block',
                  width: 70,
                  height: 28,
                  marginLeft: 2,
                  objectFit: 'contain'
                }}
              />
            </span>
          </Link>
        </div>
      </div>
    </main>
  )
}
