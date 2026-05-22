/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F0F12',
          card: '#16161D',
          border: '#24242E',
          text: '#E2E2E9'
        },
        battle: {
          primary: '#8B5CF6',    // Vibrant Violet
          secondary: '#3B82F6',  // Neon Blue
          accent: '#10B981',     // Emerald Green
          error: '#EF4444'       // Bright Red
        }
      }
    },
  },
  plugins: [],
}
