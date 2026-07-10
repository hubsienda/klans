import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 12px 35px rgba(26, 24, 20, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
