import{P as w}from"./PDFButton-56eB-KER.js";(function(){const b=document.getElementById("app")||document.querySelector("main")||document.body,f="pdfminty-merge-styles";if(!document.getElementById(f)){const e=document.createElement("style");e.id=f,e.textContent=`
            .tool-container { color: var(--text); max-width: 800px; margin: 0 auto; padding: 1rem; }
            .tool-header { text-align: center; margin-bottom: 2rem; }
            .tool-header h1 { margin-bottom: 0.5rem; }
            .tool-header p { color: var(--muted); }
            .back-link { display: inline-block; margin-bottom: 1rem; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
            .back-link:hover { color: var(--accent); }
            .workspace { background: var(--card); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-top: 1.5rem; }
            .file-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
            .file-item { position: relative; background: var(--bg); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; }
            .file-item img { max-width: 100%; max-height: 100%; object-fit: contain; }
            .file-name-badge { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; font-size: 0.75rem; text-align: center; padding: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); border: none; color: white; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: background 0.2s; z-index: 10; }
            .remove-btn:hover { background: var(--danger); }
            .actions { display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; }
            .btn-action { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; }
            .btn-action:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .btn-secondary { background: var(--bg); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .btn-secondary:hover { border-color: var(--accent); }
            .hidden { display: none !important; }
        `,document.head.appendChild(e)}b.innerHTML=`
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>Merge PDF</h1>
                <p>Combine multiple PDFs into a single document</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" multiple style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔗</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop PDFs here, or click to select</p>
            </div>
            <p style="text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 1rem;">🔒 No upload. No servers. 100% private.</p>
            <div id="workspace" class="workspace hidden">
                <p style="margin-bottom: 1rem; color: var(--muted); font-size: 0.9rem;">Files will be merged in the order shown below.</p>
                <div id="file-list" class="file-list grid"></div>
                <div class="actions">
                    <button id="btn-add-more" class="btn-secondary">➕ Add More</button>
                    <button id="btn-apply" class="btn-action">🔗 Merge PDFs</button>
                </div>
            </div>
        </div>
    `;let o=[];const c=document.getElementById("drop-zone"),m=document.getElementById("file-input"),p=document.getElementById("workspace"),g=document.getElementById("file-list"),h=document.getElementById("btn-add-more"),a=document.getElementById("btn-apply");typeof initDropZone=="function"?initDropZone("drop-zone","file-input",u,".pdf"):(c.addEventListener("click",()=>m.click()),m.addEventListener("change",e=>u(e.target.files))),h.addEventListener("click",()=>m.click());function u(e){if(!e||e.length===0)return;const i=Array.from(e);if(typeof window.validateFile=="function")for(const t of e){const r=window.validateFile(t);if(!r.valid){typeof window.showError=="function"&&window.showError(r.reason);return}}window.pdfDB?Promise.all(i.map(async t=>{const r="merge_"+Date.now()+"_"+Math.random().toString(36).substr(2,9),n=await t.arrayBuffer();return await window.pdfDB.saveFile(r,n),{name:t.name,id:r,fileObj:t}})).then(t=>{o=o.concat(t),l()}):(o=o.concat(i.map(t=>({name:t.name,fileObj:t}))),l()),l(),c.classList.add("hidden"),p.classList.remove("hidden")}function l(){g.innerHTML="",o.forEach((e,i)=>{const t=document.createElement("div");t.className="file-item";const r=document.createElement("img");typeof renderPdfThumbnail=="function"&&renderPdfThumbnail(e.fileObj,r);const n=document.createElement("button");n.className="remove-btn",n.innerHTML="✕",n.dataset.index=i;const d=document.createElement("div");d.className="file-name-badge",d.textContent=e.name,t.appendChild(r),t.appendChild(d),t.appendChild(n),g.appendChild(t)}),document.querySelectorAll(".remove-btn").forEach(e=>{e.addEventListener("click",i=>{const t=parseInt(i.target.dataset.index),r=o.splice(t,1)[0];window.pdfDB&&r.id&&window.pdfDB.deleteFile(r.id),l(),o.length===0&&(p.classList.add("hidden"),c.classList.remove("hidden"))})})}a.addEventListener("click",async()=>{a.hasAttribute("data-original-text")||a.setAttribute("data-original-text",a.textContent),a.disabled=!0,a.textContent="Processing...",typeof window.showProgress=="function"&&window.showProgress(10);try{if(o.length<2){typeof showError=="function"&&showError("Please add at least 2 PDFs to merge.");return}try{let e;if(typeof window.runPdfWorkerTask=="function"){const i={files:[]};for(let r=0;r<o.length;r++){let n;if(o[r].id&&window.pdfDB)try{n=await window.pdfDB.getFile(o[r].id)}catch(d){console.error(d)}n||(n=await o[r].fileObj.arrayBuffer()),i.files.push(new Uint8Array(n))}const t=i.files.map(r=>r.buffer);e=await window.runPdfWorkerTask("merge",i,t,r=>{})}else{const i=await w.create();for(let t=0;t<o.length;t++){let r;if(o[t].id&&window.pdfDB)try{r=await window.pdfDB.getFile(o[t].id)}catch(s){console.error(s)}r||(r=await o[t].fileObj.arrayBuffer());let n=await w.load(r,{ignoreEncryption:!0});const d=await i.copyPages(n,n.getPageIndices());for(let s=0;s<d.length;s++)i.addPage(d[s]),s%50===0&&await new Promise(y=>setTimeout(y,0));r=null,n=null}e=await i.save({useObjectStreams:!0})}typeof downloadFile=="function"&&downloadFile(e,"merged-document.pdf"),typeof showSuccess=="function"&&showSuccess("PDFs merged successfully!")}catch(e){console.error(e),typeof showError=="function"&&showError("Error merging PDFs: "+e.message)}finally{}typeof window.showProgress=="function"&&window.showProgress(100)}catch(e){console.error("PDF Processing Error:",e),typeof window.hideProgress=="function"&&window.hideProgress(),typeof window.showError=="function"?window.showError(e.message||"An error occurred while processing the PDF."):alert("Error: "+(e.message||"An error occurred"))}finally{a.disabled=!1,a.textContent=a.getAttribute("data-original-text")}})})();
