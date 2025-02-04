module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'max-len': ['error', { code: 250 }],
    'no-underscore-dangle': [
      'error',
      { allow: ['_dynamicUrl', '_publishUrl', '_path'] },
    ],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'xwalk/no-orphan-collapsible-fields': 'off',
    'xwalk/max-cells': ['error', {
      // blocks should not generate more than 4 cells
      // The exceptions listed here were implemented before the rule was enabled and explained
      // to the team by Adobe. The whole team agreed to not refactor them now, but to keep the
      // default configuration for any new block (model).
      teaser: 13,
      'banner-carousel-car': 10,
      'best-deals': 5,
      'book-test-drive': 31,
      'book-showroom-visit': 13,
      'brand-header': 7,
      'car-detail-banner': 11,
      'car-detail-feature': 7,
      'car-filter': 5,
      ctaWithIcon: 5,
      highlight: 10,
      location: 9,
      'press-releases': 6,
      'press-releases-details': 5,
      'sign-in': 6,
      'variant-listing': 8,
    }],
  },
  overrides: [
    {
      files: ['**/googleMap.js', '**/book-test-drive.js', '**/book-test-drive/calender.js', '**/journey-carousel.js'],
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-redeclare': 'off',
        'no-use-before-define': 'off',
        'no-shadow': 'off',
        'no-inner-declarations': 'off',
        'no-loop-func': 'off',
        'no-return-assign': 'off',
        'no-restricted-syntax': 'off',
        'no-empty': 'off',
        'consistent-return': 'off',
      },
    },
  ],
};
