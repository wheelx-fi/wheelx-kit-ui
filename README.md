# `@wheelx/widget`

WheelX swap / bridge widget extracted as a reusable package.

This package currently lives at the root of the `wheelx-kit-ui` repository.

This package is designed for host applications that want to embed WheelX's
bridge and swap experience with minimal setup while still keeping control over:

- allowed source and destination networks
- default selected tokens
- token restrictions per chain
- visual styles and typography

## Installation

Install from npm:

```bash
pnpm add @wheelx/widget
```

Install host-side wallet UI dependency:

```bash
pnpm add @rainbow-me/rainbowkit
```

Build the package locally when working on this repository:

```bash
pnpm build
```

## Local Demo

This repository includes a standalone Next.js demo in `demo/`.

Install dependencies for the package and the demo from the repository root:

```bash
pnpm install
```

Run the demo:

```bash
pnpm demo:dev
```

Build the demo:

```bash
pnpm demo:build
```

## Environment

The package defaults to production endpoints:

```bash
NEXT_PUBLIC_API_URL=https://api.wheelx.fi
NEXT_PUBLIC_APP_DOMAIN=https://wheelx.fi
```

If you want to override them locally, create:

```text
.env.local
```

You can start from:

```text
.env.example
```

## Requirements

- `Next.js >= 15`
- `React 19`
- `react-dom 19`

The widget currently depends on Next.js runtime APIs, so the host application
should be Next.js-based.

If your host app does not already include RainbowKit styles, add this once in
your root layout or global entry:

```tsx
import '@rainbow-me/rainbowkit/styles.css'
```

`WheelxWidgetProvider` already includes the wallet-related providers required by
the widget. If your host application wants a wallet connect button, render your
own UI in the host app, for example with RainbowKit's `ConnectButton`.

## Quick Start

The smallest working integration is:

```tsx
'use client'

import {
  WheelxBridgeSwapWidget,
  WheelxWidgetProvider
} from '@wheelx/widget'

export default function Page() {
  return (
    <WheelxWidgetProvider>
      <WheelxBridgeSwapWidget />
    </WheelxWidgetProvider>
  )
}
```

## Basic Usage With Config

```tsx
'use client'

import {
  WheelxBridgeSwapWidget,
  WheelxWidgetProvider,
  type WheelxWidgetConfig
} from '@wheelx/widget'

const config: WheelxWidgetConfig = {
  mode: 'bridge-and-swap',
  networks: {
    from: [1, 8453, 10],
    to: [8453, 10, 137]
  },
  defaultTokens: {
    from: {
      chainId: 8453,
      address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      symbol: 'USDT'
    },
    to: {
      chainId: 8453,
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC'
    }
  }
}

export default function Page() {
  return (
    <WheelxWidgetProvider>
      <WheelxBridgeSwapWidget config={config} />
    </WheelxWidgetProvider>
  )
}
```

## What The Widget Supports

### 1. Bridge + Swap Mode

Default mode:

```ts
mode: 'bridge-and-swap'
```

This allows:

- same-chain swap
- cross-chain bridge
- cross-chain swap

### 2. Swap-Only Mode

```ts
mode: 'swap'
```

Behavior:

- the widget enforces same-chain selection
- the token modal hides the left chain list
- clicking `From` or `To` only shows tokens for the currently selected chain
- initial token rendering is aligned to the configured chain before token data
  finishes loading, so the widget does not flash the built-in Soneium/Base
  defaults first

### 3. Network Restriction

You can allow all networks, a single network, or a subset per side.

```ts
networks: {
  from: 'all',
  to: [8453, 10]
}
```

Accepted formats:

- `'all'`
- `number`
- `number[]`

### 4. Default Token Selection

You can define the initial `from` and `to` token:

```ts
defaultTokens: {
  from: {
    chainId: 8453,
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    symbol: 'USDT'
  },
  to: {
    chainId: 8453,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC'
  }
}
```

Notes:

- defaults are applied once during widget initialization
- URL presets take precedence over `defaultTokens`
- in swap-only mode, same-chain behavior is still enforced after defaults apply
- if a default token falls outside `networks` or `allowedTokens`, the widget will
  fall back to the nearest valid option

### 5. Token Restriction Per Chain

You can restrict selectable tokens by chain.

The widget will use the intersection of:

- tokens returned by the backend API
- tokens declared in `allowedTokens`

If you configure a token address that does not exist in the API response, it is
silently ignored.

```ts
allowedTokens: {
  from: [
    {
      chainId: 8453,
      tokens: [
        '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        '0x0000000000000000000000000000000000000000'
      ]
    }
  ],
  to: [
    {
      chainId: 8453,
      tokens: ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913']
    }
  ]
}
```

Important behavior:

- restrictions are chain-scoped
- if you only configure chain `8453`, other allowed chains remain unrestricted
- address comparison is case-insensitive

### 6. Built-In Branding

The widget includes a fixed `Powered by WheelX.fi` footer link inside the card.

This branding is built into the widget and is not exposed as a configuration
option.

## Customization

The widget does not currently support render overrides for internal components.
Customization is done through the `styles` field using Chakra-style props.

