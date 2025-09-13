import type { StorageAdapter, StorageType } from './types';
import { createMemoryStorage } from './memoryStorage';
// Temporarily commenting out SQLite until better-sqlite3 is installed
// import { createSqliteStorage } from './sqliteStorage';

export const createStorage = (type: StorageType = 'memory', dbPath?: string): StorageAdapter => {
  switch (type) {
    case 'sqlite':
      console.warn('SQLite storage not available, falling back to memory storage');
      return createMemoryStorage();
      // return createSqliteStorage(dbPath);
    case 'memory':
    default:
      return createMemoryStorage();
  }
};

export { StorageAdapter, StorageType } from './types';
export { createMemoryStorage } from './memoryStorage';
// export { createSqliteStorage } from './sqliteStorage';
