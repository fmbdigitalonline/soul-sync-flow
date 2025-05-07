
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
				soul: {
					// Updated nature-inspired palette based on new design brief
					stone: '#F7F5F2',
					clay: '#DFD6CE',
					sage: '#6D9C8A',
					teal: '#33666F',
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
					'50%': { transform: 'translateY(-8px)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'micro-bounce': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.03)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s cubic-bezier(0.25, 0.8, 0.5, 1) infinite',
				'pulse-soft': 'pulse-soft 2s cubic-bezier(0.25, 0.8, 0.5, 1) infinite',
				'gradient-shift': 'gradient-shift 8s cubic-bezier(0.25, 0.8, 0.5, 1) infinite',
				'micro-bounce': 'micro-bounce 0.15s cubic-bezier(0.25, 0.8, 0.5, 1)'
			},
			backgroundImage: {
				'cosmic-gradient': 'linear-gradient(to right, #33666F, #6D9C8A)',
				'cosmic-radial': 'radial-gradient(circle, rgba(109, 156, 138, 0.15) 0%, rgba(51, 102, 111, 0.05) 70%, rgba(255, 255, 255, 0) 100%)'
			},
			backgroundSize: {
				'200': '200%'
			},
			fontFamily: {
				sans: ['"Nunito Sans"', 'system-ui', 'sans-serif'],
				ui: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
				display: ['Satoshi', 'system-ui', 'sans-serif'],
				focus: ['"IBM Plex Sans"', 'system-ui', 'sans-serif']
			},
			spacing: {
				'grid-8': '8px',
				'grid-16': '16px',
				'grid-24': '24px',
			},
			boxShadow: {
				'soft-ui': '2px 4px 8px rgba(0, 0, 0, 0.1)'
			},
			fontSize: {
				'base': '16px',
				'lg': '20px',
				'xl': '24px',
				'2xl': '32px',
			},
			lineHeight: {
				'relaxed': '1.5',
			},
			letterSpacing: {
				'focus': '0.04em',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
