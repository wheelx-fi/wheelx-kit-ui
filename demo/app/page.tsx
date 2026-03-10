'use client'

import Link from 'next/link'

import { WheelxBridgeSwapWidget, WheelxWidgetProvider } from '@wheelx/widget'

import { demoWidgetConfig } from './demo-config'

const footerLinks = [
  {
    label: 'API & SDK',
    href: 'https://docs.wheelx.fi/rest-api'
  },
  {
    label: 'Affiliate',
    href: 'https://affiliate.wheelx.fi/'
  },
  {
    label: 'Media Kit',
    href: 'https://docs.wheelx.fi/others/media-kit'
  },
  {
    label: 'Ecosystem',
    href: 'https://wheelx.fi/ecosystem'
  },
  {
    label: 'Support',
    href: 'https://discord.com/channels/1373302070362378301/1376829648524148806'
  }
]

const socialLinks = [
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@wheelxfi',
    icon: '/footer-icons/youtube.svg'
  },
  {
    label: 'X',
    href: 'https://x.com/intent/follow?screen_name=WheelX_fi',
    icon: '/footer-icons/x.svg'
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/GaqW8QEVTF',
    icon: '/footer-icons/discord.svg'
  },
  {
    label: 'GitHub',
    href: 'https://github.com/wheelx-fi',
    icon: '/footer-icons/github.svg'
  },
  {
    label: 'Docs',
    href: 'https://docs.wheelx.fi',
    icon: '/footer-icons/doc.svg'
  },
  {
    label: 'Medium',
    href: 'https://medium.com/@wheelx.fi',
    icon: '/footer-icons/medium.svg'
  }
]

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

      <footer className="demo-footer">
        <nav className="demo-footer-links" aria-label="WheelX footer links">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="demo-footer-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="demo-footer-social" aria-label="WheelX social links">
          {socialLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              title={link.label}
              className="demo-footer-social-link"
            >
              <img
                src={link.icon}
                alt={link.label}
                width={20}
                height={20}
                className="demo-footer-social-icon"
              />
            </Link>
          ))}
        </div>
      </footer>

      <style jsx>{`
        .demo-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 16px;
        }

        .demo-footer-links {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          gap: 10px;
        }

        :global(a.demo-footer-link) {
          display: inline-flex;
          align-items: center;
          color: #5d5c5d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;
          white-space: nowrap;
          line-height: 1;
          transition: color 0.15s ease;
          cursor: pointer;
          outline: none;
        }

        :global(a.demo-footer-link:hover) {
          color: #8143ff;
        }

        .demo-footer-social {
          display: flex;
          flex: 1;
          justify-content: flex-end;
          align-items: center;
          gap: 24px;
        }

        .demo-footer-social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .demo-footer-social-icon {
          display: block;
          width: 20px;
          height: 20px;
        }

        @media (max-width: 767px) {
          .demo-footer {
            display: none;
          }
        }
      `}</style>
    </main>
  )
}
