/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0a0f',
        paper: '#13111c',
        primary: {
          DEFAULT: '#8b5cf6',
          container: '#1e1b29',
        },
        secondary: {
          DEFAULT: '#06b6d4',
          container: '#083344',
        },
        accent: {
          DEFAULT: '#f59e0b',
          container: '#451a03',
        },
        border: {
          subtle: '#262235',
        },
        ink: {
          text: '#f3f4f6',
          muted: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Outfit', 'sans-serif'],
        labels: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      }
    },
  },
  plugins: [],
}
