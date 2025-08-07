interface StoredData {
  id: string;
  data: any;
  timestamp: number;
  type: string;
  synced: boolean;
}

class OfflineStorageManager {
  private dbName = 'PWAOfflineStorage';
  private version = 1;
  private db: IDBDatabase | null = null;

  private stores = {
    invoices: 'invoices',
    customers: 'customers',
    products: 'products',
    drafts: 'drafts',
    settings: 'settings'
  };

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        Object.values(this.stores).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('synced', 'synced', { unique: false });
            store.createIndex('type', 'type', { unique: false });
          }
        });
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  async save(storeName: keyof typeof this.stores, id: string, data: any, type?: string): Promise<void> {
    const db = await this.ensureDB();
    
    const storedData: StoredData = {
      id,
      data,
      timestamp: Date.now(),
      type: type || 'default',
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.stores[storeName]], 'readwrite');
      const store = transaction.objectStore(this.stores[storeName]);
      const request = store.put(storedData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName: keyof typeof this.stores, id: string): Promise<any | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.stores[storeName]], 'readonly');
      const store = transaction.objectStore(this.stores[storeName]);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName: keyof typeof this.stores, type?: string): Promise<any[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.stores[storeName]], 'readonly');
      const store = transaction.objectStore(this.stores[storeName]);
      
      let request: IDBRequest;
      if (type) {
        const typeIndex = store.index('type');
        request = typeIndex.getAll(type);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const results = request.result.map((item: StoredData) => ({
          id: item.id,
          ...item.data,
          _timestamp: item.timestamp,
          _synced: item.synced
        }));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: keyof typeof this.stores, id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.stores[storeName]], 'readwrite');
      const store = transaction.objectStore(this.stores[storeName]);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(storeName: keyof typeof this.stores, id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.stores[storeName]], 'readwrite');
      const store = transaction.objectStore(this.stores[storeName]);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getUnsyncedItems(storeName: keyof typeof this.stores): Promise<StoredData[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.stores[storeName]], 'readonly');
      const store = transaction.objectStore(this.stores[storeName]);
      const syncedIndex = store.index('synced');
      const request = syncedIndex.getAll(IDBKeyRange.only(false));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearStore(storeName: keyof typeof this.stores): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.stores[storeName]], 'readwrite');
      const store = transaction.objectStore(this.stores[storeName]);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    const db = await this.ensureDB();
    const cutoffTime = Date.now() - maxAge;

    const promises = Object.values(this.stores).map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const timestampIndex = store.index('timestamp');
        const range = IDBKeyRange.upperBound(cutoffTime);
        const request = timestampIndex.openCursor(range);

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const data = cursor.value as StoredData;
            if (data.synced) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
  }
}

export const offlineStorage = new OfflineStorageManager();

export const useOfflineStorage = () => {
  const saveInvoice = (id: string, invoice: any) => 
    offlineStorage.save('invoices', id, invoice, 'invoice');
  
  const getInvoice = (id: string) => 
    offlineStorage.get('invoices', id);
  
  const getAllInvoices = () => 
    offlineStorage.getAll('invoices');
  
  const saveCustomer = (id: string, customer: any) => 
    offlineStorage.save('customers', id, customer, 'customer');
  
  const getCustomer = (id: string) => 
    offlineStorage.get('customers', id);
  
  const getAllCustomers = () => 
    offlineStorage.getAll('customers');
  
  const saveDraft = (id: string, draft: any) => 
    offlineStorage.save('drafts', id, draft, 'draft');
  
  const getDraft = (id: string) => 
    offlineStorage.get('drafts', id);
  
  const getAllDrafts = () => 
    offlineStorage.getAll('drafts');
  
  const saveSettings = (id: string, settings: any) => 
    offlineStorage.save('settings', id, settings, 'settings');
  
  const getSettings = (id: string) => 
    offlineStorage.get('settings', id);

  return {
    saveInvoice,
    getInvoice,
    getAllInvoices,
    saveCustomer,
    getCustomer,
    getAllCustomers,
    saveDraft,
    getDraft,
    getAllDrafts,
    saveSettings,
    getSettings,
    storage: offlineStorage
  };
};

// Auto cleanup old data
setInterval(() => {
  offlineStorage.clearOldData();
}, 24 * 60 * 60 * 1000); // Daily cleanup