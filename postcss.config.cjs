const process = require('node:process');

const plugins = {
  'autoprefixer': {},
  'postcss-import': {},
  'tailwindcss': {},
  'tailwindcss/nesting': {},
};

if (process.env.NODE_ENV !== 'development') {
  plugins.cssnano = {};
}

module.exports = {
  plugins,
};
