'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  WheelxBridgeSwapWidget,
  WheelxWidgetProvider,
  type WheelxWidgetConfig,
  type WidgetStyleOverrides
} from '@wheelx/widget'

import { demoWidgetConfig } from '../demo-config'

type ThemeState = {
  pageBackground: string
  previewCardBackground: string
  previewCardBorder: string
  widgetBackground: string
  widgetBorder: string
  sectionBackground: string
  sectionBorder: string
  titleColor: string
  textPrimary: string
  textSecondary: string
  inputBackground: string
  inputBorder: string
  badgeBackground: string
  badgeText: string
  footerText: string
  buttonStart: string
  buttonEnd: string
  buttonText: string
  quickHalfButtonBackground: string
  quickMaxButtonBackground: string
  quickButtonText: string
  quickMaxButtonText: string
  iconButtonBackground: string
  tokenIconBadgeBackground: string
  tokenIconBadgeBorder: string
  modalBackground: string
  modalPanelBackground: string
  modalSearchBackground: string
  modalTabBackground: string
  modalTabActiveBackground: string
  modalRowHoverBackground: string
  quoteBackground: string
  quoteCardBackground: string
  tooltipBackground: string
  freeBadgeBackground: string
  freeBadgeText: string
  fontFamily: string
}

const themePresets: Record<string, ThemeState> = {
  aurora: {
    pageBackground:
      'radial-gradient(circle at 20% 10%, #fef3c7 0%, #dbeafe 35%, #f5d0fe 68%, #ecfeff 100%)',
    previewCardBackground: 'rgba(255, 255, 255, 0.66)',
    previewCardBorder: '#d6d8ff',
    widgetBackground: '#fbfbff',
    widgetBorder: '#d9ddfb',
    sectionBackground: '#eef2ff',
    sectionBorder: '#d8def5',
    titleColor: '#111827',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    inputBackground: '#ffffff',
    inputBorder: '#c7d2fe',
    badgeBackground: '#ffffff',
    badgeText: '#4b5563',
    footerText: '#6b7280',
    buttonStart: '#38bdf8',
    buttonEnd: '#7c3aed',
    buttonText: '#ffffff',
    quickHalfButtonBackground: '#f8f5ff',
    quickMaxButtonBackground: '#7c3aed',
    quickButtonText: '#7c3aed',
    quickMaxButtonText: '#ffffff',
    iconButtonBackground: '#ffffff',
    tokenIconBadgeBackground: '#ffffff',
    tokenIconBadgeBorder: '#d8def5',
    modalBackground: '#f8faff',
    modalPanelBackground: '#eef2ff',
    modalSearchBackground: '#ffffff',
    modalTabBackground: '#f1f3ff',
    modalTabActiveBackground: '#ddd8ff',
    modalRowHoverBackground: '#e7e9ff',
    quoteBackground: '#eef2ff',
    quoteCardBackground: '#ffffff',
    tooltipBackground: '#ffffff',
    freeBadgeBackground: '#10b981',
    freeBadgeText: '#ffffff',
    fontFamily: 'var(--font-geist-sans), sans-serif'
  },
  ember: {
    pageBackground:
      'radial-gradient(circle at 15% 20%, #2f1320 0%, #141626 42%, #072b36 100%)',
    previewCardBackground: 'rgba(15, 18, 31, 0.76)',
    previewCardBorder: '#5c3350',
    widgetBackground: '#161b2d',
    widgetBorder: '#31405f',
    sectionBackground: '#202842',
    sectionBorder: '#35466d',
    titleColor: '#fff4db',
    textPrimary: '#f7f3ea',
    textSecondary: '#b4bfd3',
    inputBackground: '#0f1527',
    inputBorder: '#45557c',
    badgeBackground: '#25304d',
    badgeText: '#f8e6cb',
    footerText: '#93a1be',
    buttonStart: '#fb923c',
    buttonEnd: '#f43f5e',
    buttonText: '#fff7ed',
    quickHalfButtonBackground: '#261c28',
    quickMaxButtonBackground: '#e85d75',
    quickButtonText: '#f49aac',
    quickMaxButtonText: '#fff7ed',
    iconButtonBackground: '#0f1527',
    tokenIconBadgeBackground: '#101726',
    tokenIconBadgeBorder: '#4b5d86',
    modalBackground: '#141a2c',
    modalPanelBackground: '#1b233b',
    modalSearchBackground: '#0f1527',
    modalTabBackground: '#1f2942',
    modalTabActiveBackground: '#344974',
    modalRowHoverBackground: '#2c3a5d',
    quoteBackground: '#1b233b',
    quoteCardBackground: '#101726',
    tooltipBackground: '#0f1527',
    freeBadgeBackground: '#14b8a6',
    freeBadgeText: '#ecfeff',
    fontFamily: 'Georgia, serif'
  },
  slate: {
    pageBackground:
      'radial-gradient(circle at 10% 10%, #1d2638 0%, #0f172a 40%, #020617 100%)',
    previewCardBackground: 'rgba(7, 11, 23, 0.78)',
    previewCardBorder: '#2d3c59',
    widgetBackground: '#0f172a',
    widgetBorder: '#334155',
    sectionBackground: '#162033',
    sectionBorder: '#334155',
    titleColor: '#f8fafc',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    inputBackground: '#020617',
    inputBorder: '#475569',
    badgeBackground: '#182438',
    badgeText: '#e2e8f0',
    footerText: '#94a3b8',
    buttonStart: '#22c55e',
    buttonEnd: '#06b6d4',
    buttonText: '#041016',
    quickHalfButtonBackground: '#162033',
    quickMaxButtonBackground: '#2d8faf',
    quickButtonText: '#7dd3fc',
    quickMaxButtonText: '#f8fafc',
    iconButtonBackground: '#020617',
    tokenIconBadgeBackground: '#020617',
    tokenIconBadgeBorder: '#475569',
    modalBackground: '#0f172a',
    modalPanelBackground: '#162033',
    modalSearchBackground: '#020617',
    modalTabBackground: '#162033',
    modalTabActiveBackground: '#1e293b',
    modalRowHoverBackground: '#1b2940',
    quoteBackground: '#162033',
    quoteCardBackground: '#020617',
    tooltipBackground: '#020617',
    freeBadgeBackground: '#14b8a6',
    freeBadgeText: '#ecfeff',
    fontFamily: '"Trebuchet MS", sans-serif'
  }
}

