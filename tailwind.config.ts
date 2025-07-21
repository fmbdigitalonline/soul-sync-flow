
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// ============= CORE SYSTEM COLORS =============
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					dark: 'hsl(var(--color-primary-dark))',
					light: 'hsl(var(--color-primary-light))',
					subtle: 'hsl(var(--color-primary-subtle))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					dark: 'hsl(var(--color-secondary-dark))',
					light: 'hsl(var(--color-secondary-light))',
					subtle: 'hsl(var(--color-secondary-subtle))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},

				// ============= SEMANTIC COLOR EXTENSIONS =============
				// Text Colors
				'text-main': 'hsl(var(--color-text-main) / <alpha-value>)',
				'text-secondary': 'hsl(var(--color-text-secondary) / <alpha-value>)',
				'text-muted': 'hsl(var(--color-text-muted) / <alpha-value>)',
				'text-subtle': 'hsl(var(--color-text-subtle) / <alpha-value>)',
				'text-on-brand': 'hsl(var(--color-text-on-brand) / <alpha-value>)',
				'text-on-dark': 'hsl(var(--color-text-on-dark) / <alpha-value>)',
				'text-disabled': 'hsl(var(--color-text-disabled) / <alpha-value>)',

				// Surface Colors
				'surface': 'hsl(var(--color-surface) / <alpha-value>)',
				'surface-elevated': 'hsl(var(--color-surface-elevated) / <alpha-value>)',
				'surface-sunken': 'hsl(var(--color-surface-sunken) / <alpha-value>)',
				'surface-overlay': 'hsl(var(--color-surface-overlay) / <alpha-value>)',

				// State Colors
				'success': 'hsl(var(--color-success) / <alpha-value>)',
				'success-light': 'hsl(var(--color-success-light) / <alpha-value>)',
				'warning': 'hsl(var(--color-warning) / <alpha-value>)',
				'warning-light': 'hsl(var(--color-warning-light) / <alpha-value>)',
				'error': 'hsl(var(--color-error) / <alpha-value>)',
				'error-light': 'hsl(var(--color-error-light) / <alpha-value>)',
				'info': 'hsl(var(--color-info) / <alpha-value>)',
				'info-light': 'hsl(var(--color-info-light) / <alpha-value>)',

				// Neutral Scale
				neutral: {
					50: 'hsl(var(--color-neutral-50) / <alpha-value>)',
					100: 'hsl(var(--color-neutral-100) / <alpha-value>)',
					200: 'hsl(var(--color-neutral-200) / <alpha-value>)',
					300: 'hsl(var(--color-neutral-300) / <alpha-value>)',
					400: 'hsl(var(--color-neutral-400) / <alpha-value>)',
					500: 'hsl(var(--color-neutral-500) / <alpha-value>)',
					600: 'hsl(var(--color-neutral-600) / <alpha-value>)',
					700: 'hsl(var(--color-neutral-700) / <alpha-value>)',
					800: 'hsl(var(--color-neutral-800) / <alpha-value>)',
					900: 'hsl(var(--color-neutral-900) / <alpha-value>)'
				},

				// Interactive States
				interactive: {
					DEFAULT: 'hsl(var(--color-interactive-default) / <alpha-value>)',
					hover: 'hsl(var(--color-interactive-hover) / <alpha-value>)',
					active: 'hsl(var(--color-interactive-active) / <alpha-value>)',
					disabled: 'hsl(var(--color-interactive-disabled) / <alpha-value>)'
				},

				// Border Colors
				'border-default': 'hsl(var(--color-border-default) / <alpha-value>)',
				'border-muted': 'hsl(var(--color-border-muted) / <alpha-value>)',
				'border-subtle': 'hsl(var(--color-border-subtle) / <alpha-value>)',
				'border-focus': 'hsl(var(--color-border-focus) / <alpha-value>)',
				'border-error': 'hsl(var(--color-border-error) / <alpha-value>)',

				// REMOVED: Legacy Soul palette - enforcing semantic tokens only
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'micro-bounce': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 15s ease infinite',
				'micro-bounce': 'micro-bounce 0.2s ease-in-out'
			},
			backgroundImage: {
				// Semantic gradients using design system tokens
				'gradient-brand': 'linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))',
				'gradient-brand-radial': 'radial-gradient(circle, hsl(var(--color-primary) / 0.2) 0%, hsl(var(--color-secondary) / 0.1) 50%, hsl(var(--background)) 100%)',
				// REMOVED: Legacy gradients - use gradient-brand instead
			},
			backgroundSize: {
				'200': '200%'
			},
			fontFamily: {
				// ============= TWO-FONT SYSTEM (Golden Standard) =============
				// Display Font (Serif): For major headings and large numbers
				'display': ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
				// UI Font (Sans-serif): For all other text, labels, body copy, navigation
				'body': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
				
				// Primary font system - Inter for body text and UI
				sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
				inter: ['Inter', 'system-ui', 'sans-serif'], // Primary body font
				
				// Secondary font system - Cormorant Garamond for headings and branding
				cormorant: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'], // Elegant headings
				
				// REMOVED: Legacy font mappings - use font-display and font-body instead
			},
			// ============= SEMANTIC SPACING SYSTEM =============
			spacing: {
				// Semantic spacing tokens (replace hardcoded values)
				'space-xs': '4px',     // Extra small spacing
				'space-sm': '8px',     // Small spacing
				'space-md': '16px',    // Medium spacing (base)
				'space-lg': '24px',    // Large spacing
				'space-xl': '32px',    // Extra large spacing
				'space-2xl': '48px',   // 2x large spacing
				'space-3xl': '64px',   // 3x large spacing
				
				// Component-specific spacing
				'component-xs': '2px',   // Minimal component spacing
				'component-sm': '6px',   // Small component spacing
				'component-md': '12px',  // Medium component spacing
				'component-lg': '20px',  // Large component spacing
				'component-xl': '28px',  // Extra large component spacing
				
				// Layout spacing
				'layout-xs': '16px',   // Small layout spacing
				'layout-sm': '24px',   // Medium layout spacing
				'layout-md': '32px',   // Base layout spacing
				'layout-lg': '48px',   // Large layout spacing
				'layout-xl': '64px',   // Extra large layout spacing
				'layout-2xl': '96px',  // 2x large layout spacing
				
				// REMOVED: Legacy grid spacing - use semantic space-* tokens instead
			},
			boxShadow: {
				// ============= SEMANTIC SHADOW SYSTEM (Golden Standard) =============
				'card': 'var(--shadow-card)', // Golden Standard card shadow
				'elevated': 'var(--shadow-elevated)', // Elevated surfaces
				'overlay': 'var(--shadow-overlay)', // Modal/overlay shadows
				
				// REMOVED: Legacy shadows - use semantic shadow tokens instead
			},
			lineHeight: {
				'normal': '1.5',
			},
			// ============= SEMANTIC TYPOGRAPHY SYSTEM =============
			fontSize: {
				// Semantic text size tokens (replace hardcoded text-* classes)
				'text-xs': ['10px', { lineHeight: '1.2', fontWeight: '300' }],
				'text-sm': ['12px', { lineHeight: '1.4', fontWeight: '300' }],
				'text-base': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
				'text-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
				'text-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
				'text-xl': ['20px', { lineHeight: '1.5', fontWeight: '500' }],
				
				// Heading semantic tokens
				'heading-xs': ['16px', { lineHeight: '1.3', fontWeight: '600' }],
				'heading-sm': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
				'heading-md': ['20px', { lineHeight: '1.4', fontWeight: '500' }],
				'heading-lg': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
				'heading-xl': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
				'heading-2xl': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
				'heading-3xl': ['36px', { lineHeight: '1.1', fontWeight: '700' }],
				
				// Display text (hero sections)
				'display-sm': ['40px', { lineHeight: '1.1', fontWeight: '700' }],
				'display-md': ['48px', { lineHeight: '1.0', fontWeight: '700' }],
				'display-lg': ['56px', { lineHeight: '1.0', fontWeight: '700' }],
				
				// Caption and label text
				'caption-xs': ['10px', { lineHeight: '1.2', fontWeight: '300' }],
				'caption-sm': ['12px', { lineHeight: '1.4', fontWeight: '300' }],
				'label-sm': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
				'label-md': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
				
				// REMOVED: Legacy font sizes - use semantic text-* and heading-* tokens instead
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
