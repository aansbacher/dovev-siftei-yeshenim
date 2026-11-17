/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // clean-soft palette (מזמור-יומי style)
        navy:    { DEFAULT: '#B4772A', light: '#D9A24E', dark: '#935E1C' },
        cream:   { DEFAULT: '#FBF2E3', dark: '#F0E4CE' },
        gold:    { DEFAULT: '#B4772A', light: '#D9A24E', dark: '#935E1C' },
        success: '#3DBE8B',
        'gray-light': '#E6E9F6',
        bg:      '#EAEDF9',
        text:    '#2A3350',
        accent:  '#B4772A',
        // semantic tokens
        ground:    '#EAEDF9',
        surface:   '#FFFFFF',
        'surface-2': '#F1F3FC',
        ink:       '#2A3350',
        'ink-soft': '#5B6480',
        muted:     '#98A0B8',
        'gold-deep': '#935E1C',
        rule:      '#E6E9F6',
        'accent-soft': '#FBF2E3',
        // warm secondary accent (holiness)
        warm:      { DEFAULT: '#D9A24E', deep: '#B4772A', soft: '#FBF2E3' },
      },
      fontFamily: {
        sans:    ['Rubik', 'Heebo', 'sans-serif'],
        heading: ['Rubik', 'Heebo', 'sans-serif'],
        display: ['"Frank Ruhl Libre"', 'Rubik', 'Heebo', 'serif'],
        serif:   ['"Frank Ruhl Libre"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
