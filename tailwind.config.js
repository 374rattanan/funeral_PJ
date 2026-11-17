/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Prompt"', '"Sarabun"', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FCF9F3',
          100: '#F7EFE2',
          200: '#EFE1CA',
          300: '#E2CCA8',
        },
        gold: {
          500: '#B5945B',
          600: '#9B7B45',
          700: '#7C6032',
        },
        forest: {
          600: '#2E5A44',
          700: '#234635',
          800: '#1B3629',
        },
        charcoal: {
          800: '#4A4946',
          900: '#353432',
        }
      }
    },
  },
  plugins: [],
}
