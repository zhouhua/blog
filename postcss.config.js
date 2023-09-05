const plugins = { 'tailwindcss': {}, 'postcss-nested': {}, 'autoprefixer': {} };

if (process.env.NODE_ENV !== 'development') {
  plugins.cssnano = {};
}

module.exports = {
  plugins
};