const fontOptions = [
  { label: 'Geist Sans', value: 'var(--font-geist-sans), sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' }
]

const fieldShellStyle = {
  display: 'grid',
  gap: 8,
  width: '100%',
  alignContent: 'start'
} satisfies CSSProperties

const fieldLabelStyle = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#94a3b8'
} satisfies CSSProperties

const textInputStyle = {
  height: 44,
  borderRadius: 14,
  border: '1px solid #24324c',
  background: '#081121',
  color: '#f8fafc',
  padding: '0 14px',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box'
} satisfies CSSProperties

const controlGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 16,
  alignItems: 'start'
} satisfies CSSProperties

function isHexColor(value: string) {
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value)
}

function FieldShell({
  label,
  children
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label style={fieldShellStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  )
}

function ColorField({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const allowPicker = isHexColor(value)

  return (
    <FieldShell label={label}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: allowPicker ? 'minmax(0, 1fr) 56px' : '1fr',
          gap: 10,
          alignItems: 'center'
        }}
      >
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          style={textInputStyle}
        />
        {allowPicker ? (
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            style={{
              width: 56,
              height: 44,
              borderRadius: 14,
              border: '1px solid #24324c',
              background: '#081121',
              padding: 4,
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          />
        ) : null}
      </div>
    </FieldShell>
  )
}

function TextField({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <FieldShell label={label}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          ...textInputStyle
        }}
      />
    </FieldShell>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: string
  options: Array<{ label: string; value: string }>
  onChange: (value: string) => void
}) {
  return (
    <FieldShell label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={textInputStyle}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

function ControlSection({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section
      style={{
        display: 'grid',
        gap: 16,
        padding: 20,
        borderRadius: 24,
        background: 'linear-gradient(180deg, rgba(10,18,34,0.98), rgba(7,12,24,0.98))',
        border: '1px solid #1f2b43'
      }}
    >
      <div style={{ display: 'grid', gap: 6 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: '#f8fafc' }}>{title}</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>{description}</p>
      </div>
      {children}
    </section>
  )
}

function buildWidgetStyles(theme: ThemeState): WidgetStyleOverrides {
  const gradient = `linear-gradient(135deg, ${theme.buttonStart} 0%, ${theme.buttonEnd} 100%)`

  return {
    formContainer: {
      backgroundColor: theme.widgetBackground,
      border: '1px solid',
      borderColor: theme.widgetBorder,
      boxShadow: '0 28px 80px rgba(2, 6, 23, 0.24)',
      color: theme.textPrimary,
      fontFamily: theme.fontFamily
    },
    formTitleText: {
      color: theme.titleColor,
      fontFamily: theme.fontFamily
    },
    formFooterText: {
      color: theme.footerText,
      fontFamily: theme.fontFamily
    },
    sectionContainer: {
      backgroundColor: theme.sectionBackground,
      border: '1px solid',
      borderColor: theme.sectionBorder
    },
    sectionLabelText: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily
    },
    tokenSelector: {
      backgroundColor: theme.sectionBackground,
      border: '1px solid',
      borderColor: theme.sectionBorder
    },
    tokenPrimaryText: {
      color: theme.textPrimary,
      fontFamily: theme.fontFamily
    },
    tokenSecondaryText: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily
    },
    tokenIconBadge: {
      backgroundColor: theme.tokenIconBadgeBackground,
      borderColor: theme.tokenIconBadgeBorder
    },
    balanceText: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily
    },
    recipientBadge: {
      backgroundColor: theme.badgeBackground,
      color: theme.badgeText,
      border: '1px solid',
      borderColor: theme.sectionBorder
    },
    amountInputContainer: {
      backgroundColor: theme.inputBackground,
      border: '1px solid',
      borderColor: theme.inputBorder
    },
    amountInputText: {
      color: theme.textPrimary,
      fontFamily: theme.fontFamily,
      _placeholder: {
        color: theme.textSecondary
      },
      _disabled: {
        color: theme.textPrimary,
        opacity: 1
      }
    },
    amountUsdText: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily
    },
    primaryButton: {
      background: gradient,
      color: theme.buttonText,
      border: 'none',
      boxShadow: 'none'
    },
    primaryButtonLoading: {
      backgroundColor: theme.sectionBorder,
      color: theme.textPrimary
    },
    primaryButtonWarning: {
      background: gradient,
      color: theme.buttonText
    },
    primaryButtonText: {
      color: theme.buttonText,
      fontFamily: theme.fontFamily
    },
    quickHalfButton: {
      backgroundColor: theme.quickHalfButtonBackground,
      color: theme.quickButtonText,
      border: '1px solid',
      borderColor: theme.quickButtonText,
      minWidth: 0,
      paddingInline: '6px',
      boxShadow: 'none',
      fontFamily: theme.fontFamily
    },
    quickMaxButton: {
      backgroundColor: theme.quickMaxButtonBackground,
      color: theme.quickMaxButtonText,
      border: '1px solid',
      borderColor: theme.quickMaxButtonBackground,
      minWidth: 0,
      paddingInline: '6px',
      boxShadow: 'none',
      fontFamily: theme.fontFamily
    },
    slippageSettingsTrigger: {
      backgroundColor: theme.iconButtonBackground,
      border: '1px solid',
      borderColor: theme.inputBorder,
      borderRadius: '10px',
      paddingInline: '6px',
      minHeight: '30px'
    },
    slippagePopoverContent: {
      backgroundColor: theme.widgetBackground,
      border: '1px solid',
      borderColor: theme.widgetBorder,
      color: theme.textPrimary
    },
    slippageAutoButton: {
      backgroundColor: theme.quickHalfButtonBackground,
      color: theme.quickButtonText,
      borderColor: theme.quickButtonText
    },
    slippageCustomInput: {
      backgroundColor: theme.inputBackground,
      color: theme.textPrimary,
      borderColor: theme.inputBorder
    },
    slippageTitleText: {
      color: theme.textPrimary,
      fontFamily: theme.fontFamily
    },
    slippageDescriptionText: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily
    },
    slippageButtonText: {
      color: 'inherit',
      fontFamily: theme.fontFamily
    },
    quoteInfoContainer: {
      backgroundColor: theme.quoteBackground,
      border: '1px solid',
      borderColor: theme.sectionBorder
    },
    quoteTooltipContent: {
      backgroundColor: theme.tooltipBackground,
      border: '1px solid',
      borderColor: theme.inputBorder,
      color: theme.textPrimary
    },
    quoteInfoCard: {
      backgroundColor: theme.quoteCardBackground,
      border: '1px solid',
      borderColor: theme.sectionBorder
    },
    quoteInfoLabel: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily
    },
    quoteInfoValue: {
      color: theme.textPrimary,
      fontFamily: theme.fontFamily
    },
    quoteInfoFreeBadge: {
      color: theme.freeBadgeText,
      background: theme.freeBadgeBackground
    },
    tokenModalContent: {
      backgroundColor: theme.modalBackground,
      color: theme.textPrimary,
      fontFamily: theme.fontFamily,
      border: '1px solid',
      borderColor: theme.widgetBorder,
      boxShadow: '0 24px 80px rgba(2, 6, 23, 0.4)'
    },
    tokenModalTitleText: {
      color: theme.titleColor,
      fontFamily: theme.fontFamily
    },
    tokenModalSearchInput: {
      backgroundColor: theme.modalSearchBackground,
      borderColor: theme.inputBorder,
      color: theme.textPrimary,
      _placeholder: {
        color: theme.textSecondary
      },
      _focus: {
        borderColor: theme.buttonEnd,
        outlineWidth: '0px'
      },
      _focusVisible: {
        borderColor: theme.buttonEnd,
        outlineWidth: '0px',
        boxShadow: 'none'
      }
    },
    tokenModalChainPanel: {
      backgroundColor: theme.modalPanelBackground
    },
    tokenModalTokenPanel: {
      backgroundColor: theme.modalPanelBackground
    },
    tokenModalSectionLabelText: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily
    },
    tokenModalChainRowHover: {
      backgroundColor: theme.modalRowHoverBackground
    },
    tokenModalChainRowActive: {
      backgroundColor: theme.modalTabActiveBackground,
      borderColor: theme.inputBorder
    },
    tokenModalChainText: {
      color: theme.textPrimary,
      fontFamily: theme.fontFamily
    },
    tokenModalChainsWithAssetsRow: {
      backgroundColor: theme.modalTabBackground,
      border: '1px solid',
      borderColor: 'transparent',
      borderRadius: '14px'
    },
    tokenModalChainsWithAssetsRowActive: {
      backgroundColor: theme.modalTabActiveBackground,
      borderColor: theme.inputBorder
    },
    tokenModalTokenRowHover: {
      backgroundColor: theme.modalRowHoverBackground
    },
    tokenModalTokenPrimaryText: {
      color: theme.textPrimary,
      fontFamily: theme.fontFamily
    },
    tokenModalTokenSecondaryText: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily
    },
    tokenModalCategoryTab: {
      backgroundColor: theme.modalTabBackground,
      color: theme.textSecondary,
      border: '1px solid',
      borderColor: theme.sectionBorder
    },
    tokenModalCategoryTabActive: {
      backgroundColor: theme.modalTabActiveBackground,
      color: theme.textPrimary,
      borderColor: theme.inputBorder
    },
    tokenModalCategoryTabText: {
      color: 'inherit',
      fontFamily: theme.fontFamily
    },
    differentAddressDialogContent: {
      backgroundColor: theme.modalBackground,
      color: theme.textPrimary,
      border: '1px solid',
      borderColor: theme.widgetBorder,
      boxShadow: '0 24px 80px rgba(2, 6, 23, 0.4)'
    },
    differentAddressDialogTitleText: {
      color: theme.titleColor,
      fontFamily: theme.fontFamily
    },
    differentAddressDialogInput: {
      backgroundColor: theme.modalSearchBackground,
      borderColor: theme.inputBorder,
      color: theme.textPrimary,
      _placeholder: {
        color: theme.textSecondary
      },
      _focus: {
        borderColor: theme.buttonEnd,
        outlineWidth: '0px'
      },
      _focusVisible: {
        borderColor: theme.buttonEnd,
        outlineWidth: '0px',
        boxShadow: 'none'
      }
    },
    differentAddressDialogCancelButton: {
      backgroundColor: theme.modalTabBackground,
      color: theme.textPrimary,
      border: '1px solid',
      borderColor: theme.inputBorder,
      _hover: {
        backgroundColor: theme.modalTabActiveBackground
      }
    },
    differentAddressDialogSaveButton: {
      background: gradient,
      color: theme.buttonText,
      border: 'none',
      _hover: {
        opacity: 0.92
      }
    },
    differentAddressDialogCloseButton: {
      backgroundColor: theme.modalBackground,
      border: '1px solid',
      borderColor: theme.inputBorder,
      color: theme.textSecondary,
      borderRadius: '12px'
    },
    txStateCard: {
      backgroundColor: theme.sectionBackground,
      border: '1px solid',
      borderColor: theme.sectionBorder
    },
    txStateRouteContainer: {
      backgroundColor: theme.sectionBackground,
      border: '1px solid',
      borderColor: theme.sectionBorder
    },
    txStateSummaryContainer: {
      backgroundColor: theme.sectionBackground,
      border: '1px solid',
      borderColor: theme.sectionBorder
    },
    txStateTokenCard: {
      backgroundColor: theme.quoteCardBackground,
      border: '1px solid',
      borderColor: theme.sectionBorder
    },
    txStateLabel: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily
    },
    txStateValue: {
      color: theme.textPrimary,
      fontFamily: theme.fontFamily
    },
    txStatePrimaryButton: {
      background: gradient,
      color: theme.buttonText,
      border: 'none'
    },
    txStateStatusLink: {
      color: theme.buttonEnd,
      fontFamily: theme.fontFamily
    },
    txStateStatusError: {
      color: '#fb7185',
      fontFamily: theme.fontFamily
    },
    txStateStatusWarning: {
      color: '#fbbf24',
      fontFamily: theme.fontFamily
    },
    txStateStatusProgress: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily
    }
  }
}

