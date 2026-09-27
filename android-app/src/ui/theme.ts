/**
 * Horizon Design System tokens (Next Experience "Polaris" theme), resolved from the
 * instance's sys_ux_style records and mapped the way ServiceNow's "Mobile Colors Default"
 * style maps them for native mobile. Screens must use these instead of literal colours.
 */
export const palette = {
  primary0: '#D1D2EE', // --now-color--primary-0 (brand background)
  primary1: '#4F52BD', // --now-color--primary-1 / brand--primary
  primary2: '#353780', // --now-color--primary-2 (pressed, nav selected)
  primary3: '#1C1D42', // --now-color--primary-3
  splash: '#032D42', // native mobile "Splash Screen"
  logoNavy: '#062F41', // NowRFID logo background
  logoGreen: '#62CB4B', // NowRFID logo mark

  neutral0: '#FFFFFF',
  neutral1: '#F6F6F8',
  neutral3: '#D3D6DC',
  neutral5: '#B0B5BF',
  neutral7: '#8F95A1',
  neutral9: '#6E7583',
  neutral18: '#151920',

  positive0: '#CADFC0',
  positive2: '#33830B',
  positive3: '#266108',
  critical0: '#F8C8CD',
  critical2: '#E42338',
  critical3: '#B61C2D',
  warning0: '#FBF7BF',
  warning3: '#B6AA00',
  high0: '#FFE5BF',
  high2: '#FD9700',
  high3: '#C07300',
  info0: '#BDDCF2',
  info2: '#0079CC',
  info3: '#005C9B',
  moderate0: '#DDD5FB',
  moderate2: '#7B5CF0',
  moderate3: '#5D46B6',
  low0: '#DBDBDE',
  low3: '#57575F',
  link: '#3C59E7',
};

export const color = {
  brand: palette.primary1,
  primary: palette.primary1,
  primaryPressed: palette.primary2,
  primarySoft: palette.primary0,
  navSelected: palette.primary2,

  textPrimary: '#151920', // --now-color_text--primary
  textSecondary: '#2C323F', // --now-color_text--secondary
  textTertiary: '#454D5B', // --now-color_text--tertiary
  textOnPrimary: '#FFFFFF',
  textMuted: palette.neutral9,

  background: '#F6F6F8', // --now-color_background--secondary (screen)
  surface: '#FFFFFF', // --now-color_background--primary (cards)
  surfaceSunken: '#E4E6EA', // --now-color_background--tertiary
  border: '#D3D6DC',
  borderStrong: '#7E8592', // --now-color_border--primary
  divider: '#E4E6EA',

  header: palette.splash,
  headerText: '#FFFFFF',

  positive: palette.positive2,
  positiveBg: palette.positive0,
  critical: palette.critical3,
  criticalBg: palette.critical0,
  warning: palette.high3,
  warningBg: palette.high0,
  info: palette.info3,
  infoBg: palette.info0,
  moderate: palette.moderate3,
  moderateBg: palette.moderate0,
  neutralBadge: palette.low3,
  neutralBadgeBg: palette.low0,
};

/** Lato is Horizon's typeface; files live in android/app/src/main/assets/fonts. */
export const font = {
  regular: 'Lato-Regular',
  bold: 'Lato-Bold',
  black: 'Lato-Black',
  mono: 'monospace',
};

/** --now-font-size--sm … lg1 (px at 16px root). */
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  md1: 16,
  md2: 18,
  lg: 20,
  lg1: 24,
  lg3: 32,
};

/** --now-space--xs … lg2. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  sm2: 12,
  md1: 16,
  lg: 20,
  lg2: 24,
};

export const radius = { button: 4, chip: 16, card: 12, sheet: 16 };

/** Horizon accessibility: tappable area of at least 44×44. */
export const touch = { min: 44 };

export const shadow = {
  shadowColor: '#151920',
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

export type Tone =
  | 'primary'
  | 'positive'
  | 'critical'
  | 'warning'
  | 'info'
  | 'moderate'
  | 'neutral';

export const tone: Record<Tone, { fg: string; bg: string }> = {
  primary: { fg: palette.primary2, bg: palette.primary0 },
  positive: { fg: color.positive, bg: color.positiveBg },
  critical: { fg: color.critical, bg: color.criticalBg },
  warning: { fg: color.warning, bg: color.warningBg },
  info: { fg: color.info, bg: color.infoBg },
  moderate: { fg: color.moderate, bg: color.moderateBg },
  neutral: { fg: color.neutralBadge, bg: color.neutralBadgeBg },
};
