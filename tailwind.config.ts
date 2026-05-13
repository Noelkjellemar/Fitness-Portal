import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0A0A0A',
          surface: '#1A1326',
          card: '#251A38',
          slate: '#3A2A52',
          cream: '#F3EFFD',
          bronze: '#B19CD9',
        },
      },
      fontFamily: {
        headline: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['Playfair Display', 'serif'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['28px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'draw': 'draw 0.6s ease forwards',
        'count': 'count 1.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'glow': 'glow 3s ease-in-out infinite',
        'aurora': 'aurora 60s linear infinite',
      },
      keyframes: {
        aurora: {
          'from': { backgroundPosition: '50% 50%, 50% 50%' },
          'to': { backgroundPosition: '350% 50%, 350% 50%' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        draw: {
          'to': { strokeDashoffset: '0' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(32px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(40px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(177, 156, 217, 0)' },
          '50%': { boxShadow: '0 0 20px rgba(177, 156, 217, 0.25)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
