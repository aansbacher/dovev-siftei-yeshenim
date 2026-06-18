/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#1E2A38', light: '#2C3E52', dark: '#141E28' },
        cream:   { DEFAULT: '#F7F3EA', dark: '#EDE8DC' },
        gold:    { DEFAULT: '#B89552', light: '#CEB070', dark: '#9A7A3E' },
        success: '#4F7A52',
        'gray-light': '#E7E3DA',
        bg:      '#FCFAF5',
        text:    '#1F1F1F',
        accent:  '#B89552',
      },
      fontFamily: {
        sans:    ['Heebo', 'sans-serif'],
        heading: ['Heebo', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}