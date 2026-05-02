import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                URL: "readonly",
                Blob: "readonly",
                fetch: "readonly",
                alert: "readonly",
                FileReader: "readonly",
                Uint8Array: "readonly",
                PDFLib: "readonly",
                pdfjsLib: "readonly",
                JSZip: "readonly",
                Math: "readonly",
                Promise: "readonly",
                Error: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error"
        }
    }
];
