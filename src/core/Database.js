export const db = {
  dbName: 'PDFMintyDB',
  storeName: 'files',
  dbVersion: 1,
  memoryFallback: new Map(),
  useMemory: false,
  dbInstance: null,

  init() {
    if (this.useMemory) return Promise.resolve(null);
    if (this.dbInstance) return Promise.resolve(this.dbInstance);
    if (!window.indexedDB) {
      this.useMemory = true;
      return Promise.resolve(null);
    }
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        request.onerror = (event) => {
          console.warn('IndexedDB error/denied. Falling back to memory.', event.target.error);
          this.useMemory = true;
          resolve(null);
        };
        request.onsuccess = (event) => {
          this.dbInstance = event.target.result;
          resolve(this.dbInstance);
        };
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
      } catch (e) {
        console.warn('IndexedDB not available. Falling back to memory.', e);
        this.useMemory = true;
        resolve(null);
      }
    });
  },

  async saveFile(id, arrayBuffer) {
    const database = await this.init();
    if (this.useMemory) {
      this.memoryFallback.set(id, arrayBuffer);
      return id;
    }
    return new Promise((resolve, reject) => {
      const tx = database.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put(arrayBuffer, id);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  },

  async getFile(id) {
    const database = await this.init();
    if (this.useMemory) {
      return this.memoryFallback.get(id);
    }
    return new Promise((resolve, reject) => {
      const tx = database.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteFile(id) {
    const database = await this.init();
    if (this.useMemory) {
      this.memoryFallback.delete(id);
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = database.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async clearAll() {
    const database = await this.init();
    if (this.useMemory) {
      this.memoryFallback.clear();
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = database.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
};
