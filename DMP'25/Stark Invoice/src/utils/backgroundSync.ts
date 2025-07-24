interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  timestamp: number;
  data?: any;
}

class BackgroundSyncManager {
  private dbName = 'OfflineRequestsDB';
  private storeName = 'requests';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async queueRequest(url: string, options: RequestInit, data?: any): Promise<string> {
    if (!this.db) await this.init();

    const request: QueuedRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      options: {
        ...options,
        body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
      },
      timestamp: Date.now(),
      data
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const addRequest = store.add(request);

      addRequest.onsuccess = () => resolve(request.id);
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  async getQueuedRequests(): Promise<QueuedRequest[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
  }

  async removeRequest(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  async syncQueuedRequests(): Promise<{ success: number; failed: number }> {
    const requests = await this.getQueuedRequests();
    let success = 0;
    let failed = 0;

    for (const request of requests) {
      try {
        const response = await fetch(request.url, request.options);
        
        if (response.ok) {
          await this.removeRequest(request.id);
          success++;
          this.notifyRequestSync(request, true);
        } else {
          failed++;
          this.notifyRequestSync(request, false, `HTTP ${response.status}`);
        }
      } catch (error) {
        failed++;
        this.notifyRequestSync(request, false, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    return { success, failed };
  }

  private notifyRequestSync(request: QueuedRequest, success: boolean, error?: string) {
    window.dispatchEvent(new CustomEvent('backgroundSyncComplete', {
      detail: { request, success, error }
    }));
  }

  async clearOldRequests(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const requests = await this.getQueuedRequests();
    const cutoffTime = Date.now() - maxAge;

    for (const request of requests) {
      if (request.timestamp < cutoffTime) {
        await this.removeRequest(request.id);
      }
    }
  }
}

export const backgroundSyncManager = new BackgroundSyncManager();

export const useBackgroundSync = () => {
  const queueFormSubmission = async (url: string, formData: any) => {
    if (!navigator.onLine) {
      return await backgroundSyncManager.queueRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }, formData);
    } else {
      return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }
  };

  const syncWhenOnline = () => {
    if (navigator.onLine) {
      backgroundSyncManager.syncQueuedRequests();
    }
  };

  return {
    queueFormSubmission,
    syncWhenOnline,
    syncManager: backgroundSyncManager
  };
};

// Auto-sync when coming back online
window.addEventListener('online', () => {
  backgroundSyncManager.syncQueuedRequests();
});

// Clear old requests periodically
setInterval(() => {
  backgroundSyncManager.clearOldRequests();
}, 24 * 60 * 60 * 1000); // Daily cleanup