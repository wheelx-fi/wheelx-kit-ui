import { Wallet, getWalletConnectConnector } from '@rainbow-me/rainbowkit'

export interface MyWalletOptions {
  projectId: string
}

const NABOX_ICON_DATA_URI =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAuMTcgMjI4LjMyIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzJhYzk4YjtmaWxsLXJ1bGU6ZXZlbm9kZDt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPk5hYm94PC90aXRsZT48ZyBpZD0i5Zu+5bGCXzIiIGRhdGEtbmFtZT0i5Zu+5bGCIDIiPjxnIGlkPSLlm77lsYJfMS0yIiBkYXRhLW5hbWU9IuWbvuWxgiAxIj48cG9seWdvbiBjbGFzcz0iY2xzLTEiIHBvaW50cz0iMCA2NC4xMiAwIDE3MC40NiAzMC43OSAxODguMjEgMzAuNzkgMTEyLjE0IDYxLjQ3IDEyOS44NiA2MS40NyAyMDUuODggOTIuMjcgMjIzLjYzIDkyLjI3IDExNy4yOCAwIDY0LjEyIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNjkuOTQsNTQuMzlsMzAuODUtMTguMDgsMzguMzMsMjIuNDMtMzAuODMsMThaTTEwMC44MywwbC05Myw1NC40MSwxMDAuMjksNTguOCwwLDExNS4xMSwzMC40Mi0xNy43MlY5NC4xNWwzMC43NC0xOFYxOTIuNWwzMC44Ny0xOC4xN1Y1OC4xMVoiLz48L2c+PC9nPjwvc3ZnPg=='

export const naboxWallet = ({ projectId }: MyWalletOptions): Wallet => ({
  id: 'NaboxWallet',
  name: 'Nabox',
  iconUrl: NABOX_ICON_DATA_URI,
  iconBackground: '#333',
  downloadUrls: {
    android: 'https://play.google.com/store/apps/details?id=com.wallet.nabox',
    ios: 'https://apps.apple.com/us/app/nabox-wallet/id6443821021',
    chrome:
      'https://chromewebstore.google.com/detail/nabox-wallet/nknhiehlklippafakaeklbeglecifhad',
    qrCode: 'https://nabox.io/download'
  },
  mobile: {
    getUri: (uri: string) => uri
  },
  qrCode: {
    getUri: (uri: string) => uri,
    instructions: {
      learnMoreUrl: 'https://nabox.io/',
      steps: [
        {
          description:
            'We recommend adding Nabox to your home screen for faster access to your wallet.',
          step: 'install',
          title: 'Open the Nabox app'
        },
        {
          description:
            'After scanning, a connection prompt will appear for you to confirm the wallet connection.',
          step: 'scan',
          title: 'Tap the scan button'
        }
      ]
    }
  },
  extension: {
    instructions: {
      learnMoreUrl: 'https://nabox.io/',
      steps: [
        {
          description:
            'We recommend pinning Nabox to your taskbar for quicker access to your wallet.',
          step: 'install',
          title: 'Install the Nabox browser extension'
        },
        {
          description:
            'Be sure to back up your wallet using a secure method. Never share your mnemonic phrase with anyone.',
          step: 'create',
          title: 'Create or Import a Wallet'
        },
        {
          description:
            'Once you set up your wallet, click below to refresh the browser and load the extension.',
          step: 'refresh',
          title: 'Refresh your browser'
        }
      ]
    }
  },
  createConnector: getWalletConnectConnector({ projectId })
})
