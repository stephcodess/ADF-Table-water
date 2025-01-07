const DB_NAME = 'ADFWATER';
const DB_VERSION = 1;
const STORE_NAME = 'responses';

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error('Error opening database:', request.error);
      reject(request.error);
    };
  });
};

/**
 * Checks if the cache is expired based on the timestamp and TTL.
 * @param timestamp - The timestamp of the cached data.
 * @param ttlInHours - Time-to-live for cache validity in hours.
 * @returns True if the cache is expired, false otherwise.
 */
export const isCacheExpired = (timestamp: number, ttlInHours = 1): boolean => {
  const now = new Date().getTime();
  return now - timestamp > ttlInHours * 60 * 60 * 1000; // TTL in milliseconds
};

export const saveResponseToCache = async (id: string, data: any): Promise<void> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put({ id, data });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        console.error('Error saving data to cache:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error in saveResponseToCache:', error);
    throw error;
  }
};

export const getResponseFromCache = async (id: string): Promise<any> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBRequest).result?.data ?? null);
      };

      request.onerror = () => {
        console.error('Error retrieving data from cache:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in getResponseFromCache:', error);
    throw error;
  }
};

export const deleteResponseFromCache = async (id: string): Promise<void> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        console.error('Error deleting data from cache:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error in deleteResponseFromCache:', error);
    throw error;
  }
};
