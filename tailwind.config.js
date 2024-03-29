/** @type {import('tailwindcss').Config} */
const withMT = require('@material-tailwind/react/utils/withMT');
module.exports = withMT({
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
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

      white: '#fff',
      black: '#000',
    },
    extend: {
      keyframes: {
        sloshow: {
          '0%, 100%': { opacity: 0 },
          '25%, 75%': { opacity: 1 },
        },
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
  plugins: [],
});
