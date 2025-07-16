const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const globals = require("globals");

module.exports = tseslint.config(
    // Ignore patterns
    {
        ignores: [
            "**/dist/**",
            "**/node_modules/**",
            "**/*.d.ts",
            "**/*.js.map",
            "**/coverage/**",
            "**/*.config.js"
        ]
    },
    // Base JavaScript configuration
    js.configs.recommended,
    // TypeScript ESLint configurations
    ...tseslint.configs.recommended,
    // Global configuration
    {
        files: ["**/*.ts"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.jest
            },
            parser: tseslint.parser,
            parserOptions: {
                project: true,
                tsconfigRootDir: __dirname
            }
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin
        },
        rules: {
            "brace-style": ["error", "1tbs"],
            "semi": ["error"],
            "quotes": ["error", "double", { "allowTemplateLiterals": false }],
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    "selector": "memberLike",
                    "modifiers": [
                        "private",
                        "protected"
                    ],
                    "format": [
                        "camelCase"
                    ],
                    "leadingUnderscore": "require"
                }
            ],
            "@typescript-eslint/no-unused-vars": ["warn"],
            "@typescript-eslint/no-explicit-any": ["warn"]
        }
    },
    // Override for test files
    {
        files: ["**/test/**/*.ts"],
        rules: {
            "@typescript-eslint/explicit-function-return-type": "off"
        }
    }
);