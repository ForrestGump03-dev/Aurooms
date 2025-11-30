/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        sand: {
          100: '#fef7ed',
          200: '#fed7aa',
          300: '#fdba74',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'sicily-hero': "url('https://images.unsplash.com/photo-1544873175-2c6c15d9db0b?q=80&w=2070')",
        'room-luxury': "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070')",
      }
    },
  },
  plugins: [],
}