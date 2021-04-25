module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    // airbnb
    'airbnb',
    // import
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    // prettier
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'import'],
};
