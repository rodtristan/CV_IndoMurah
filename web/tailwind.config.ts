import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        highlight: 'var(--color-highlight)',
        highlighted: 'var(--color-highlighted)',
        toned: 'var(--color-toned)',
        default: 'var(--color-default)',
        muted: 'var(--color-muted)',
        bg: 'var(--color-bg)',
        elevated: 'var(--color-elevated)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        danger: 'var(--color-danger)',
        highlight2: 'var(--color-highlight2)',
      },
      borderColor: {
        DEFAULT: 'var(--color-default)',
      },
    },
  },
  plugins: [],
};

export default config;
