const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf-8');

const idbCode = `
    // ==========================================
    // 7. INDEXEDDB FILE STORAGE (Memory Optimization)
    // ==========================================
    window.pdfDB = {
        dbName: 'PDFMintyDB',
        storeName: 'files',
        dbVersion: 1,
        
        init() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);
                request.onerror = event => reject('IndexedDB error: ' + event.target.error);
                request.onsuccess = event => resolve(event.target.result);
                request.onupgradeneeded = event => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName);
                    }
                };
            });
        },
        
        async saveFile(id, arrayBuffer) {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const request = store.put(arrayBuffer, id);
                request.onsuccess = () => resolve(id);
                request.onerror = () => reject(request.error);
            });
        },
        
        async getFile(id) {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readonly');
                const store = tx.objectStore(this.storeName);
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        
        async deleteFile(id) {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        },
        
        async clearAll() {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    };
    
    // Clear leftover files on load/refresh
    window.addEventListener('load', () => {
        if (window.pdfDB) {
            window.pdfDB.clearAll().catch(e => console.log('IDB clear on load failed', e));
        }
    });
    window.addEventListener('beforeunload', () => {
        if (window.pdfDB) {
            window.pdfDB.clearAll().catch(e => console.log('IDB clear on unload failed', e));
        }
    });
`;

if (!appJs.includes('INDEXEDDB FILE STORAGE')) {
    appJs = appJs + '\n' + idbCode;
    fs.writeFileSync('app.js', appJs, 'utf-8');
    console.log('app.js updated with IndexedDB');
} else {
    console.log('Already updated');
}
