import { fileURLToPath } from 'url';
// Optional setup for jsdom environment if needed
global.window.showError = (msg) => { console.error(msg) };
global.window.showSuccess = (msg) => { console.log(msg) };
