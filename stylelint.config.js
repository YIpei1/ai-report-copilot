export default {
    extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue/scss'],

    ignoreFiles: ['dist/**', 'node_modules/**', 'coverage/**'],

    rules: {
        'selector-class-pattern': [
            '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$',
            {
                resolveNestedSelectors: true,
                message: '类名必须使用 kebab-case 或 BEM 命名',
            },
        ],
    },
}