```tsx
const config: WheelxWidgetConfig = {
  styles: {
    formContainer: {
      bg: '#FFFFFF',
      borderRadius: '24px',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)'
    },
    primaryButton: {
      borderRadius: '999px'
    },
    formTitleText: {
      color: '#7C2D12',
      fontFamily: 'Georgia, serif',
      fontWeight: 900
    }
  }
}
```

## Style Slots

### Container Slots

- `formContainer`
- `sectionContainer`
- `tokenSelector`
- `recipientBadge`
- `amountInputContainer`
- `tokenModalContent`
- `tokenModalChainPanel`
- `tokenModalTokenPanel`
- `quoteInfoContainer`
- `quoteTooltipContent`
- `quoteInfoCard`
- `txStateCard`
- `txStateRouteContainer`
- `txStateSummaryContainer`
- `txStateTokenCard`

### Typography Slots

- `formTitleText`
- `sectionLabelText`
- `tokenPrimaryText`
- `tokenSecondaryText`
- `balanceText`
- `amountInputText`
- `amountUsdText`
- `primaryButtonText`
- `tokenModalTitleText`
- `tokenModalSectionLabelText`
- `tokenModalChainText`
- `tokenModalTokenPrimaryText`
- `tokenModalTokenSecondaryText`
- `tokenModalCategoryTabText`
- `slippageTitleText`
- `slippageDescriptionText`
- `slippageButtonText`
- `quoteInfoLabel`
- `quoteInfoValue`
- `txStateLabel`
- `txStateValue`

### Button / State Slots

- `primaryButton`
- `primaryButtonLoading`
- `primaryButtonWarning`
- `quickHalfButton`
- `quickMaxButton`
- `slippageSettingsTrigger`
- `slippageAutoButton`
- `slippageCustomInput`
- `txStatePrimaryButton`
- `quoteInfoFreeBadge`

### Token Modal Slots

- `tokenModalSearchInput`
- `tokenModalChainRow`
- `tokenModalChainRowHover`
- `tokenModalChainRowActive`
- `tokenModalChainsWithAssetsRow`
- `tokenModalChainsWithAssetsRowActive`
- `tokenModalTokenRow`
- `tokenModalTokenRowHover`
- `tokenModalCategoryTab`
- `tokenModalCategoryTabActive`

### Status Slots

- `txStateStatusLink`
- `txStateStatusError`
- `txStateStatusWarning`
- `txStateStatusProgress`

## Common Integration Examples

### Swap Only On Base

```ts
const config: WheelxWidgetConfig = {
  mode: 'swap',
  networks: {
    from: 8453,
    to: 8453
  }
}
```

### Restrict From/To To Different Network Sets

```ts
const config: WheelxWidgetConfig = {
  networks: {
    from: [1, 8453],
    to: [10, 137, 8453]
  }
}
```

### Restrict Only One Chain's Tokens

```ts
const config: WheelxWidgetConfig = {
  networks: {
    from: [1, 8453],
    to: [1, 8453]
  },
  allowedTokens: {
    from: [
      {
        chainId: 8453,
        tokens: [
          '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
        ]
      }
    ]
  }
}
```

Behavior:

- Base `from` tokens are restricted to the configured list
- Ethereum `from` tokens remain available

### Visual Theming

```ts
const config: WheelxWidgetConfig = {
  styles: {
    formContainer: {
      bg: '#FFF7ED',
      border: '3px solid',
      borderColor: '#EA580C'
    },
    tokenSelector: {
      bg: '#DCFCE7',
      border: '2px solid',
      borderColor: '#16A34A'
    },
    primaryButton: {
      bg: 'linear-gradient(90deg, #111827 0%, #1E3A8A 100%)',
      color: '#FFFFFF'
    },
    tokenModalTokenRowHover: {
      bg: '#DBEAFE'
    }
  }
}
```

## API Reference

### `WheelxWidgetProvider`

Wrap the widget with this provider once at the host app integration point.

```tsx
<WheelxWidgetProvider>
  <WheelxBridgeSwapWidget />
</WheelxWidgetProvider>
```

### `WheelxBridgeSwapWidget`

Props:

```ts
interface WheelxBridgeSwapWidgetProps {
  config?: WheelxWidgetConfig
}
```

### `WheelxWidgetConfig`

```ts
interface WheelxWidgetConfig {
  mode?: 'bridge-and-swap' | 'swap'
  networks?: {
    from?: 'all' | number | number[]
    to?: 'all' | number | number[]
  }
  defaultTokens?: {
    from?: {
      chainId: number
      address: string
      symbol?: string
    }
    to?: {
      chainId: number
      address: string
      symbol?: string
    }
  }
  allowedTokens?: {
    from?: Array<{
      chainId: number
      tokens: string[]
    }>
    to?: Array<{
      chainId: number
      tokens: string[]
    }>
  }
  styles?: WidgetStyleOverrides
}
```

## Demo

This repository includes a local Next.js demo in:

```text
demo/
```

Install and run it with:

```bash
pnpm --dir demo install
pnpm --dir demo dev
```

The demo uses the package through:

```text
@wheelx/widget -> file:..
```
