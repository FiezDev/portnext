/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      
      'bg': '#1B262C',
      'bgH': 'hsl(201, 24%, 14%)',

      'head': '#0F4C75',
      'headH': 'hsl(204, 77%, 26%)',

      'normal': '#3282B8',
      'normalH': 'hsl(204, 57%, 46%)',

      'light': '#BBE1FA',
      'lightH': 'hsl(204, 86%, 86%)',

      'white': '#fff',
      'black': '#000'
    },
    extend: {
      screens: {
        'ssm': '400px',
      },
      gridRow: {
        'span-12': 'span 12 / span 12',
      },
      gridCol: {
        'span-12': 'span 12 / span 12',
      }
    },
  },
  plugins: [],
}