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
  const tempTimestamp = Date.now();
  const tempDate = Date(tempTimestamp);
  const offsetMatch = tempDate.match(/GMT([+-]\d{4})/);
  if (offsetMatch) {
    const offsetStr = offsetMatch[1];
    const hours = parseInt(offsetStr.slice(1, 3));
    const minutes = parseInt(offsetStr.slice(3, 5));
    const multiplier = offsetStr[0] === '+' ? -1 : 1;
    return multiplier * (hours * 60 + minutes) * 60000;
  }
  return 0;
}

export function getCurrentTimeInTimezone(
  timezoneId: TTimezoneId,
  format: TTimeFormat = { format: '24h', showSeconds: true }
): string {
  const now = createTimestamp();
  const timezoneInfo = getTimezoneInfo(timezoneId);
  
  if (timezoneId.startsWith('UTC')) {
    const timezoneOffsetMs = getCurrentTimezoneOffset();
    const utcTime = now + timezoneOffsetMs;
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

export function convertTimeToTimezone(
  sourceTimestamp: number,
  targetTimezoneId: TTimezoneId
): number {
  const timezoneInfo = getTimezoneInfo(targetTimezoneId);
  
  if (targetTimezoneId.startsWith('UTC')) {
    const timezoneOffsetMs = getCurrentTimezoneOffset();
    const utcTime = sourceTimestamp + timezoneOffsetMs;
    return utcTime + (timezoneInfo.utcOffset * 3600000);
  }
  
  try {
    const parts = Intl.DateTimeFormat('en-CA', {
      timeZone: targetTimezoneId,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(sourceTimestamp);
    
    const dateString = parts.reduce(function reduceParts(acc, part) {
      if (part.type === 'year') acc.year = part.value;
      if (part.type === 'month') acc.month = part.value;
      if (part.type === 'day') acc.day = part.value;
      if (part.type === 'hour') acc.hour = part.value;
      if (part.type === 'minute') acc.minute = part.value;
      if (part.type === 'second') acc.second = part.value;
      return acc;
    }, {} as Record<string, string>);
    
    return Date.parse(`${dateString.year}-${dateString.month}-${dateString.day}T${dateString.hour}:${dateString.minute}:${dateString.second}`);
  } catch (error) {
    console.warn(`Failed to convert time to timezone ${targetTimezoneId}:`, error);
    return sourceTimestamp;
  }
}

export function getAvailableTimezones(): TTimezoneId[] {
  return Object.keys(TIMEZONE_DATA) as TTimezoneId[];
}

export function searchTimezones(query: string): TTimezoneId[] {
  const lowerQuery = query.toLowerCase();
  return getAvailableTimezones().filter(function filterTimezones(timezoneId) {
    const info = getTimezoneInfo(timezoneId);
    return (
      timezoneId.toLowerCase().includes(lowerQuery) ||
      info.name.toLowerCase().includes(lowerQuery) ||
      info.countries.some(function checkCountry(country) {
        return country.toLowerCase().includes(lowerQuery);
      })
    );
  });
}
