/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FDFCF9',
          100: '#F9F7F2',
          200: '#F2EFE7',
        },
        sage: {
          400: '#7AAE96',
          500: '#5B8A6E',
          600: '#4A7259',
          700: '#3A5A46',
        },
        slate: {
          850: '#1A2332',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
