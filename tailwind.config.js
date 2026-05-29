/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#4F46E5', // Indigo
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
        heading: ['Heebo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}