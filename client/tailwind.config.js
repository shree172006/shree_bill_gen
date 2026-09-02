/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a', // Royal Blue
          dark: '#172554',
          light: '#2563eb',
        },
        crimson: {
          DEFAULT: '#dc2626', // Crimson Red
          dark: '#991b1b',
          light: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
