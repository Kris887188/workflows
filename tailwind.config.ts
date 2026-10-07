import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { ink: '#1e293b', paper: '#f8fafc', calm: '#eef2ff' } } },
  plugins: []
} satisfies Config;
