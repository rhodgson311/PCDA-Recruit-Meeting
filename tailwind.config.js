/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pcdaPrimary: '#26a8e0',
        pcdaSecondary: '#96a8ab',
      },
      borderRadius: {
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
};
