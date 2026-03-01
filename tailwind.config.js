/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1fcf8',
          100: '#ccf6e8',
          600: '#059669',
          700: '#047857',
        },
      },
    },
  },
  plugins: [],
};
