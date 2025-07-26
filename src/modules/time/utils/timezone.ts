import { TTimezoneId, TTimeFormat } from '../types/timezone';
import { TIMEZONE_DATA } from '../constants/timezones';

export function getTimezoneInfo(timezoneId: TTimezoneId) {
  return TIMEZONE_DATA[timezoneId];
}

function createTimestamp(timestamp?: number): number {
  return timestamp ?? Date.now();
}

function formatTimestamp(timestamp: number, options: Intl.DateTimeFormatOptions): string {
  return Intl.DateTimeFormat('en-US', options).format(timestamp);
}

function getCurrentTimezoneOffset(): number {
  const now = new Date();
  return -now.getTimezoneOffset() * 60000;
}

export function getCurrentTimeInTimezone(
  timezoneId: TTimezoneId,
  format: TTimeFormat = { format: '24h', showSeconds: true }
): string {
  const now = createTimestamp();
  const timezoneInfo = getTimezoneInfo(timezoneId);
  
  if (timezoneId.startsWith('UTC')) {
    const timezoneOffsetMs = getCurrentTimezoneOffset();
    const utcTime = now - timezoneOffsetMs;
    const targetTime = utcTime + (timezoneInfo.utcOffset * 3600000);
    return formatTimestamp(targetTime, {
      hour12: format.format === '12h',
      hour: '2-digit',
      minute: '2-digit',
      second: format.showSeconds ? '2-digit' : undefined,
      ...(format.showDate && {
        year: 'numeric',
        month: format.dateFormat === 'short' ? '2-digit' : 'long',
        day: '2-digit'
      })
    });
  }
  
  try {
    return formatTimestamp(now, {
      timeZone: timezoneId,
      hour12: format.format === '12h',
      hour: '2-digit',
      minute: '2-digit',
      second: format.showSeconds ? '2-digit' : undefined,
      ...(format.showDate && {
        year: 'numeric',
        month: format.dateFormat === 'short' ? '2-digit' : 'long',
        day: '2-digit'
      })
    });
  } catch (error) {
    console.warn(`Failed to format time for timezone ${timezoneId}:`, error);
    return formatTimestamp(now, {
      hour12: format.format === '12h',
      hour: '2-digit',
      minute: '2-digit',
      second: format.showSeconds ? '2-digit' : undefined,
      ...(format.showDate && {
        year: 'numeric',
        month: format.dateFormat === 'short' ? '2-digit' : 'long',
        day: '2-digit'
      })
    });
  }
}

export function createTimezoneTimeUpdater(
  timezoneId: TTimezoneId,
  callback: (time: string) => void,
  format?: TTimeFormat
) {
  function updateTime() {
    callback(getCurrentTimeInTimezone(timezoneId, format));
  }

  updateTime();
  const interval = setInterval(updateTime, 1000);

  return function cleanup() {
    clearInterval(interval);
  };
}
