/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#1B2530', light: '#2C3E52', dark: '#141E28' },
        cream:   { DEFAULT: '#F3ECDE', dark: '#E7DCC5' },
        gold:    { DEFAULT: '#9C7734', light: '#BE9A54', dark: '#7E5F27' },
        success: '#4F7A52',
        'gray-light': '#D9CDB4',
        bg:      '#EFE7D6',
        text:    '#1B2530',
        accent:  '#9C7734',
        // semantic tokens
        ground:    '#EFE7D6',
        surface:   '#FBF8F1',
        'surface-2': '#F4ECDD',
        ink:       '#1B2530',
        'ink-soft': '#4C5560',
        muted:     '#918972',
        'gold-deep': '#7E5F27',
        rule:      '#D9CDB4',
      },
      fontFamily: {
        sans:    ['Heebo', 'sans-serif'],
        heading: ['Heebo', 'sans-serif'],
        display: ['"Frank Ruhl Libre"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
