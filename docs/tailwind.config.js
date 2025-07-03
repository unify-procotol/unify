/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}',
    // Include @unilab/unify-ui package content
    '../packages/unify-ui/src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@unilab/unify-ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
    },
  },
  plugins: [],
} 