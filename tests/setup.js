// Optional setup for jsdom environment if needed
globalThis.window = globalThis.window || {};
globalThis.window.showError = (msg) => { console.error(msg) };
globalThis.window.showSuccess = (msg) => { console.log(msg) };
