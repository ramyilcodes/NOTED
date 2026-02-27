const DB_NAME = 'noted-db';
const DB_VERSION = 1;

export const USERS_STORE = 'users';
export const NOTES_STORE = 'notes';

class IndexedDbClient {
  constructor() {
    this.dbPromise = null;
  }

  open() {
    if (this.dbPromise) return this.dbPromise;

    if (!('indexedDB' in window)) {
      this.dbPromise = Promise.reject(
        new Error('IndexedDB is not supported in this browser'),
      );
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(USERS_STORE)) {
          db.createObjectStore(USERS_STORE, { keyPath: 'email' });
        }

        if (!db.objectStoreNames.contains(NOTES_STORE)) {
          const notesStore = db.createObjectStore(NOTES_STORE, {
            keyPath: 'id',
          });
          notesStore.createIndex('type', 'type', { unique: false });
          notesStore.createIndex('authorEmail', 'author.email', {
            unique: false,
          });
        }
      };

      request.onsuccess = () => {
        const db = request.result;

        db.onversionchange = () => {
          db.close();
          console.warn('Database version changed, please reload the page.');
        };

        resolve(db);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };

      request.onblocked = () => {
        console.warn(
          'Opening IndexedDB was blocked. Close other tabs using this site.',
        );
      };
    });

    return this.dbPromise;
  }

  async _withStore(storeName, mode, callback) {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);

      let callbackResult;
      try {
        callbackResult = callback(store, tx);
      } catch (error) {
        reject(error);
        tx.abort();
        return;
      }

      tx.oncomplete = () => resolve(callbackResult);
      tx.onerror = () => reject(tx.error || new Error('Transaction failed'));
      tx.onabort = () =>
        reject(tx.error || new Error('Transaction was aborted'));
    });
  }

  async get(storeName, key) {
    return this._withStore(storeName, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () =>
          reject(request.error || new Error('Failed to get record'));
      });
    });
  }

  async getAll(storeName) {
    return this._withStore(storeName, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () =>
          reject(request.error || new Error('Failed to get all records'));
      });
    });
  }

  async add(storeName, value) {
    return this._withStore(storeName, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.add(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(request.error || new Error('Failed to add record'));
      });
    });
  }

  async put(storeName, value) {
    return this._withStore(storeName, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.put(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(request.error || new Error('Failed to update record'));
      });
    });
  }

  async delete(storeName, key) {
    return this._withStore(storeName, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(request.error || new Error('Failed to delete record'));
      });
    });
  }

  async queryByIndex(storeName, indexName, value) {
    return this._withStore(storeName, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const index = store.index(indexName);
        const request = index.getAll(value);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () =>
          reject(request.error || new Error('Failed to query index'));
      });
    });
  }

  async count(storeName) {
    return this._withStore(storeName, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result || 0);
        request.onerror = () =>
          reject(request.error || new Error('Failed to count records'));
      });
    });
  }

  async seedIfEmpty() {
    try {
      const noteCount = await this.count(NOTES_STORE);

      const fetchJsonArray = async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch seed data from ${url}`);
        }

        const text = await response.text();
        if (!text.trim()) return [];

        let data;
        try {
          data = JSON.parse(text);
        } catch (error) {
          console.error('Failed to parse seed JSON from', url, error);
          return [];
        }

        if (!Array.isArray(data)) return [];
        return data;
      };

      if (noteCount === 0) {
        const notes = await fetchJsonArray('../scripts/notes.json');
        await this._withStore(NOTES_STORE, 'readwrite', (store) => {
          notes.forEach((note) => {
            store.put(note);
          });
        });
      }
    } catch (error) {
      console.error('Failed to seed IndexedDB', error);
    }
  }

  async init() {
    await this.open();
    await this.seedIfEmpty();
  }
}

export const db = new IndexedDbClient();

