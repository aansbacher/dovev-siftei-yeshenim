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
        navy:    { DEFAULT: '#5B76E5', light: '#8098EE', dark: '#4359C6' },
        cream:   { DEFAULT: '#EEF1FD', dark: '#DDE3F8' },
        gold:    { DEFAULT: '#5B76E5', light: '#8098EE', dark: '#4359C6' },
        success: '#3DBE8B',
        'gray-light': '#E6E9F6',
        bg:      '#EAEDF9',
        text:    '#2A3350',
        accent:  '#5B76E5',
        // semantic tokens
        ground:    '#EAEDF9',
        surface:   '#FFFFFF',
        'surface-2': '#F1F3FC',
        ink:       '#2A3350',
        'ink-soft': '#5B6480',
        muted:     '#98A0B8',
        'gold-deep': '#4359C6',
        rule:      '#E6E9F6',
        'accent-soft': '#EEF1FD',
        // warm secondary accent (holiness)
        warm:      { DEFAULT: '#D9A24E', deep: '#B4772A', soft: '#FBF2E3' },
      },
      fontFamily: {
        sans:    ['Rubik', 'Heebo', 'sans-serif'],
        heading: ['Rubik', 'Heebo', 'sans-serif'],
        display: ['Rubik', 'Heebo', 'sans-serif'],
        serif:   ['"Frank Ruhl Libre"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
