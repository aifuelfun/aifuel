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
        // Pure Contrast Theme - 极简高对比
        primary: {
          DEFAULT: '#00d4ff',  // 亮蓝
          light: '#33e0ff',
          dark: '#00a8cc',
        },
        secondary: {
          DEFAULT: '#ff6b35',  // 橙色
          light: '#ff8c5f',
          dark: '#cc5529',
        },
        // Background
        dark: {
          DEFAULT: '#1a1a1a',      // 主背景
          card: '#2a2a2a',         // 卡片
          lighter: '#3a3a3a',      // 更亮
        },
        // Borders
        border: {
          DEFAULT: '#444444',
          light: '#555555',
        },
        // Text - 高对比度
        text: {
          DEFAULT: '#ffffff',      // 纯白
          muted: '#cccccc',        // 浅灰（清晰）
          dim: '#999999',          // 暗灰
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
      },
    },
  },
  plugins: [],
}

export default config
