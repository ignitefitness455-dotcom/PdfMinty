import{P as g}from"./PDFButton-56eB-KER.js";(function(){const h=document.getElementById("app")||document.querySelector("main")||document.body,u="pdfminty-reorder-styles";if(!document.getElementById(u)){const e=document.createElement("style");e.id=u,e.textContent=`
            .tool-container { color: var(--text); max-width: 800px; margin: 0 auto; padding: 1rem; }
            .tool-header { text-align: center; margin-bottom: 2rem; }
            .tool-header h1 { margin-bottom: 0.5rem; }
            .tool-header p { color: var(--muted); }
            .back-link { display: inline-block; margin-bottom: 1rem; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
            .back-link:hover { color: var(--accent); }
            .workspace { background: var(--card); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-top: 1.5rem; }
            .file-info { display: flex; align-items: center; justify-content: space-between; background: var(--bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
            .file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 1rem; font-weight: 500; }
            .page-count-badge { background: rgba(6, 182, 212, 0.1); color: var(--accent); padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; white-space: nowrap; margin-right: 1rem; }
            .remove-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.25rem; padding: 0 0.5rem; transition: transform 0.2s; }
            .remove-btn:hover { transform: scale(1.2); }
            .input-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
            .input-label { font-weight: 500; font-size: 0.95rem; color: var(--text); }
            .text-input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text); font-family: inherit; font-size: 1rem; }
            .text-input:focus { outline: none; border-color: var(--accent); }
            .help-text { font-size: 0.85rem; color: var(--muted); }
            .actions { display: flex; justify-content: center; margin-top: 2rem; }
            .btn-action { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; width: 100%; max-width: 300px; }
            .btn-action:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .hidden { display: none !important; }
        `,document.head.appendChild(e)}h.innerHTML=`
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>Reorder PDF</h1>
                <p>Change the order of pages in your PDF</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔄</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop a PDF here, or click to select</p>
            </div>
            <p style="text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 1rem;">🔒 No upload. No servers. 100% private.</p>
            <div id="workspace" class="workspace hidden">
                <div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left;">
                    <img id="file-preview-img" alt="PDF Preview" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
                        <span id="file-name-display" class="file-name" style="font-weight: 700; margin: 0;"></span>
                        <span id="file-size-display" class="file-size-badge" style="width: fit-content;"></span>
                    </div>
                    <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; transition: all 0.2s;">✕</button>
                </div>
                <div class="input-group">
                    <label class="input-label">New Page Order</label>
                    <input type="text" id="reorder-input" class="text-input" placeholder="e.g., 3, 1, 2, 4-5">
                    <p class="help-text">Enter the new order of pages separated by commas. You must include all pages you want to keep.</p>
                </div>
                <div class="actions">
                    <button id="btn-apply" class="btn-action">🔄 Reorder PDF</button>
                </div>
            </div>
        </div>
    `;let l=null,c="",p=0;const f=document.getElementById("drop-zone"),m=document.getElementById("file-input"),y=document.getElementById("workspace"),b=document.getElementById("file-name-display"),v=document.getElementById("remove-file-btn"),s=document.getElementById("btn-apply"),x=document.getElementById("reorder-input");typeof initDropZone=="function"?initDropZone("drop-zone","file-input",w,".pdf"):(f.addEventListener("click",()=>m.click()),m.addEventListener("change",e=>w(e.target.files))),v.addEventListener("click",()=>{l=null,c="",p=0,m.value="",y.classList.add("hidden"),f.classList.remove("hidden")});async function w(e){if(!e||e.length===0)return;const i=e[0];if(typeof window.validateFile=="function")for(const t of e){const n=window.validateFile(t);if(!n.valid){typeof window.showError=="function"&&window.showError(n.reason);return}}try{if(typeof showProgress=="function"&&showProgress(30),l=await i.arrayBuffer(),c=i.name.replace(/\.[^/.]+$/,""),p=(await g.load(l,{ignoreEncryption:!0})).getPageCount(),b.textContent=i.name,typeof formatBytes=="function"&&typeof fileSizeDisplay<"u"&&fileSizeDisplay&&(fileSizeDisplay.textContent=formatBytes(i.size)),typeof renderPdfThumbnail=="function"){const n=document.getElementById("file-preview-img");n&&renderPdfThumbnail(i,n)}f.classList.add("hidden"),y.classList.remove("hidden"),typeof hideProgress=="function"&&hideProgress()}catch(t){console.error(t),typeof showError=="function"&&showError("Error loading PDF: "+t.message),typeof hideProgress=="function"&&hideProgress()}}function I(e,i){const t=[],n=e.split(",");for(let a of n)if(a=a.trim(),!!a)if(a.includes("-")){const[o,d]=a.split("-").map(r=>parseInt(r.trim(),10));if(isNaN(o)||isNaN(d)||o<1||d>i)throw new Error(`Invalid range: ${a}`);if(o<=d)for(let r=o;r<=d;r++)t.push(r);else for(let r=o;r>=d;r--)t.push(r)}else{const o=parseInt(a,10);if(isNaN(o)||o<1||o>i)throw new Error(`Invalid page number: ${a}`);t.push(o)}return t}s.addEventListener("click",async()=>{s.hasAttribute("data-original-text")||s.setAttribute("data-original-text",s.textContent),s.disabled=!0,s.textContent="Processing...",typeof window.showProgress=="function"&&window.showProgress(10);try{if(!l)return;const e=x.value.trim();if(!e){typeof showError=="function"&&showError("Please enter the new page order.");return}let i;try{if(i=I(e,p),i.length===0)throw new Error("No valid pages specified.")}catch(t){typeof showError=="function"&&showError(t.message);return}try{const t=await g.load(l),n=await g.create(),a=i.map(r=>r-1),o=await n.copyPages(t,a);for(let r=0;r<o.length;r++)n.addPage(o[r]),r%50===0&&await new Promise(P=>setTimeout(P,0));const d=await n.save({useObjectStreams:!0});typeof downloadFile=="function"&&(downloadFile(d,`${c}_reordered.pdf`),l=null),typeof showSuccess=="function"&&showSuccess("PDF reordered successfully!")}catch(t){console.error("Reorder Error:",t),typeof showError=="function"&&showError(t.message||"Error reordering PDF.")}finally{}typeof window.showProgress=="function"&&window.showProgress(100)}catch(e){console.error("PDF Processing Error:",e),typeof window.hideProgress=="function"&&window.hideProgress(),typeof window.showError=="function"?window.showError(e.message||"An error occurred while processing the PDF."):alert("Error: "+(e.message||"An error occurred"))}finally{s.disabled=!1,s.textContent=s.getAttribute("data-original-text")}})})();
