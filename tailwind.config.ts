
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
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
				// Soul palette - now properly mapped to semantic tokens
				soul: {
					// Legacy soul colors mapped to design system
					ivory: 'hsl(var(--background))', // #FCF8F6
					teal: '180 100% 41%', // #00BBD1 - kept for specific gradients
					pewter: 'hsl(var(--muted))', // #96A1A8
					purple: 'hsl(var(--primary))', // #9b87f5
					indigo: '234 89% 74%', // #6366f1
					blue: '232 65% 61%', // #4f74e3
					lavender: 'hsl(var(--accent))', // #d6bcfa
					gold: '51 95% 65%', // #fad161
					black: 'hsl(var(--foreground))' // #1A1F2C
				}
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
				// Soul-based gradients using semantic tokens
				'cosmic-gradient': 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))',
				'cosmic-radial': 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, hsl(var(--accent) / 0.05) 70%, hsl(var(--background)) 100%)',
				'soul-gradient': 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))',
				'soul-radial': 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, hsl(var(--accent) / 0.1) 50%, hsl(var(--background)) 100%)'
			},
			backgroundSize: {
				'200': '200%'
			},
			fontFamily: {
				// Inter-based font hierarchy
				sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'], // Primary Inter font
				body: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'], // Primary body text
				ui: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'], // UI elements, buttons, forms
				heading: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'], // Headlines, titles
				focus: ['Lexend', 'Inter', 'system-ui', 'sans-serif'], // Reading mode, focused content
			},
			spacing: {
				'grid-8': '8px',
				'grid-16': '16px',
				'grid-24': '24px',
			},
			boxShadow: {
				'soft-ui': '4px 4px 10px rgba(155, 135, 245, 0.1)', // soul-purple based
				'soul-glow': '0 0 20px hsl(var(--primary) / 0.3)'
			},
			lineHeight: {
				'normal': '1.5',
			},
			fontSize: {
				'base': '16px',
				'lg': '20px',
				'xl': '24px',
				'2xl': '24px',
				'3xl': '32px',
				'4xl': '32px',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
