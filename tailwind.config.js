/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#000000',
          light: '#1a1a1a',
          dark: '#000000'
        },
        foreground: {
          DEFAULT: '#ffffff',
          muted: '#a1a1aa',
          accent: '#f4f4f5'
        },
        primary: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: '#27272a',
          foreground: '#ffffff'
        },
        muted: {
          DEFAULT: '#27272a',
          foreground: '#a1a1aa'
        },
        accent: {
          DEFAULT: '#18181b',
          foreground: '#ffffff'
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff'
        },
        border: '#27272a',
        input: '#27272a',
        ring: '#27272a'
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};

