import{P as H,S as W,r as _}from"./PDFButton-56eB-KER.js";(function(){const z=document.getElementById("app")||document.querySelector("main")||document.body,y="pdfminty-pagenumbers-styles";if(!document.getElementById(y)){const e=document.createElement("style");e.id=y,e.textContent=`
            .tool-container { color: var(--text); max-width: 800px; margin: 0 auto; padding: 1rem; }
            .tool-header { text-align: center; margin-bottom: 2rem; }
            .tool-header h1 { margin-bottom: 0.5rem; }
            .tool-header p { color: var(--muted); }
            .back-link { display: inline-block; margin-bottom: 1rem; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
            .back-link:hover { color: var(--accent); }
            .workspace { background: var(--card); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-top: 1.5rem; }
            .file-info { display: flex; align-items: center; justify-content: space-between; background: var(--bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
            .file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 1rem; font-weight: 500; }
            .remove-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.25rem; padding: 0 0.5rem; transition: transform 0.2s; }
            .remove-btn:hover { transform: scale(1.2); }
            .settings-panel { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
            @media (max-width: 600px) { .settings-panel { grid-template-columns: 1fr; } }
            .setting-group { display: flex; flex-direction: column; gap: 0.5rem; }
            .setting-group.full-width { grid-column: 1 / -1; }
            .input-label { font-weight: 500; font-size: 0.95rem; color: var(--text); display: flex; justify-content: space-between; }
            .text-input, .select-input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text); font-family: inherit; font-size: 1rem; cursor: pointer; }
            .text-input:focus, .select-input:focus { outline: none; border-color: var(--accent); }
            .range-input { width: 100%; cursor: pointer; accent-color: var(--accent); height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; outline: none; -webkit-appearance: none; margin-top: 0.5rem; }
            .range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: var(--accent); border-radius: 50%; cursor: pointer; }
            .color-picker-wrapper { display: flex; align-items: center; gap: 1rem; background: var(--bg); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
            .color-input { width: 35px; height: 35px; padding: 0; border: none; border-radius: 4px; cursor: pointer; background: transparent; }
            .color-hex { font-family: monospace; font-size: 1rem; color: var(--muted); }
            .actions { display: flex; justify-content: center; margin-top: 2rem; }
            .btn-action { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; width: 100%; max-width: 300px; }
            .btn-action:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .hidden { display: none !important; }
        `,document.head.appendChild(e)}z.innerHTML=`
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>Add Page Numbers</h1>
                <p>Insert page numbers into your PDF document</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔢</div>
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
                <div class="settings-panel">
                    <div class="setting-group">
                        <label class="input-label">Format</label>
                        <select id="format-select" class="select-input">
                            <option value="1">1, 2, 3...</option>
                            <option value="page_1">Page 1, Page 2...</option>
                            <option value="1_of_n">1 of N, 2 of N...</option>
                            <option value="page_1_of_n">Page 1 of N...</option>
                            <option value="-1-">- 1 -, - 2 -...</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label class="input-label">Position</label>
                        <select id="position-select" class="select-input">
                            <option value="bottom-center">Bottom Center</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                            <option value="top-center">Top Center</option>
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label class="input-label"><span>Font Size</span> <span id="size-val" style="color:var(--accent)">12px</span></label>
                        <input type="range" id="size-input" class="range-input" min="8" max="48" value="12">
                    </div>
                    <div class="setting-group">
                        <label class="input-label"><span>Margin</span> <span id="margin-val" style="color:var(--accent)">30px</span></label>
                        <input type="range" id="margin-input" class="range-input" min="10" max="100" value="30">
                    </div>
                    <div class="setting-group full-width">
                        <label class="input-label">Color</label>
                        <div class="color-picker-wrapper">
                            <input type="color" id="color-input" class="color-input" value="#000000">
                            <span id="color-hex" class="color-hex">#000000</span>
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <button id="btn-apply" class="btn-action">🔢 Add Page Numbers</button>
                </div>
            </div>
        </div>
    `;let r=null,p="";const g=document.getElementById("drop-zone"),u=document.getElementById("file-input"),h=document.getElementById("workspace"),C=document.getElementById("file-name-display"),D=document.getElementById("remove-file-btn"),n=document.getElementById("btn-apply"),j=document.getElementById("position-select"),A=document.getElementById("format-select"),w=document.getElementById("size-input"),T=document.getElementById("size-val"),x=document.getElementById("margin-input"),M=document.getElementById("margin-val"),I=document.getElementById("color-input"),S=document.getElementById("color-hex");w.addEventListener("input",e=>T.textContent=e.target.value+"px"),x.addEventListener("input",e=>M.textContent=e.target.value+"px"),I.addEventListener("input",e=>S.textContent=e.target.value.toUpperCase());function N(e){const t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16)/255,g:parseInt(t[2],16)/255,b:parseInt(t[3],16)/255}:{r:0,g:0,b:0}}typeof initDropZone=="function"?initDropZone("drop-zone","file-input",P,".pdf"):(g.addEventListener("click",()=>u.click()),u.addEventListener("change",e=>P(e.target.files))),D.addEventListener("click",()=>{r=null,p="",u.value="",h.classList.add("hidden"),g.classList.remove("hidden")});async function P(e){if(!e||e.length===0)return;const t=e[0];if(typeof window.validateFile=="function")for(const o of e){const a=window.validateFile(o);if(!a.valid){typeof window.showError=="function"&&window.showError(a.reason);return}}try{if(typeof showProgress=="function"&&showProgress(50),r=await t.arrayBuffer(),p=t.name.replace(/\.[^/.]+$/,""),C.textContent=t.name,typeof formatBytes=="function"&&typeof fileSizeDisplay<"u"&&fileSizeDisplay&&(fileSizeDisplay.textContent=formatBytes(t.size)),typeof renderPdfThumbnail=="function"){const o=document.getElementById("file-preview-img");o&&renderPdfThumbnail(t,o)}g.classList.add("hidden"),h.classList.remove("hidden"),typeof hideProgress=="function"&&hideProgress()}catch(o){console.error(o),typeof showError=="function"&&showError("Error loading PDF: "+o.message),typeof hideProgress=="function"&&hideProgress()}}n.addEventListener("click",async()=>{n.hasAttribute("data-original-text")||n.setAttribute("data-original-text",n.textContent),n.disabled=!0,n.textContent="Processing...",typeof window.showProgress=="function"&&window.showProgress(10);try{if(!r)return;try{const e=await H.load(r.slice(0)),t=e.getPages(),o=t.length,a=await e.embedFont(W.Helvetica),m=j.value,l=A.value,f=parseInt(w.value),d=parseInt(x.value),b=N(I.value);t.forEach((E,L)=>{const{width:k,height:Z}=E.getSize(),s=L+1;let i=String(s);l==="page_1"?i=`Page ${s}`:l==="1_of_n"?i=`${s} of ${o}`:l==="page_1_of_n"?i=`Page ${s} of ${o}`:l==="-1-"&&(i=`- ${s} -`);const B=a.widthOfTextAtSize(i,f);let c,v;m.includes("left")?c=d:m.includes("right")?c=k-d-B:c=k/2-B/2,m.includes("top")?v=Z-d-f:v=d,E.drawText(i,{x:c,y:v,size:f,font:a,color:_(b.r,b.g,b.b)})});const F=await e.save({useObjectStreams:!0});typeof downloadFile=="function"&&(downloadFile(F,`${p}_numbered.pdf`),r=null),typeof showSuccess=="function"&&showSuccess("Page numbers added successfully!")}catch(e){console.error("Page Numbers Error:",e),typeof showError=="function"&&showError(e.message||"Error adding page numbers.")}finally{}typeof window.showProgress=="function"&&window.showProgress(100)}catch(e){console.error("PDF Processing Error:",e),typeof window.hideProgress=="function"&&window.hideProgress(),typeof window.showError=="function"?window.showError(e.message||"An error occurred while processing the PDF."):alert("Error: "+(e.message||"An error occurred"))}finally{n.disabled=!1,n.textContent=n.getAttribute("data-original-text")}})})();
