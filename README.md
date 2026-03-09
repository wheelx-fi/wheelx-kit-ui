# `@wheelx/widget`

Embeddable WheelX bridge and swap widget for Next.js applications.

It packages the full widget flow behind a small integration surface:

- bridge and swap UI
- wallet-ready provider wrapper
- network and token restrictions
- theme and style overrides

## Quick Start

### 1. Install From npm

```bash
pnpm add @wheelx/widget @rainbow-me/rainbowkit
```

If your app does not already load RainbowKit styles, add this once in your app entry:

```tsx
import '@rainbow-me/rainbowkit/styles.css'
```

Minimal usage:

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

Requirements:

- `Next.js >= 15`
- `React 19`
- `react-dom 19`

The widget currently depends on Next.js runtime APIs, so the host app should be Next.js-based.

### 2. Run From Source

Clone the repository and install dependencies from the root:

```bash
pnpm install
```

Start the local demo:

```bash
pnpm demo:dev
```

Build the demo:

```bash
pnpm demo:build
```

`pnpm demo:dev` rebuilds the package first, so the demo stays aligned with the current source tree.

### 3. Browse Online

- Live demo: `https://widget.wheelx.fi/`
- Theme page: `https://widget.wheelx.fi/theme`

## Theme Page

The repository includes a theme playground at:

```text
/theme
```

It lets you:

- preview the live widget
- switch between presets
- edit theme values
- copy the generated config block

This page is intended for visual review and handoff, not just internal testing.

## Configuration

The main config type is `WheelxWidgetConfig`.

```tsx
import type { WheelxWidgetConfig } from '@wheelx/widget'
```

Example:

```tsx
const config: WheelxWidgetConfig = {
  mode: 'bridge-and-swap',
  referralCode: 'your-affiliate-code',
  networks: {
    from: [1, 8453],
    to: [8453, 137]
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
  },
  styles: {
    formContainer: {
      backgroundColor: '#0f172a'
    }
  }
}
```

### Supported Options

#### `mode`

Controls the widget flow.

- `bridge-and-swap`
  Enables same-chain swaps, bridging, and cross-chain swaps.
- `swap`
  Restricts the widget to same-chain swaps.

Notes:

- `bridge-and-swap` is the default.
- In `swap` mode, the widget normalizes `networks.from` and `networks.to` to the shared chain set when both are provided.

#### `referralCode`

Adds your referral code to quote requests.

```ts
referralCode?: string
```

Rules:

- When set, every quote request includes `affiliation` in the request body.
- The value is trimmed before use.
- You can get your code from `https://affiliate.wheelx.fi/`.

#### `networks`

Restricts the available chains for each side.

```ts
networks?: {
  from?: 'all' | number | number[]
  to?: 'all' | number | number[]
}
```

Rules:

- Omit a side or use `'all'` to allow every chain returned by the backend.
- Use a single number to allow one chain.
- Use an array to allow a subset of chains.

#### `defaultTokens`

Sets the initial token selection.

```ts
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
```

Rules:

- `chainId` and `address` identify the token.
- `symbol` is optional and can help disambiguate token lookup.
- Defaults are applied during widget initialization.
- If a configured default is not valid under `networks` or `allowedTokens`, the widget falls back to the nearest valid option.

#### `allowedTokens`

Restricts selectable tokens by chain.

```ts
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
```

Rules:

- Restrictions are chain-scoped.
- Only chains explicitly listed in `allowedTokens` are restricted.
- Chains that are not listed remain unrestricted.
- Token addresses are normalized to lowercase internally.
- Invalid or empty addresses are ignored.

#### `styles`

Overrides widget appearance with style objects.

```ts
styles?: WidgetStyleOverrides
```

All supported style keys are listed below.

##### Form

- `formContainer`
  Main widget shell.
- `formTitleText`
  Main title text.
- `formFooterText`
  Footer text such as `Powered by WheelX.fi`.
- `sectionContainer`
  Form sections such as `From` and `To`.
- `sectionLabelText`
  Section labels.
- `tokenSelector`
  Token selector surface.
- `tokenPrimaryText`
  Token symbol and main token text.
