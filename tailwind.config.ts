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
        // Solana Brand Colors (高对比度优化版)
        primary: {
          DEFAULT: '#14F195',  // Solana 绿
          light: '#5FFAC1',
          dark: '#0FD67E',
        },
        secondary: {
          DEFAULT: '#9945FF',  // Solana 紫
          light: '#B96FFF',
          dark: '#7B2ECC',
        },
        // Background (优化对比度)
        'sol-dark': {
          DEFAULT: '#0f0f23',      // 主背景
          card: '#1e1e3a',         // 卡片背景 (提亮)
          lighter: '#2a2a48',      // 更亮的卡片
        },
        // Borders (更清晰)
        'sol-border': {
          DEFAULT: '#3a3a55',      // 边框 (提亮)
          light: '#4a4a65',
        },
        // Text (高对比度)
        'sol-text': {
          DEFAULT: '#f4f4f5',      // 主文字 (提亮)
          muted: '#d4d4d8',        // 次要文字 (大幅提亮)
          dim: '#a1a1aa',          // 更暗的辅助文字
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
