import type { StorageAdapter, StorageType } from './types';
import { createMemoryStorage } from './memoryStorage';
import { createSqliteStorage } from './sqliteStorage';

export const createStorage = (type: StorageType = 'memory', dbPath?: string): StorageAdapter => {
  switch (type) {
    case 'sqlite':
      return createSqliteStorage(dbPath);
    case 'memory':
    default:
      return createMemoryStorage();
  }
};

export { StorageAdapter, StorageType } from './types';
export { createMemoryStorage } from './memoryStorage';
export { createSqliteStorage } from './sqliteStorage';
