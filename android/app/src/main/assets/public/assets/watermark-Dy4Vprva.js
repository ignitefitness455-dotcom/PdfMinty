import{P as H,S as G,d as R,r as O}from"./PDFButton-56eB-KER.js";(function(){const B=document.getElementById("app")||document.querySelector("main")||document.body,g="pdfminty-watermark-styles";if(!document.getElementById(g)){const e=document.createElement("style");e.id=g,e.textContent=`
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
            .text-input, .select-input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text); font-family: inherit; font-size: 1rem; }
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
        `,document.head.appendChild(e)}B.innerHTML=`
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>Watermark PDF</h1>
                <p>Stamp text on your PDF pages</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">💧</div>
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
                    <div class="setting-group full-width">
                        <label class="input-label">Watermark Text</label>
                        <input type="text" id="wm-text" class="text-input" placeholder="e.g., CONFIDENTIAL" value="CONFIDENTIAL">
                    </div>
                    <div class="setting-group">
                        <label class="input-label">Color</label>
                        <div class="color-picker-wrapper">
                            <input type="color" id="wm-color" class="color-input" value="#ff0000">
                            <span id="color-hex" class="color-hex">#FF0000</span>
                        </div>
                    </div>
                    <div class="setting-group">
                        <label class="input-label">Position</label>
                        <select id="wm-position" class="select-input">
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label class="input-label"><span>Font Size</span> <span id="size-val" style="color:var(--accent)">60px</span></label>
                        <input type="range" id="wm-size" class="range-input" min="12" max="150" value="60">
                    </div>
                    <div class="setting-group">
                        <label class="input-label"><span>Opacity</span> <span id="opacity-val" style="color:var(--accent)">30%</span></label>
                        <input type="range" id="wm-opacity" class="range-input" min="5" max="100" value="30">
                    </div>
                    <div class="setting-group full-width">
                        <label class="input-label"><span>Rotation</span> <span id="rotation-val" style="color:var(--accent)">45°</span></label>
                        <input type="range" id="wm-rotation" class="range-input" min="-90" max="90" value="45">
                    </div>
                </div>
                <div class="actions">
                    <button id="btn-apply" class="btn-action">💧 Add Watermark</button>
                </div>
            </div>
        </div>
    `;let r=null,l="";const d=document.getElementById("drop-zone"),c=document.getElementById("file-input"),f=document.getElementById("workspace"),z=document.getElementById("file-name-display"),D=document.getElementById("remove-file-btn"),o=document.getElementById("btn-apply"),C=document.getElementById("wm-text"),b=document.getElementById("wm-color"),A=document.getElementById("color-hex"),M=document.getElementById("wm-position"),y=document.getElementById("wm-size"),j=document.getElementById("size-val"),v=document.getElementById("wm-opacity"),T=document.getElementById("opacity-val"),h=document.getElementById("wm-rotation"),F=document.getElementById("rotation-val");b.addEventListener("input",e=>A.textContent=e.target.value.toUpperCase()),y.addEventListener("input",e=>j.textContent=e.target.value+"px"),v.addEventListener("input",e=>T.textContent=e.target.value+"%"),h.addEventListener("input",e=>F.textContent=e.target.value+"°"),typeof initDropZone=="function"?initDropZone("drop-zone","file-input",w,".pdf"):(d.addEventListener("click",()=>c.click()),c.addEventListener("change",e=>w(e.target.files))),D.addEventListener("click",()=>{r=null,l="",c.value="",f.classList.add("hidden"),d.classList.remove("hidden")});async function w(e){if(!e||e.length===0)return;const t=e[0];if(typeof window.validateFile=="function")for(const n of e){const i=window.validateFile(n);if(!i.valid){typeof window.showError=="function"&&window.showError(i.reason);return}}try{if(typeof showProgress=="function"&&showProgress(50),r=await t.arrayBuffer(),l=t.name.replace(/\.[^/.]+$/,""),z.textContent=t.name,typeof formatBytes=="function"&&typeof fileSizeDisplay<"u"&&fileSizeDisplay&&(fileSizeDisplay.textContent=formatBytes(t.size)),typeof renderPdfThumbnail=="function"){const n=document.getElementById("file-preview-img");n&&renderPdfThumbnail(t,n)}d.classList.add("hidden"),f.classList.remove("hidden"),typeof hideProgress=="function"&&hideProgress()}catch(n){console.error(n),typeof showError=="function"&&showError("Error loading PDF: "+n.message),typeof hideProgress=="function"&&hideProgress()}}function S(e){const t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16)/255,g:parseInt(t[2],16)/255,b:parseInt(t[3],16)/255}:{r:0,g:0,b:0}}o.addEventListener("click",async()=>{o.hasAttribute("data-original-text")||o.setAttribute("data-original-text",o.textContent),o.disabled=!0,o.textContent="Processing...",typeof window.showProgress=="function"&&window.showProgress(10);try{if(!r)return;const e=C.value.trim();if(!e){typeof showError=="function"&&showError("Please enter watermark text.");return}try{const t=await H.load(r.slice(0)),n=t.getPages(),i=await t.embedFont(G.HelveticaBold),p=S(b.value),L=parseInt(v.value)/100,m=parseInt(y.value),x=parseInt(h.value),I=M.value,a=x*(Math.PI/180);n.forEach(E=>{const{width:N,height:k}=E.getSize(),P=i.widthOfTextAtSize(e,m),s=i.heightAtSize(m),W=N/2;let u=k/2;I==="top"?u=k-s*2:I==="bottom"&&(u=s*2),E.drawText(e,{x:W-P/2*Math.cos(a)+s/2*Math.sin(a),y:u-P/2*Math.sin(a)-s/2*Math.cos(a),size:m,font:i,color:O(p.r,p.g,p.b),opacity:L,rotate:R(x)})});const Z=await t.save({useObjectStreams:!0});typeof downloadFile=="function"&&(downloadFile(Z,`${l}_watermarked.pdf`),r=null),typeof showSuccess=="function"&&showSuccess("Watermark added successfully!")}catch(t){console.error("Watermark Error:",t),typeof showError=="function"&&showError(t.message||"Error adding watermark.")}finally{}typeof window.showProgress=="function"&&window.showProgress(100)}catch(e){console.error("PDF Processing Error:",e),typeof window.hideProgress=="function"&&window.hideProgress(),typeof window.showError=="function"?window.showError(e.message||"An error occurred while processing the PDF."):alert("Error: "+(e.message||"An error occurred"))}finally{o.disabled=!1,o.textContent=o.getAttribute("data-original-text")}})})();
