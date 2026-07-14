/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background, #0b0a0f)',
        paper: 'var(--surface, #13111c)',
        primary: {
          DEFAULT: 'var(--primary, #8b5cf6)',
          container: 'var(--primary-container, #1e1b29)',
        },
        secondary: {
          DEFAULT: 'var(--secondary, #06b6d4)',
          container: 'var(--secondary-container, #083344)',
        },
        accent: {
          DEFAULT: 'var(--accent, #f59e0b)',
          container: 'var(--accent-container, #451a03)',
        },
        border: {
          subtle: 'var(--border, #262235)',
        },
        ink: {
          text: 'var(--text-primary, #f3f4f6)',
          muted: 'var(--text-secondary, #9ca3af)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Outfit', 'sans-serif'],
        labels: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius, 0.375rem)',
        md: 'calc(var(--radius, 0.375rem) * 1.33)',
        lg: 'calc(var(--radius, 0.375rem) * 2)',
        xl: 'calc(var(--radius, 0.375rem) * 2.66)',
      }
    },
  },
  plugins: [],
}
