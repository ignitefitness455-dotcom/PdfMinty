// error-handler.ts — simplified, no DOM manipulation
window.addEventListener('error', (event) => {
  console.error('Init error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Init rejection:', event.reason);
});
