/**
 * src/core/db.js - IndexedDB with TTL and auto-cleanup
 */
const DB_NAME = 'PDFMintyDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour

let db = null;

function init() {
  return new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => { db = request.result; resolve(db); };
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME);
        store.createIndex('expires', 'expires', { unique: false });
      }
    };
  });
}

export async function saveFile(id, arrayBuffer, ttl = DEFAULT_TTL) {
  const database = await init();
  const expires = Date.now() + ttl;

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put({ data: arrayBuffer, expires }, id);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getFile(id) {
  const database = await init();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => {
      const result = request.result;
      if (!result) { resolve(null); return; }

      // Check TTL
      if (result.expires && Date.now() > result.expires) {
        deleteFile(id);
        resolve(null);
        return;
      }
      resolve(result.data);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFile(id) {
  const database = await init();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAll() {
  const database = await init();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function cleanupExpired() {
  const database = await init();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('expires');
    const now = Date.now();
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// Auto-cleanup on load
window.addEventListener('load', () => cleanupExpired().catch(() => {}));
window.addEventListener('beforeunload', () => clearAll().catch(() => {}));
