/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // adjust if using pages or src folder
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-instrument-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
