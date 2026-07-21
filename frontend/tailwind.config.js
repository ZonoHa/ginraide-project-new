/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wongnai: {
          orange: '#FF8A00',
          dark: '#111111',
          light: '#F8F9FA'
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Thai"', 'Prompt', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
