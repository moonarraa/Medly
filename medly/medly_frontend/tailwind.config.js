/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e8f5f5',
          100: '#c2e6e5',
          200: '#9dd6d5',
          300: '#73c5c4',
          400: '#4eb7b6',
          500: '#2daba8',
          600: '#288f8c',
          700: '#2d7272',
          800: '#1e5757',
          900: '#123b3b',
        },
      },
    },
  },
  plugins: [],
}
