import { getCurrentTimeInTimezone, createTimezoneTimeUpdater } from './timezone';

export function getCurrentTimeUTCPlus1(): string {
  return getCurrentTimeInTimezone('UTC+1');
}

export function createTimeUpdater(callback: (time: string) => void) {
  return createTimezoneTimeUpdater('UTC+1', callback);
}


