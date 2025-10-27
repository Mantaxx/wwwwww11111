module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        'last 2 versions',
        '> 1%',
        'iOS >= 9',
        'Safari >= 9',
        'Chrome >= 54',
        'Firefox >= 54',
        'Edge >= 79',
      ],
    },
  },
};
