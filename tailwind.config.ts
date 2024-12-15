import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',

        bg: '#1B262C',
        bgH: 'hsl(201, 24%, 14%)',

        head: '#0F4C75',
        headH: 'hsl(204, 77%, 26%)',

        normal: '#3282B8',
        normalH: 'hsl(204, 57%, 46%)',

        dark: '#00141f',

        light: '#BBE1FA',
        lightH: 'hsl(204, 86%, 86%)',

        success: '#5cb85c',
        error: '#f66',

        white: '#fff',
        black: '#000',
        grey: '#888',
      },
      keyframes: {
        sloshow: {
          '0%, 100%': { opacity: '0' },
          '25%, 75%': { opacity: '1' },
        },
        neonFlash: {
          '0%, 100%': {
            color: '#3498db',
            textShadow: `
              0 0 5px #3498db,
              0 0 10px #3498db,
              0 0 20px #3498db,
              0 0 40px #3498db,
              0 0 80px #3498db
            `,
          },
          '50%': {
            color: '#0d0d0d',
            textShadow: 'none',
          },
        },
      },
      animation: {
        neonFlash: 'neonFlash 3s infinite',
      },

      screens: {
        xs: '400px',
        ssm: '539px',
      },
      gridRow: {
        'span-12': 'span 12 / span 12',
      },
      gridCol: {
        'span-12': 'span 12 / span 12',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
