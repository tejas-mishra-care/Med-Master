import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  // TODO: Consider changing the project name in content paths if necessary
  // Also ensure your build process handles these paths correctly
  // Remember to set up your .env file for production builds!
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ['PT Sans', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        // Define your color tokens here:
        // PRIMARY: Your primary brand color (e.g., for buttons, headings)
        // ACCENT: A secondary color for emphasis (e.g., call-to-actions)
        // HIGHLIGHT: Used for important elements or interactive states
        // BG: The main background color
        // Add dark variants as needed for dark mode
        PRIMARY: '#1E3A8A',
        ACCENT: '#14B8A6',
        HIGHLIGHT: '#F59E0B',
        BG: '#F8FAFC',
        // Example of a dark variant (you can add more as per your design)
        'BG-dark': '#1E293B',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
