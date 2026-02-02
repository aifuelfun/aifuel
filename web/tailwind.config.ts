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
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8559',
          dark: '#E55A2B',
          50: '#FFF5F0',
          100: '#FFE5D9',
          200: '#FFCBB3',
          300: '#FFB18D',
          400: '#FF8E59',
          500: '#FF6B35',
          600: '#E55A2B',
          700: '#CC4A21',
          800: '#993817',
          900: '#66250F',
        },
        dark: {
          DEFAULT: '#1A1A2E',
          light: '#25253D',
          lighter: '#2D2D4A',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 50%, #CC4A21 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
