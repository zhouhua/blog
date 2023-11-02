import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx,css}',
    './src/components/**/*.{js,jsx,ts,tsx,css}',
    './src/templates/**/*.{js,jsx,ts,tsx,css}',
    './src/sections/**/*.{js,jsx,ts,tsx,css}',
    './src/styles/**/*.css'
  ],
  theme: {
    colors: {
      palette: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        gray: 'rgb(var(--color-gray) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warn: 'rgb(var(--color-warn) / <alpha-value>)',
        bgAlt: 'rgb(var(--color-bg-alt) / <alpha-value>)',
        bgRevert: 'rgb(var(--color-bg-revert) / <alpha-value>)'
      },
      dark: {
        prism: {
          'token': '#fff',
          'languageJavascript': '#e8696b',
          'javascript': '#e8696b',
          'background': '#292c34',
          'comment': '#5e6a76',
          'string': '#a8e2a8',
          'var': '#b3bac5',
          'number': '#e4854d',
          'constant': '#b3bac5',
          'plain': '#fff',
          'doctype': '#e8696b',
          'tag': '#e8696b',
          'keyword': '#d49fd4',
          'boolean': '#ff5874',
          'function': '#5F8DC3',
          'parameter': '#F9965D',
          'className': '#ffcf74',
          'attrName': '#bf87ba',
          'attrValue': '#a8e2a8',
          'interpolation': '#fff',
          'punctuation': '#5FA8AA',
          'maybe-class-name': '#fff',
          'property': '#80cbc4',
          'propertyAccess': '#fff',
          'namespace': '#b2ccd6',
          'highlight': 'rgba(233,218,172,0.2)',
          'highlightBorder': 'rgba(232,105,107,0.4)',
          'dom': '#5F8DC3',
          'operator': '#5FA8AA',
          'linenumber': '#dcd9e6'
        }
      },
      prism: {
        'token': '#000',
        'languageJavascript': '#724198',
        'javascript': '#724198',
        'background': '#f5f5f5',
        'comment': '#aaa',
        'string': '#448c27',
        'var': '#7a3e9d',
        'number': '#ab6526',
        'constant': '#ab6526',
        'plain': '#000',
        'doctype': '#aaa',
        'tag': '#91b3e0',
        'keyword': '#4b83cd',
        'boolean': '#ab6526',
        'function': '#aa3731',
        'parameter': '#333',
        'className': '#aa3731',
        'attrName': '#91b3e0',
        'attrValue': '#448c27',
        'interpolation': '#ab6526',
        'punctuation': '#777',
        'maybe-class-name': '#000',
        'property': '#ab6526',
        'propertyAccess': '#448c27',
        'namespace': '#4b83cd',
        'highlight': '#e4f6d4',
        'highlightBorder': '#c1f5b0',
        'dom': '#4b83cd',
        'operator': '#777',
        'linenumber': '#6E705D'
      }
    },
    fontFamily: {
      serif: [
        'LXGW WenKai Lite',
        'apple-system',
        'BlinkMacSystemFont',
        'PingFang SC',
        'Hiragino Sans GB',
        'Microsoft YaHei',
        'helvetica neue',
        'helvetica',
        'ubuntu',
        'roboto',
        'noto',
        'segoe ui',
        'Arial',
        'sans-serif'
      ],
      sans: [
        'apple-system',
        'BlinkMacSystemFont',
        'PingFang SC',
        'Hiragino Sans GB',
        'Microsoft YaHei',
        'helvetica neue',
        'helvetica',
        'ubuntu',
        'roboto',
        'noto',
        'segoe ui',
        'Arial',
        'sans-serif'
      ],
      monospace: [
        'Fira Code',
        'Operator Mono',
        'Consolas',
        'Menlo',
        'Monaco',
        'source-code-pro',
        'Courier New',
        'monospace'
      ]
    },
    extend: {
      screens: {
        'sm': { max: '640px' },
        'md': { min: '640px', max: '768px' },
        'lg': { min: '769px', max: '1024px' },
        'xl': { min: '1025px', max: '1280px' },
        '2xl': { min: '1281px', max: '1536px' },
        '3xl': { min: '1537px' }
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: []
  }
} satisfies Config;
