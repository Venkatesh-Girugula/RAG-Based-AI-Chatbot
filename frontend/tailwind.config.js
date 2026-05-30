/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support class-based dark mode
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#38abfa',
          500: '#0e91eb',
          600: '#0273ca',
          700: '#035ca3',
          800: '#074e87',
          900: '#0c4270',
          950: '#082a4a',
        },
        slate: {
          950: '#090d16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(14, 145, 235, 0.15)',
      }
    },
  },
  plugins: [],
}
