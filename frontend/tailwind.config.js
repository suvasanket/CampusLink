/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        agency: {
          950: '#090a0f',
          900: '#0e111a',
          850: '#131722',
          800: '#1a1f2c',
          750: '#1f2535',
          700: '#262d40',
          600: '#38425d',
        },
        studio: {
          emerald: '#10b981',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        }
      },
      boxShadow: {
        'agency-card': '0 10px 30px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'agency-glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 20px 40px -15px rgba(0, 0, 0, 0.8)',
        'agency-glow': '0 0 30px -5px rgba(16, 185, 129, 0.15)',
        'agency-amber': '0 0 25px -5px rgba(245, 158, 11, 0.15)',
      }
    },
  },
  plugins: [],
}
