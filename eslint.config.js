const globals = require('globals');
const babelParser = require('@babel/eslint-parser');
const eslintConfig = require('eslint-config-eslint');
const { FlatCompat } = require('@eslint/eslintrc');
const eslintHooks = require('eslint-plugin-react-hooks');
const react = require('eslint-plugin-react');
const reactRecommended = require('eslint-plugin-react/configs/recommended');

const compat = new FlatCompat();

const dlGlobals = {
    DL: true,
    dl: true,
    FHS: true,
    $: true,
    _: true,
    argumentValidator: true,
    Ext: true,
    xn: true,
    ajaxAdapter: true,
    moment: true,
    messageMask: true,
    messageHelper: true,
    rolesAttention: true,
    statuses: true,
    DlUtils: true
};

const browserGlobals = {
    ...globals.browser,
    ...dlGlobals
};

const nodeGlobals = {
    ...globals.node,
    ...dlGlobals
};

const testGlobals = {
    ...nodeGlobals,
    describe: true,
    before: true,
    after: true,
    it: true
};

const hooksConfig = compat.config(eslintHooks.configs.recommended)[0];
hooksConfig.files = [ 'web/reactjs/**/*.{js,jsx}' ];

const reactConfig = {
    files: [ 'web/reactjs/**/*.{js,jsx}' ],
    plugins: { react },
    rules: {
        ...reactRecommended.rules,
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/no-unstable-nested-components': 'error',
        'callback-return': 'off'
    },
    languageOptions: {
        globals: { ...browserGlobals },
        parser: babelParser,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true
            },
            requireConfigFile: false,
            babelOptions: {
                presets: ['@babel/preset-react']
            }
        }
    }
};

const browserConfig = {
    files: [
        'web/browser/**/*.js'
    ],
    languageOptions: {
        globals: { ...browserGlobals }
    }
};

const nodeConfig = {
    files: ['**/*.js'],
    ignores: [
        'web/reactjs/**/*.js',
        'web/reactjs/**/*.jsx',
        'web/browser/**/*.js'
    ],
    languageOptions: {
        sourceType: 'commonjs',
        globals: { ...nodeGlobals }
    }
};

const testsConfig = {
    files: [ 'tests/**/*.js' ],
    ignores: nodeConfig.ignores,
    languageOptions: {
        sourceType: 'commonjs',
        globals: testGlobals
    }
};

// Filter off buggy jsdoc related rules from default config
const baseConfig = eslintConfig.filter((c) => {
    if (c.rules && Object.keys(c.rules)[0].startsWith('jsdoc')) {
        return false;
    }
    return true;
});

const dlOverrides = {
    rules: {
        'array-bracket-spacing': 'off',
        'arrow-parens': ['error', 'always'],
        'brace-style': 'off',
        'class-methods-use-this': 'off',
        'consistent-return': 'off',
        'default-param-last': 'off',
        'eslint-comments/require-description': 'off',
        'func-style': 'off',
        'function-call-argument-newline': 'off',
        'function-paren-newline': 'off',
        'guard-for-in': 'off',
        'lines-around-comment': 'off',
        'max-statements-per-line': 'off',
        'n/no-extraneous-require': 'off',
        'n/no-missing-import': 'off',
        'no-alert': 'off',
        'no-confusing-arrow': 'off',
        'no-invalid-this': 'off',
        'no-multi-str': 'off',
        'no-param-reassign': 'off',
        'no-undefined': 'off',
        'no-underscore-dangle': 'off',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_' }],
        'no-use-before-define': 'off',
        'object-curly-newline': 'off',
        'object-property-newline': 'off',
        'object-shorthand': 'off',
        'operator-linebreak': ['error', 'after'],
        'padding-line-between-statements': 'off',
        'prefer-arrow-callback': 'off',
        'prefer-const': 'off',
        'prefer-rest-params': 'off',
        'prefer-spread': 'off',
        'require-unicode-regexp': 'off',
        'space-before-function-paren': 'off',
        'unicorn/prefer-array-flat': 'off',
        'unicorn/prefer-includes': 'off',
        'unicorn/prefer-set-has': 'off',
        'wrap-iife': 'off',
        camelcase: 'off',
        quotes: ['error', 'single', { avoidEscape: true }],
        strict: 'off'
    }
};

module.exports = [
    ...baseConfig,
    browserConfig,
    testsConfig,
    nodeConfig,
    reactConfig,
    hooksConfig,
    dlOverrides
];
