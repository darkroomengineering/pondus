/**
 * Specto Design Tokens
 */

export const colors = {
	black: '#000000',
	white: '#ffffff',
	red: '#e30613', // Brand red

	// Grays
	gray: {
		50: '#fafafa',
		100: '#f5f5f5',
		200: '#e5e5e5',
		300: '#d4d4d4',
		400: '#a3a3a3',
		500: '#737373',
		600: '#525252',
		700: '#404040',
		800: '#262626',
		900: '#171717',
		950: '#0a0a0a',
	},

	// Status colors
	success: '#22c55e',
	warning: '#eab308',
	error: '#ef4444',
	info: '#3b82f6',
} as const

export const themes = {
	dark: {
		background: colors.black,
		foreground: colors.white,
		accent: colors.red,
		muted: colors.gray[400],
		border: colors.gray[800],
		card: colors.gray[900],
		cardHover: colors.gray[800],
	},
	light: {
		background: colors.white,
		foreground: colors.black,
		accent: colors.red,
		muted: colors.gray[500],
		border: colors.gray[200],
		card: colors.gray[50],
		cardHover: colors.gray[100],
	},
} as const

export const typography = {
	fontFamily: {
		sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
	},
	fontSize: {
		xs: '0.75rem',
		sm: '0.875rem',
		base: '1rem',
		lg: '1.125rem',
		xl: '1.25rem',
		'2xl': '1.5rem',
		'3xl': '1.875rem',
		'4xl': '2.25rem',
	},
	fontWeight: {
		normal: '400',
		medium: '500',
		semibold: '600',
		bold: '700',
	},
	lineHeight: {
		tight: '1.25',
		normal: '1.5',
		relaxed: '1.75',
	},
} as const

export const spacing = {
	0: '0',
	1: '0.25rem',
	2: '0.5rem',
	3: '0.75rem',
	4: '1rem',
	5: '1.25rem',
	6: '1.5rem',
	8: '2rem',
	10: '2.5rem',
	12: '3rem',
	16: '4rem',
	20: '5rem',
	24: '6rem',
} as const

export const borderRadius = {
	none: '0',
	sm: '0.125rem',
	base: '0.25rem',
	md: '0.375rem',
	lg: '0.5rem',
	xl: '0.75rem',
	'2xl': '1rem',
	full: '9999px',
} as const

export const animation = {
	duration: {
		fast: '150ms',
		base: '200ms',
		slow: '300ms',
		slower: '500ms',
	},
	easing: {
		ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
		easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
		easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
		easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
	},
} as const
