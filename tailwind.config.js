/** @type {import('tailwindcss').Config} */
module.exports = {
   darkMode: 'class', // ✅ important
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        /* --font-jakarta is injected by Next.js font optimisation in layout.jsx */
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};