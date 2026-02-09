import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Solana Brand Colors
        primary: {
          DEFAULT: '#14F195',
          light: '#5FFAC1',
          dark: '#0FD67E',
        },
        secondary: {
          DEFAULT: '#9945FF',
          light: '#B96FFF',
          dark: '#7B2ECC',
        },
        // Background
        'sol-dark': {
          DEFAULT: '#0f0f23',
          card: '#1a1a33',
          lighter: '#252545',
        },
        // Borders
        'sol-border': {
          DEFAULT: '#27273a',
          light: '#3a3a55',
        },
        // Text
        'sol-text': {
          DEFAULT: '#e4e4e7',
          muted: '#a1a1aa',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-sol': 'linear-gradient(135deg, #14F195 0%, #9945FF 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