function ThemePlayground() {
  const [themeKey, setThemeKey] = useState<'custom' | keyof typeof themePresets>(
    'aurora'
  )
  const [theme, setTheme] = useState<ThemeState>(themePresets.aurora)
  const [referralCode, setReferralCode] = useState(
    typeof demoWidgetConfig.referralCode === 'string'
      ? demoWidgetConfig.referralCode
      : ''
  )
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  const widgetConfig = useMemo<WheelxWidgetConfig>(
    () => ({
      ...demoWidgetConfig,
      referralCode: referralCode.trim() || undefined,
      styles: buildWidgetStyles(theme)
    }),
    [referralCode, theme]
  )

  const generatedConfig = useMemo(
    () =>
      `const widgetConfig: WheelxWidgetConfig = ${JSON.stringify(
        widgetConfig,
        null,
        2
      )}`,
    [widgetConfig]
  )

  const applyPreset = (key: keyof typeof themePresets) => {
    setThemeKey(key)
    setTheme(themePresets[key])
  }

  const updateTheme = <K extends keyof ThemeState>(key: K, value: ThemeState[K]) => {
    setThemeKey('custom')
    setTheme((current) => ({
      ...current,
      [key]: value
    }))
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedConfig)
    setCopyState('copied')
    window.setTimeout(() => setCopyState('idle'), 1200)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '28px 18px 56px',
        background:
          'radial-gradient(circle at top, rgba(30, 41, 59, 0.65), rgba(2, 6, 23, 1) 55%)',
        color: '#f8fafc'
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gap: 22 }}>
        <section
          style={{
            display: 'grid',
            gap: 22
          }}
        >
          <section
            style={{
              display: 'grid',
              gap: 16,
              padding: 18,
              borderRadius: 30,
              border: '1px solid #1f2b43',
              background: '#081121'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 22 }}>Preview</h2>
                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#94a3b8',
                    fontSize: 14
                  }}
                >
                  Review the widget first, then refine the theme below.
                </p>
              </div>
            </div>

            <div
              style={{
                borderRadius: 28,
                padding: '28px clamp(14px, 3vw, 28px)',
                background: theme.pageBackground,
                border: `1px solid ${theme.previewCardBorder}`,
                minHeight: 760,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <WheelxWidgetProvider>
                    <WheelxBridgeSwapWidget config={widgetConfig} />
                  </WheelxWidgetProvider>
                </div>
              </div>
            </div>
          </section>

          <ControlSection
            title="Configure"
            description="Adjust the theme here. Presets are part of the configuration area."
          >
            <div
              style={{
                display: 'grid',
                gap: 8
              }}
            >
              <TextField
                label="Referral Code"
                value={referralCode}
                onChange={setReferralCode}
              />
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>
                Find your code at{' '}
                <a
                  href="https://affiliate.wheelx.fi/"
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ color: '#7dd3fc', textDecoration: 'none' }}
                >
                  affiliate.wheelx.fi
                </a>
                .
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              {Object.keys(themePresets).map((key) => {
                const active = themeKey === key
                return (
                  <button
                    key={key}
                    onClick={() => applyPreset(key as keyof typeof themePresets)}
                    style={{
                      padding: '11px 16px',
                      borderRadius: 999,
                      border: `1px solid ${active ? '#7dd3fc' : '#24324c'}`,
                      background: active ? '#e0f2fe' : '#0f1b31',
                      color: active ? '#082f49' : '#e2e8f0',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {key}
                  </button>
                )
              })}
            </div>
            <div
              style={controlGridStyle}
            >
              <TextField
                label="Preview Background"
                value={theme.pageBackground}
                onChange={(value) => updateTheme('pageBackground', value)}
              />
              <TextField
                label="Preview Frosted Surface"
                value={theme.previewCardBackground}
                onChange={(value) => updateTheme('previewCardBackground', value)}
              />
              <ColorField
                label="Preview Card Border"
                value={theme.previewCardBorder}
                onChange={(value) => updateTheme('previewCardBorder', value)}
              />
              <SelectField
                label="Font Family"
                value={theme.fontFamily}
                options={fontOptions}
                onChange={(value) => updateTheme('fontFamily', value)}
              />
              <ColorField
                label="Title"
                value={theme.titleColor}
                onChange={(value) => updateTheme('titleColor', value)}
              />
              <ColorField
                label="Primary Text"
                value={theme.textPrimary}
                onChange={(value) => updateTheme('textPrimary', value)}
              />
              <ColorField
                label="Secondary Text"
                value={theme.textSecondary}
                onChange={(value) => updateTheme('textSecondary', value)}
              />
              <ColorField
                label="Footer Text"
                value={theme.footerText}
                onChange={(value) => updateTheme('footerText', value)}
              />
              <ColorField
                label="Widget Background"
                value={theme.widgetBackground}
                onChange={(value) => updateTheme('widgetBackground', value)}
              />
              <ColorField
                label="Widget Border"
                value={theme.widgetBorder}
                onChange={(value) => updateTheme('widgetBorder', value)}
              />
              <ColorField
                label="Section Background"
                value={theme.sectionBackground}
                onChange={(value) => updateTheme('sectionBackground', value)}
              />
              <ColorField
                label="Section Border"
                value={theme.sectionBorder}
                onChange={(value) => updateTheme('sectionBorder', value)}
              />
              <ColorField
                label="Input Background"
                value={theme.inputBackground}
                onChange={(value) => updateTheme('inputBackground', value)}
              />
              <ColorField
                label="Input Border"
                value={theme.inputBorder}
                onChange={(value) => updateTheme('inputBorder', value)}
              />
              <ColorField
                label="Recipient Badge"
                value={theme.badgeBackground}
                onChange={(value) => updateTheme('badgeBackground', value)}
              />
              <ColorField
                label="Badge Text"
                value={theme.badgeText}
                onChange={(value) => updateTheme('badgeText', value)}
              />
              <ColorField
                label="Token Icon Badge"
                value={theme.tokenIconBadgeBackground}
                onChange={(value) => updateTheme('tokenIconBadgeBackground', value)}
              />
              <ColorField
                label="Token Icon Badge Border"
                value={theme.tokenIconBadgeBorder}
                onChange={(value) => updateTheme('tokenIconBadgeBorder', value)}
              />
              <ColorField
                label="Button Start"
                value={theme.buttonStart}
                onChange={(value) => updateTheme('buttonStart', value)}
              />
              <ColorField
                label="Button End"
                value={theme.buttonEnd}
                onChange={(value) => updateTheme('buttonEnd', value)}
              />
              <ColorField
                label="Button Text"
                value={theme.buttonText}
                onChange={(value) => updateTheme('buttonText', value)}
              />
              <ColorField
                label="Quick 50% Button"
                value={theme.quickHalfButtonBackground}
                onChange={(value) =>
                  updateTheme('quickHalfButtonBackground', value)
                }
              />
              <ColorField
                label="Quick Max Button"
                value={theme.quickMaxButtonBackground}
                onChange={(value) =>
                  updateTheme('quickMaxButtonBackground', value)
                }
              />
              <ColorField
                label="Quick 50% Text"
                value={theme.quickButtonText}
                onChange={(value) => updateTheme('quickButtonText', value)}
              />
              <ColorField
                label="Quick Max Text"
                value={theme.quickMaxButtonText}
                onChange={(value) => updateTheme('quickMaxButtonText', value)}
              />
              <ColorField
                label="Utility Button Surface"
                value={theme.iconButtonBackground}
                onChange={(value) => updateTheme('iconButtonBackground', value)}
              />
              <ColorField
                label="Free Badge"
                value={theme.freeBadgeBackground}
                onChange={(value) => updateTheme('freeBadgeBackground', value)}
              />
              <ColorField
                label="Free Badge Text"
                value={theme.freeBadgeText}
                onChange={(value) => updateTheme('freeBadgeText', value)}
              />
              <ColorField
                label="Modal Background"
                value={theme.modalBackground}
                onChange={(value) => updateTheme('modalBackground', value)}
              />
              <ColorField
                label="Modal Panel"
                value={theme.modalPanelBackground}
                onChange={(value) => updateTheme('modalPanelBackground', value)}
              />
              <ColorField
                label="Modal Search"
                value={theme.modalSearchBackground}
                onChange={(value) => updateTheme('modalSearchBackground', value)}
              />
              <ColorField
                label="Modal Tab"
                value={theme.modalTabBackground}
                onChange={(value) => updateTheme('modalTabBackground', value)}
              />
              <ColorField
                label="Modal Active Tab"
                value={theme.modalTabActiveBackground}
                onChange={(value) =>
                  updateTheme('modalTabActiveBackground', value)
                }
              />
              <ColorField
                label="Modal Hover Row"
                value={theme.modalRowHoverBackground}
                onChange={(value) => updateTheme('modalRowHoverBackground', value)}
              />
              <ColorField
                label="Quote Background"
                value={theme.quoteBackground}
                onChange={(value) => updateTheme('quoteBackground', value)}
              />
              <ColorField
                label="Quote Card"
                value={theme.quoteCardBackground}
                onChange={(value) => updateTheme('quoteCardBackground', value)}
              />
              <ColorField
                label="Tooltip Background"
                value={theme.tooltipBackground}
                onChange={(value) => updateTheme('tooltipBackground', value)}
              />
            </div>
          </ControlSection>

          <ControlSection
            title="Generated Config"
            description="Copy the generated config block directly into the host app."
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={handleCopy}
                style={{
                  padding: '11px 16px',
                  borderRadius: 999,
                  border: '1px solid #24324c',
                  background: copyState === 'copied' ? '#99f6e4' : '#0f1b31',
                  color: copyState === 'copied' ? '#134e4a' : '#e2e8f0',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {copyState === 'copied' ? 'Copied' : 'Copy Config'}
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                padding: 18,
                borderRadius: 22,
                background: '#030712',
                border: '1px solid #1f2b43',
                color: '#dbeafe',
                fontSize: 12,
                lineHeight: 1.6,
                overflowX: 'auto'
              }}
            >
              <code>{generatedConfig}</code>
            </pre>
          </ControlSection>
        </section>
      </div>
    </main>
  )
}

export default function ThemePage() {
  return <ThemePlayground />
}
