module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
    },
    extends: 'airbnb-base',
    overrides: [
        {
            env: {
                node: true,
            },
            files: [
                '.eslintrc.{js,cjs}',
            ],
            parserOptions: {
                sourceType: 'script',
            },
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        indent: [ 'error', 4 ],
        'array-bracket-spacing': 'off',
        'class-methods-use-this': 'off',
        'comma-dangle': 'off',
        'function-paren-newline': 'off',
        'guard-for-in': 'off',
        'newline-per-chained-call': 'off',
        'no-await-in-loop': 'off',
        'no-multiple-empty-lines': 'off',
        'no-restricted-syntax': 'off',
        'no-underscore-dangle': 'off',
        'object-curly-newline': 'off',
        'object-property-newline': 'off',
        'operator-linebreak': 'off',
        'prefer-arrow-callback': 'off'
    },
};
