import { TTimezoneId, TTimeFormat } from '../types/timezone';
import { TIMEZONE_DATA } from '../constants/timezones';

export function getTimezoneInfo(timezoneId: TTimezoneId) {
  return TIMEZONE_DATA[timezoneId];
}

function createDateObject(timestamp?: number) {
  return timestamp ? new Date(timestamp) : new Date();
}

export function getCurrentTimeInTimezone(
  timezoneId: TTimezoneId,
  format: TTimeFormat = { format: '24h', showSeconds: true }
): string {
  const now = createDateObject();
  const timezoneInfo = getTimezoneInfo(timezoneId);
  
  if (timezoneId.startsWith('UTC')) {
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = createDateObject(utcTime + (timezoneInfo.utcOffset * 3600000));
    return formatTime(targetTime, format);
  }
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
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
    
    return formatter.format(now);
  } catch (error) {
    console.warn(`Failed to format time for timezone ${timezoneId}:`, error);
    return formatTime(now, format);
  }
}

function formatTime(date: Date, format: TTimeFormat): string {
  const options: Intl.DateTimeFormatOptions = {
    hour12: format.format === '12h',
    hour: '2-digit',
    minute: '2-digit',
    second: format.showSeconds ? '2-digit' : undefined,
    ...(format.showDate && {
      year: 'numeric',
      month: format.dateFormat === 'short' ? '2-digit' : 'long',
      day: '2-digit'
    })
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
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
  sourceTime: Date,
  targetTimezoneId: TTimezoneId
): Date {
  const timezoneInfo = getTimezoneInfo(targetTimezoneId);
  
  if (targetTimezoneId.startsWith('UTC')) {
    const utcTime = sourceTime.getTime() + (sourceTime.getTimezoneOffset() * 60000);
    return createDateObject(utcTime + (timezoneInfo.utcOffset * 3600000));
  }
  
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: targetTimezoneId,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(sourceTime);
    const dateString = parts.reduce(function reduceParts(acc, part) {
      if (part.type === 'year') acc.year = part.value;
      if (part.type === 'month') acc.month = part.value;
      if (part.type === 'day') acc.day = part.value;
      if (part.type === 'hour') acc.hour = part.value;
      if (part.type === 'minute') acc.minute = part.value;
      if (part.type === 'second') acc.second = part.value;
      return acc;
    }, {} as Record<string, string>);
    
    return createDateObject(Date.parse(`${dateString.year}-${dateString.month}-${dateString.day}T${dateString.hour}:${dateString.minute}:${dateString.second}`));
  } catch (error) {
    console.warn(`Failed to convert time to timezone ${targetTimezoneId}:`, error);
    return sourceTime;
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
