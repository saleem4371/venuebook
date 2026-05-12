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
        /* Primary: Plus Jakarta Sans for Latin/Latin-ext.
           Supplemental Noto Sans fonts (--font-devanagari, --font-kannada,
           --font-arabic) are applied via :lang() selectors in globals.css
           so the browser loads only what the active locale requires.        */
        sans: [
          "var(--font-jakarta)",
          "var(--font-devanagari)",
          "var(--font-kannada)",
          "var(--font-arabic)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".no-scrollbar::-webkit-scrollbar": { display: "none" },
        ".no-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
      });
    },
  ],
};