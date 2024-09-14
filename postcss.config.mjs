import process from 'process';

const plugins = { 'tailwindcss': {}, 'postcss-nested': {}, 'autoprefixer': {} };

if (process.env.NODE_ENV !== 'development') {
  plugins.cssnano = {};
}

// eslint-disable-next-line no-undef
module.exports = {
  plugins,
};
