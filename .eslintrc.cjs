module.exports = {
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    // practical backend relaxations
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'import/prefer-default-export': 'off',
  },
}
