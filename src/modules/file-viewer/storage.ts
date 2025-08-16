import type { TFileSystemSnapshot, TStoredSnapshot } from './types';

const DB_NAME = 'FSViewerDB';
const DB_VERSION = 1;
const SNAPSHOTS_STORE = 'snapshots';

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
        const store = db.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

export async function saveSnapshot(snapshot: TFileSystemSnapshot): Promise<string> {
  const db = await openDatabase();
  const transaction = db.transaction([SNAPSHOTS_STORE], 'readwrite');
  const store = transaction.objectStore(SNAPSHOTS_STORE);
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const storedSnapshot: TStoredSnapshot = {
    id,
    name: snapshot.meta.projectName,
    snapshot,
    createdAt: now,
    updatedAt: now
  };
  
  return new Promise((resolve, reject) => {
    const request = store.add(storedSnapshot);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function loadSnapshot(id: string): Promise<TStoredSnapshot | null> {
  const db = await openDatabase();
  const transaction = db.transaction([SNAPSHOTS_STORE], 'readonly');
  const store = transaction.objectStore(SNAPSHOTS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function updateSnapshot(id: string, snapshot: TFileSystemSnapshot): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction([SNAPSHOTS_STORE], 'readwrite');
  const store = transaction.objectStore(SNAPSHOTS_STORE);
  
  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const existing = getRequest.result;
      if (existing) {
        existing.snapshot = snapshot;
        existing.updatedAt = new Date().toISOString();
        
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error('Snapshot not found'));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function listSnapshots(): Promise<TStoredSnapshot[]> {
  const db = await openDatabase();
  const transaction = db.transaction([SNAPSHOTS_STORE], 'readonly');
  const store = transaction.objectStore(SNAPSHOTS_STORE);
  const index = store.index('createdAt');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll();
    request.onsuccess = () => resolve(request.result.reverse());
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSnapshot(id: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction([SNAPSHOTS_STORE], 'readwrite');
  const store = transaction.objectStore(SNAPSHOTS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllSnapshots(): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction([SNAPSHOTS_STORE], 'readwrite');
  const store = transaction.objectStore(SNAPSHOTS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
