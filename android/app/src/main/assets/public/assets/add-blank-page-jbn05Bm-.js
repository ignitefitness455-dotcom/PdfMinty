import{P as h}from"./PDFButton-56eB-KER.js";(function(){const w=document.getElementById("app")||document.querySelector("main")||document.body,b="pdfminty-addblank-styles";if(!document.getElementById(b)){const e=document.createElement("style");e.id=b,e.textContent=`
            .addblank-tool { color: var(--text); max-width: 800px; margin: 0 auto; padding: 1rem; }
            .addblank-header { text-align: center; margin-bottom: 2rem; }
            .addblank-header h1 { margin-bottom: 0.5rem; }
            .addblank-header p { color: var(--muted); }
            .back-link { display: inline-block; margin-bottom: 1rem; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
            .back-link:hover { color: var(--accent); }
            
            .workspace { background: var(--card); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-top: 1.5rem; }
            
            .file-info { display: flex; align-items: center; justify-content: space-between; background: var(--bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
            .file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 1rem; font-weight: 500; }
            .page-count-badge { background: rgba(6, 182, 212, 0.1); color: var(--accent); padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; white-space: nowrap; margin-right: 1rem; }
            .remove-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.25rem; padding: 0 0.5rem; transition: transform 0.2s; }
            .remove-btn:hover { transform: scale(1.2); }
            
            .options-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2rem; }
            @media(min-width: 600px) { .options-grid { grid-template-columns: 1fr 1fr; } }
            
            .option-group { display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
            .option-label { font-weight: 600; font-size: 0.95rem; color: var(--text); margin-bottom: 0.25rem; }
            
            .input-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
            .number-input { width: 70px; padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--card); color: var(--text); font-family: inherit; font-size: 1rem; text-align: center; }
            .number-input:focus { outline: none; border-color: var(--accent); }
            
            .select-input { padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--card); color: var(--text); font-family: inherit; font-size: 1rem; cursor: pointer; }
            .select-input:focus { outline: none; border-color: var(--accent); }
            
            .shortcuts { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
            .btn-shortcut { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.4rem 0.75rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
            .btn-shortcut:hover { background: rgba(255,255,255,0.1); border-color: var(--accent); }
            
            .radio-group { display: flex; flex-direction: column; gap: 0.5rem; }
            .radio-item { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text); font-size: 0.95rem; }
            .radio-item input[type="radio"] { accent-color: var(--primary); width: 1.1rem; height: 1.1rem; cursor: pointer; }
            
            .actions { display: flex; justify-content: center; margin-top: 1rem; }
            .btn-apply { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; width: 100%; max-width: 300px; }
            .btn-apply:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-apply:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            
            .hidden { display: none !important; }
        `,document.head.appendChild(e)}w.innerHTML=`
        <div class="addblank-tool">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            
            <div class="addblank-header">
                <h1>Add Blank Page</h1>
                <p>Insert blank pages anywhere in your PDF</p>
            </div>

            <div id="addblank-drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="addblank-file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop a PDF here, or click to select</p>
            </div>

            <div id="addblank-workspace" class="workspace hidden">
                <div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left;">
                    <img id="file-preview-img" alt="PDF Preview" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
                        <span id="file-name-display" class="file-name" style="font-weight: 700; margin: 0;"></span>
                        <span id="file-size-display" class="file-size-badge" style="width: fit-content;"></span>
                    </div>
                    <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; transition: all 0.2s;">✕</button>
                </div>

                <div class="options-grid">
                    <div class="option-group">
                        <span class="option-label">Insert Position</span>
                        
                        <div class="input-row" style="margin-bottom: 0.75rem;">
                            <span>Insert</span>
                            <input type="number" id="blank-count" class="number-input" value="1" min="1" max="10">
                            <span>blank page(s)</span>
                        </div>
                        
                        <div class="input-row">
                            <select id="pos-type" class="select-input">
                                <option value="after" selected>After</option>
                                <option value="before">Before</option>
                            </select>
                            <span>page</span>
                            <input type="number" id="target-page" class="number-input" value="1" min="1">
                        </div>
                        
                        <div class="shortcuts">
                            <button type="button" id="btn-beginning" class="btn-shortcut">Beginning</button>
                            <button type="button" id="btn-end" class="btn-shortcut">End</button>
                        </div>
                    </div>

                    <div class="option-group">
                        <span class="option-label">Page Size</span>
                        <div class="radio-group">
                            <label class="radio-item">
                                <input type="radio" name="page-size" value="same" checked> Same as document
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="page-size" value="a4"> A4 (210×297mm)
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="page-size" value="letter"> Letter (216×279mm)
                            </label>
                        </div>
                    </div>
                </div>

                <div class="actions">
                    <button id="apply-btn" class="btn-apply">➕ Add Blank Page</button>
                </div>
            </div>
        </div>
    `;let i=null,p="",n=0;const m=document.getElementById("addblank-drop-zone"),g=document.getElementById("addblank-file-input"),y=document.getElementById("addblank-workspace"),x=document.getElementById("file-name-display"),I=document.getElementById("remove-file-btn"),s=document.getElementById("apply-btn"),k=document.getElementById("blank-count"),u=document.getElementById("pos-type"),l=document.getElementById("target-page"),P=document.getElementById("btn-beginning"),E=document.getElementById("btn-end");typeof initDropZone=="function"?initDropZone("addblank-drop-zone","addblank-file-input",v,".pdf"):(m.addEventListener("click",()=>g.click()),g.addEventListener("change",e=>v(e.target.files))),I.addEventListener("click",()=>{i=null,p="",n=0,g.value="",y.classList.add("hidden"),m.classList.remove("hidden")}),P.addEventListener("click",()=>{u.value="before",l.value=1}),E.addEventListener("click",()=>{u.value="after",l.value=n});async function v(e){if(!e||e.length===0)return;const t=e[0];if(typeof window.validateFile=="function")for(const o of e){const r=window.validateFile(o);if(!r.valid){typeof window.showError=="function"&&window.showError(r.reason);return}}try{if(typeof showProgress=="function"&&showProgress(30),i=await t.arrayBuffer(),p=t.name.replace(/\.[^/.]+$/,""),n=(await h.load(i,{ignoreEncryption:!0})).getPageCount(),x.textContent=t.name,typeof formatBytes=="function"&&typeof fileSizeDisplay<"u"&&fileSizeDisplay&&(fileSizeDisplay.textContent=formatBytes(t.size)),typeof renderPdfThumbnail=="function"){const r=document.getElementById("file-preview-img");r&&renderPdfThumbnail(t,r)}m.classList.add("hidden"),y.classList.remove("hidden"),typeof hideProgress=="function"&&hideProgress()}catch(o){console.error(o),typeof showError=="function"&&showError("Error loading PDF: "+o.message),typeof hideProgress=="function"&&hideProgress()}}s.addEventListener("click",async()=>{if(!i)return;const e=parseInt(k.value,10),t=parseInt(l.value,10),o=u.value,r=document.querySelector('input[name="page-size"]:checked').value;if(isNaN(e)||e<1||e>10){typeof showError=="function"&&showError("Please enter a valid number of pages to insert (1-10).");return}if(isNaN(t)||t<1||t>n){typeof showError=="function"&&showError(`Please enter a valid target page (1-${n}).`);return}try{s.disabled=!0,s.textContent="Processing...",typeof showProgress=="function"&&showProgress(20);const a=await h.load(i);typeof showProgress=="function"&&showProgress(40);let f=o==="before"?t-1:t,c=[595.28,841.89];if(r==="same"){const d=Math.min(Math.max(0,f>0?f-1:0),n-1),z=a.getPage(d),{width:D,height:j}=z.getSize();c=[D,j]}else r==="a4"?c=[595.28,841.89]:r==="letter"&&(c=[612,792]);for(let d=0;d<e;d++)a.insertPage(f+d,c);typeof showProgress=="function"&&showProgress(80);const B=await a.save({useObjectStreams:!0});typeof showProgress=="function"&&showProgress(100),typeof downloadFile=="function"&&(downloadFile(B,`${p}-with-blank.pdf`),i=null),typeof showSuccess=="function"&&showSuccess(`Successfully inserted ${e} blank page(s)!`)}catch(a){console.error("Add Blank Page Error:",a),typeof showError=="function"&&showError(a.message||"Error adding blank pages to PDF.")}finally{typeof hideProgress=="function"&&hideProgress(),s.disabled=!1,s.textContent="➕ Add Blank Page",n+=e,pageCountDisplay.textContent=`Total pages: ${n}`,l.max=n}})})();
