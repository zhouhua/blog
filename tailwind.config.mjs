import { addIconSelectors } from '@iconify/tailwind';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  daisyui: {
    prefix: 'daisy-',
    themes: [],
  },
  darkMode: ['class'],
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    addIconSelectors(['fa6-solid', 'oui', 'vaadin', 'heroicons', 'akar-icons', 'iconamoon', 'material-symbols', 'carbon', 'simple-icons', 'ri', 'mdi', 'maki', 'uil', 'bi', 'lucide-lab']),
    require('daisyui'),
  ],
  theme: {
    container: {
      center: 'true',
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'rainbow': 'rainbow var(--speed, 2s) infinite linear',
        'ripple': 'ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite',
        'shine': 'shine var(--duration) infinite linear',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        ...colors,
        'accent': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'background': 'hsl(var(--background))',
        'border': 'hsl(var(--border))',
        'card': {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'chart': {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        'color-1': 'hsl(var(--color-1))',
        'color-2': 'hsl(var(--color-2))',
        'color-3': 'hsl(var(--color-3))',
        'color-4': 'hsl(var(--color-4))',
        'color-5': 'hsl(var(--color-5))',
        'dark': {
          prism: {
            'attrName': '#bf87ba',
            'attrValue': '#a8e2a8',
            'background': '#292c34',
            'boolean': '#ff5874',
            'className': '#ffcf74',
            'comment': '#5e6a76',
            'constant': '#b3bac5',
            'doctype': '#e8696b',
            'dom': '#5F8DC3',
            'function': '#5F8DC3',
            'highlight': 'rgba(233,218,172,0.2)',
            'highlightBorder': 'rgba(232,105,107,0.4)',
            'interpolation': '#fff',
            'javascript': '#e8696b',
            'keyword': '#d49fd4',
            'languageJavascript': '#e8696b',
            'linenumber': '#dcd9e6',
            'maybe-class-name': '#fff',
            'namespace': '#b2ccd6',
            'number': '#e4854d',
            'operator': '#5FA8AA',
            'parameter': '#F9965D',
            'plain': '#fff',
            'property': '#80cbc4',
            'propertyAccess': '#fff',
            'punctuation': '#5FA8AA',
            'string': '#a8e2a8',
            'tag': '#e8696b',
            'token': '#fff',
            'var': '#b3bac5',
          },
        },
        'destructive': {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        'foreground': 'hsl(var(--foreground))',
        'input': 'hsl(var(--input))',
        'muted': {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        'palette': {
          accent: 'rgb(var(--color-accent) / <alpha-value>)',
          bg: 'rgb(var(--color-bg) / <alpha-value>)',
          bgAlt: 'rgb(var(--color-bg-alt) / <alpha-value>)',
          bgRevert: 'rgb(var(--color-bg-revert) / <alpha-value>)',
          card: 'rgb(var(--color-card) / <alpha-value>)',
          error: 'rgb(var(--color-error) / <alpha-value>)',
          gray: 'rgb(var(--color-gray) / <alpha-value>)',
          primary: 'rgb(var(--color-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
          success: 'rgb(var(--color-success) / <alpha-value>)',
          warn: 'rgb(var(--color-warn) / <alpha-value>)',
        },
        'popover': {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        'primary': {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        'prism': {
          'attrName': '#91b3e0',
          'attrValue': '#448c27',
          'background': '#f5f5f5',
          'boolean': '#ab6526',
          'className': '#aa3731',
          'comment': '#aaa',
          'constant': '#ab6526',
          'doctype': '#aaa',
          'dom': '#4b83cd',
          'function': '#aa3731',
          'highlight': '#e4f6d4',
          'highlightBorder': '#c1f5b0',
          'interpolation': '#ab6526',
          'javascript': '#724198',
          'keyword': '#4b83cd',
          'languageJavascript': '#724198',
          'linenumber': '#6E705D',
          'maybe-class-name': '#000',
          'namespace': '#4b83cd',
          'number': '#ab6526',
          'operator': '#777',
          'parameter': '#333',
          'plain': '#000',
          'property': '#ab6526',
          'propertyAccess': '#448c27',
          'punctuation': '#777',
          'string': '#448c27',
          'tag': '#91b3e0',
          'token': '#000',
          'var': '#7a3e9d',
        },
        'ring': 'hsl(var(--ring))',
        'secondary': {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
      },
      fontFamily: {
        monospace: ['Fira Code', 'Operator Mono', 'Consolas', 'Menlo', 'Monaco', 'source-code-pro', 'Courier New', 'monospace'],
        sans: ['apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'helvetica neue', 'helvetica', 'ubuntu', 'roboto', 'noto', 'segoe ui', 'Arial', 'sans-serif'],
        serif: ['LXGW WenKai Lite', 'apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'helvetica neue', 'helvetica', 'ubuntu', 'roboto', 'noto', 'segoe ui', 'Arial', 'sans-serif'],
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
        'border-beam': {
          '100%': {
            'offset-distance': '100%',
          },
        },
        'rainbow': {
          '0%': {
            'background-position': '0%',
          },
          '100%': {
            'background-position': '200%',
          },
        },
        'ripple': {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '50%': {
            transform: 'translate(-50%, -50%) scale(0.9)',
          },
        },
        'shine': {
          '0%': {
            'background-position': '0% 0%',
          },
          '50%': {
            'background-position': '100% 100%',
          },
          'to': {
            'background-position': '0% 0%',
          },
        },
      },
      screens: {
        '2xl': {
          max: '1536px',
          min: '1281px',
        },
        '3xl': {
          min: '1537px',
        },
        'lg': {
          max: '1024px',
          min: '769px',
        },
        'md': {
          max: '768px',
          min: '640px',
        },
        'sm': {
          max: '640px',
        },
        'xl': {
          max: '1280px',
          min: '1025px',
        },
      },
    },
  },
};
