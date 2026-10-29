import { hues } from '@sanity/color'
import type { ThemeColorSchemeKey } from '@sanity/ui/theme'

const SCHEME_COLORS = {
  bg: {
    dark: hues.gray[950].hex,
    light: hues.gray[50].hex
  },
  bg2: {
    dark: hues.gray[900].hex,
    light: hues.gray[100].hex
  }
}

type SchemeColorKey = keyof typeof SCHEME_COLORS

export function getSchemeColor(scheme: ThemeColorSchemeKey, colorKey: SchemeColorKey): string {
  return SCHEME_COLORS[colorKey]?.[scheme]
}
