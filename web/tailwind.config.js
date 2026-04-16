/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // 🟠 MAXX Brand Orange
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FC5F16', // ← Laranja oficial MAXX
          600: '#e04f0f',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Dark theme palette (inspirado no Gerador Premium)
        dark: {
          900: '#09090b',
          800: '#18181b',
          700: '#27272a',
          600: '#3f3f46',
          500: '#52525b',
        },
        primary: '#FC5F16',
        card: '#18181b',
      },
      animation: {
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(252, 95, 22, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(252, 95, 22, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
