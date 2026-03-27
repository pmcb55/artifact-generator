import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

const sharedGlobals = {
    ...globals.node,
    ...globals.jest,
};

export default defineConfig([
    // Ignore compiled output and generated files
    {
        ignores: ["dist/", "bin/", "generated/", "test/Generated/"],
    },
    // JS files — CommonJS until converted
    {
        files: ["**/*.js"],
        extends: compat.extends("plugin:prettier/recommended"),
        languageOptions: {
            globals: sharedGlobals,
            ecmaVersion: 2022,
            sourceType: "commonjs",
        },
        rules: {
            "prettier/prettier": "error",
        },
    },
    // TS files — ESM with TypeScript rules
    {
        files: ["**/*.ts"],
        extends: [
            ...tseslint.configs.recommended,
            ...compat.extends("plugin:prettier/recommended"),
        ],
        languageOptions: {
            globals: sharedGlobals,
            ecmaVersion: 2022,
            sourceType: "module",
            parser: tseslint.parser,
        },
        rules: {
            "prettier/prettier": "error",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-require-imports": "off",
        },
    },
]);
