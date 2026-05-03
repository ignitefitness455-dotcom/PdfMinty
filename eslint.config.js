import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                window: "readonly",
                document: "readonly",
                localStorage: "readonly",
                console: "readonly",
                URL: "readonly",
                fetch: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                navigator: "readonly",
                requestAnimationFrame: "readonly",
                cancelAnimationFrame: "readonly",
                atob: "readonly",
                Blob: "readonly",
                Uint8Array: "readonly",
                ArrayBuffer: "readonly",
                PDFLib: "readonly",
                confetti: "readonly",
                JSZip: "readonly",
                pdfjsLib: "readonly",
                jspdf: "readonly",
                initDropZone: "readonly",
                handleFiles: "readonly",
                showError: "readonly",
                validateFileSize: "readonly",
                renderFileList: "readonly",
                showProgress: "readonly",
                downloadFile: "readonly",
                showSuccess: "readonly",
                hideProgress: "readonly",
                FileReader: "readonly",
                Image: "readonly",
                Worker: "readonly",
                indexedDB: "readonly",
                location: "readonly",
                process: "readonly",
                module: "readonly",
                exports: "writable"
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error"
        }
    }
];
