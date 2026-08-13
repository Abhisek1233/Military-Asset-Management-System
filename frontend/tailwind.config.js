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
        // Page & Panel Backgrounds
        page: {
          dark: '#0F172A',
          light: '#F8FAFC',
        },
        surface: {
          card: {
            dark: '#1E293B',
            light: '#FFFFFF',
          },
          hover: {
            dark: '#273449',
            light: '#F1F5F9',
          },
          border: {
            light: '#E2E8F0',
            dark: '#334155',
          }
        },
        // Typography
        txt: {
          primary: {
            dark: '#F8FAFC',
            light: '#0F172A',
          },
          muted: {
            dark: '#94A3B8',
            light: '#64748B',
          }
        },
        // Accent Colors
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#E6F1FB',
        },
        // Status System Colors
        status: {
          success: {
            bg: '#1D9E75',
            darkText: '#5DCAA5',
            lightText: '#04342C',
            fillLight: '#D1F4E8',
          },
          danger: {
            bg: '#E24B4A',
            darkText: '#F09595',
            lightText: '#501313',
            fillLight: '#FCE4E4',
          },
          warning: {
            bg: '#EF9F27',
            darkText: '#FCD34D',
            lightText: '#412402',
            fillLight: '#FEF3C7',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
