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
        cad: {
          950: '#0a0d12',
          900: '#11151c',
          850: '#171c26',
          800: '#1e2430',
          700: '#2b3345',
          600: '#3d485e',
          500: '#586785',
          400: '#7e8ea6',
          300: '#a6b4c9',
          200: '#d0daea',
          100: '#eef3fb',
          accent: '#3b82f6',
          accentHover: '#2563eb',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
