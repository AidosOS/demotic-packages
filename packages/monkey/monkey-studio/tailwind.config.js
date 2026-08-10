/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        'app-bg': '#050505',
        'panel-bg': '#0a0a0a',
        'card-bg': '#111111',
        primary: '#4262ff',
        'primary-hover': '#5b76fe',
        accent: '#ffd02f',
        'accent-hover': '#fcb900',
        secondary: '#a5a8b5',
        muted: '#6b7280',
      },
    },
  },
  plugins: [],
}
