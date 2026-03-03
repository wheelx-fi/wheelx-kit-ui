import { WheelxBridgeSwapWidget, WheelxWidgetProvider } from '@wheelx/widget'

import { demoWidgetConfig } from './demo-config'

export default function Home() {
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
        <WheelxWidgetProvider>
          <WheelxBridgeSwapWidget config={demoWidgetConfig} />
        </WheelxWidgetProvider>
      </div>
    </main>
  )
}
