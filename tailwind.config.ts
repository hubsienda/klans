import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 12px 35px rgba(24, 23, 20, 0.055)',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
