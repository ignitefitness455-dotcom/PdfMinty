function showInitError(type: string, msg: string) {
  if (!msg || typeof msg !== 'string') return;
  
  // Filter out benign or non-critical errors that are already handled locally or in specific tools
  const lowerMsg = msg.toLowerCase();
  if (
    lowerMsg.includes('failed to connect to websocket') ||
    lowerMsg.includes('resizeobserver') ||
    lowerMsg.includes('no pdf header found') ||
    lowerMsg.includes('failed to parse pdf document') ||
    lowerMsg.includes('invalidpdfexception') ||
    lowerMsg.includes('formaterror') ||
    lowerMsg.includes('pdfdocument')
  ) {
    return;
  }
  
  const div = document.createElement('div');
  div.className = "fixed top-5 right-5 left-5 bg-rose-50 border border-rose-200 rounded-lg p-4 z-[999999] shadow-lg font-sans";
  
  const header = document.createElement('div');
  header.className = "flex justify-between items-center mb-2";
  
  const h3 = document.createElement('h3');
  h3.className = "m-0 text-rose-700 text-base font-bold";
  h3.textContent = type;
  
  const btn = document.createElement('button');
  btn.className = "bg-white border border-slate-300 rounded cursor-pointer px-2 py-1 text-xs";
  btn.textContent = "Dismiss";
  btn.setAttribute("aria-label", "Dismiss error");
  btn.addEventListener('click', () => div.remove());
  
  header.appendChild(h3);
  header.appendChild(btn);
  
  const pre = document.createElement('pre');
  pre.className = "m-0 text-xs text-rose-900 whitespace-pre-wrap break-all";
  pre.textContent = msg;
  
  div.appendChild(header);
  div.appendChild(pre);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(div));
  } else {
    document.body.appendChild(div);
  }
}

window.addEventListener('error', function(event) {
  showInitError('Initialization Error', event.message || (event.error && event.error.toString()) || 'Unknown error');
});

window.addEventListener('unhandledrejection', function(event) {
  const msg = event.reason ? (event.reason.stack || event.reason.message || String(event.reason)) : 'Unknown Promise Rejection';
  showInitError('Promise Rejection', msg);
});