- `tokenSecondaryText`
  Chain name and secondary token text.
- `tokenIconBadge`
  Small network badge attached to token icons.
- `balanceText`
  Balance text near token inputs.
- `recipientBadge`
  Recipient address badge on the `To` side.
- `amountInputContainer`
  Numeric input shell.
- `amountInputText`
  Numeric input text.
- `amountUsdText`
  USD amount text below or beside token inputs.
- `primaryButton`
  Main action button surface.
- `primaryButtonLoading`
  Main action button while loading.
- `primaryButtonWarning`
  Main action button in warning state.
- `primaryButtonText`
  Main action button text.
- `quickHalfButton`
  `50%` quick action button.
- `quickMaxButton`
  `Max` quick action button.

##### Token Modal

- `tokenModalContent`
  Modal container.
- `tokenModalTitleText`
  Modal title.
- `tokenModalSearchInput`
  Search input.
- `tokenModalChainPanel`
  Left chain list panel.
- `tokenModalTokenPanel`
  Right token list panel.
- `tokenModalSectionLabelText`
  Section labels such as `Popular` or `Prediction`.
- `tokenModalChainRow`
  Chain row base style.
- `tokenModalChainRowHover`
  Chain row hover state.
- `tokenModalChainRowActive`
  Chain row active state.
- `tokenModalChainText`
  Chain row text.
- `tokenModalChainsWithAssetsRow`
  `Chains with assets` row.
- `tokenModalChainsWithAssetsRowActive`
  Active state for `Chains with assets`.
- `tokenModalTokenRow`
  Token row base style.
- `tokenModalTokenRowHover`
  Token row hover state.
- `tokenModalTokenPrimaryText`
  Token row main text.
- `tokenModalTokenSecondaryText`
  Token row secondary text.
- `tokenModalCategoryTab`
  Category tabs such as `All`, `AI`, `Liked`, `Searched`.
- `tokenModalCategoryTabActive`
  Active category tab.
- `tokenModalCategoryTabText`
  Category tab text.

##### Different Address Dialog

- `differentAddressDialogContent`
  Dialog container.
- `differentAddressDialogTitleText`
  Dialog title.
- `differentAddressDialogInput`
  Address input.
- `differentAddressDialogCancelButton`
  Cancel button.
- `differentAddressDialogSaveButton`
  Save button.
- `differentAddressDialogCloseButton`
  Close button in the top-right corner.

##### Slippage

- `slippageSettingsTrigger`
  Trigger button in the form header.
- `slippagePopoverContent`
  Slippage popover container.
- `slippageAutoButton`
  `Auto` slippage button.
- `slippageCustomInput`
  Custom slippage input.
- `slippageTitleText`
  Popover title.
- `slippageDescriptionText`
  Popover helper text.
- `slippageButtonText`
  Text inside slippage buttons.

##### Quote And Tooltip

- `quoteInfoContainer`
  Quote summary wrapper.
- `quoteTooltipContent`
  Tooltip container for quote details.
- `quoteInfoCard`
  Quote detail cards.
- `quoteInfoLabel`
  Quote labels such as `Price Impact` or `Slippage`.
- `quoteInfoValue`
  Quote values.
- `quoteInfoFreeBadge`
  `Free` badge styling.

##### Transaction State

- `txStateCard`
  Shared base style for transaction state cards.
- `txStateRouteContainer`
  Route summary card.
- `txStateSummaryContainer`
  Date, time, and recipient summary card.
- `txStateTokenCard`
  Token amount cards.
- `txStateLabel`
  Labels in the transaction state view.
- `txStateValue`
  Values in the transaction state view.
- `txStatePrimaryButton`
  Main action button in the transaction state view.
- `txStateStatusLink`
  Success link text.
- `txStateStatusError`
  Error status text.
- `txStateStatusWarning`
  Warning status text.
- `txStateStatusProgress`
  In-progress status text.

## Environment

By default, the widget uses the production API.

```bash
NEXT_PUBLIC_API_URL=https://api.wheelx.fi
NEXT_PUBLIC_APP_DOMAIN=https://wheelx.fi
```

For wallet connections, set:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...
```

If you are running locally, place overrides in `.env.local`.
