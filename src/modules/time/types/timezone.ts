export type TTimezoneId = 
  | 'UTC'
  | 'UTC+1'
  | 'UTC+2'
  | 'UTC+3'
  | 'UTC+4'
  | 'UTC+5'
  | 'UTC+6'
  | 'UTC+7'
  | 'UTC+8'
  | 'UTC+9'
  | 'UTC+10'
  | 'UTC+11'
  | 'UTC+12'
  | 'UTC-1'
  | 'UTC-2'
  | 'UTC-3'
  | 'UTC-4'
  | 'UTC-5'
  | 'UTC-6'
  | 'UTC-7'
  | 'UTC-8'
  | 'UTC-9'
  | 'UTC-10'
  | 'UTC-11'
  | 'UTC-12'
  | 'America/New_York'
  | 'America/Los_Angeles'
  | 'America/Chicago'
  | 'America/Denver'
  | 'Europe/London'
  | 'Europe/Paris'
  | 'Europe/Berlin'
  | 'Europe/Rome'
  | 'Europe/Amsterdam'
  | 'Asia/Tokyo'
  | 'Asia/Shanghai'
  | 'Asia/Kolkata'
  | 'Australia/Sydney'
  | 'Australia/Melbourne';

export type TTimezoneInfo = {
  id: TTimezoneId;
  name: string;
  offset: string;
  countries: string[];
  utcOffset: number;
};

export type TTimezoneConfig = {
  defaultTimezone: TTimezoneId;
  allowedTimezones?: TTimezoneId[];
};

export type TTimeFormat = {
  format: '12h' | '24h';
  showSeconds?: boolean;
  showDate?: boolean;
  dateFormat?: 'short' | 'medium' | 'long' | 'full';
};
