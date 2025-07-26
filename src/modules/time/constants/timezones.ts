import { TTimezoneInfo, TTimezoneId } from '../types/timezone';

export const TIMEZONE_DATA: Record<TTimezoneId, TTimezoneInfo> = {
  'UTC': {
    id: 'UTC',
    name: 'Coordinated Universal Time',
    offset: 'UTC+0',
    countries: ['United Kingdom (Greenwich)', 'Iceland', 'Ghana'],
    utcOffset: 0
  },
  'UTC+1': {
    id: 'UTC+1',
    name: 'Central European Time',
    offset: 'UTC+1',
    countries: ['Germany', 'France', 'Spain', 'Italy', 'Netherlands'],
    utcOffset: 1
  },
  'UTC+2': {
    id: 'UTC+2',
    name: 'Eastern European Time',
    offset: 'UTC+2',
    countries: ['Finland', 'Estonia', 'Latvia', 'Lithuania', 'Poland'],
    utcOffset: 2
  },
  'UTC+3': {
    id: 'UTC+3',
    name: 'Moscow Time',
    offset: 'UTC+3',
    countries: ['Russia (Moscow)', 'Belarus', 'Kenya', 'Saudi Arabia'],
    utcOffset: 3
  },
  'UTC+4': {
    id: 'UTC+4',
    name: 'Gulf Standard Time',
    offset: 'UTC+4',
    countries: ['UAE', 'Oman', 'Azerbaijan', 'Georgia'],
    utcOffset: 4
  },
  'UTC+5': {
    id: 'UTC+5',
    name: 'Pakistan Standard Time',
    offset: 'UTC+5',
    countries: ['Pakistan', 'Kazakhstan', 'Uzbekistan'],
    utcOffset: 5
  },
  'UTC+6': {
    id: 'UTC+6',
    name: 'Central Asia Time',
    offset: 'UTC+6',
    countries: ['Kazakhstan', 'Kyrgyzstan', 'Bangladesh'],
    utcOffset: 6
  },
  'UTC+7': {
    id: 'UTC+7',
    name: 'Indochina Time',
    offset: 'UTC+7',
    countries: ['Thailand', 'Vietnam', 'Indonesia'],
    utcOffset: 7
  },
  'UTC+8': {
    id: 'UTC+8',
    name: 'China Standard Time',
    offset: 'UTC+8',
    countries: ['China', 'Singapore', 'Malaysia', 'Philippines'],
    utcOffset: 8
  },
  'UTC+9': {
    id: 'UTC+9',
    name: 'Japan Standard Time',
    offset: 'UTC+9',
    countries: ['Japan', 'South Korea', 'North Korea'],
    utcOffset: 9
  },
  'UTC+10': {
    id: 'UTC+10',
    name: 'Australian Eastern Time',
    offset: 'UTC+10',
    countries: ['Australia (Sydney)', 'Papua New Guinea'],
    utcOffset: 10
  },
  'UTC+11': {
    id: 'UTC+11',
    name: 'Solomon Islands Time',
    offset: 'UTC+11',
    countries: ['Solomon Islands', 'Vanuatu'],
    utcOffset: 11
  },
  'UTC+12': {
    id: 'UTC+12',
    name: 'New Zealand Time',
    offset: 'UTC+12',
    countries: ['New Zealand', 'Fiji'],
    utcOffset: 12
  },
  'UTC-1': {
    id: 'UTC-1',
    name: 'Azores Time',
    offset: 'UTC-1',
    countries: ['Azores', 'Cape Verde'],
    utcOffset: -1
  },
  'UTC-2': {
    id: 'UTC-2',
    name: 'South Georgia Time',
    offset: 'UTC-2',
    countries: ['South Georgia'],
    utcOffset: -2
  },
  'UTC-3': {
    id: 'UTC-3',
    name: 'Argentina Time',
    offset: 'UTC-3',
    countries: ['Argentina', 'Uruguay', 'Brazil (São Paulo)'],
    utcOffset: -3
  },
  'UTC-4': {
    id: 'UTC-4',
    name: 'Atlantic Time',
    offset: 'UTC-4',
    countries: ['Canada (Halifax)', 'Venezuela', 'Bolivia'],
    utcOffset: -4
  },
  'UTC-5': {
    id: 'UTC-5',
    name: 'Eastern Time',
    offset: 'UTC-5',
    countries: ['USA (New York)', 'Canada (Toronto)', 'Colombia'],
    utcOffset: -5
  },
  'UTC-6': {
    id: 'UTC-6',
    name: 'Central Time',
    offset: 'UTC-6',
    countries: ['USA (Chicago)', 'Mexico', 'Guatemala'],
    utcOffset: -6
  },
  'UTC-7': {
    id: 'UTC-7',
    name: 'Mountain Time',
    offset: 'UTC-7',
    countries: ['USA (Denver)', 'Canada (Calgary)'],
    utcOffset: -7
  },
  'UTC-8': {
    id: 'UTC-8',
    name: 'Pacific Time',
    offset: 'UTC-8',
    countries: ['USA (Los Angeles)', 'Canada (Vancouver)'],
    utcOffset: -8
  },
  'UTC-9': {
    id: 'UTC-9',
    name: 'Alaska Time',
    offset: 'UTC-9',
    countries: ['USA (Alaska)'],
    utcOffset: -9
  },
  'UTC-10': {
    id: 'UTC-10',
    name: 'Hawaii Time',
    offset: 'UTC-10',
    countries: ['USA (Hawaii)'],
    utcOffset: -10
  },
  'UTC-11': {
    id: 'UTC-11',
    name: 'Samoa Time',
    offset: 'UTC-11',
    countries: ['American Samoa'],
    utcOffset: -11
  },
  'UTC-12': {
    id: 'UTC-12',
    name: 'Baker Island Time',
    offset: 'UTC-12',
    countries: ['Baker Island'],
    utcOffset: -12
  },
  'America/New_York': {
    id: 'America/New_York',
    name: 'Eastern Time (US & Canada)',
    offset: 'UTC-5/-4',
    countries: ['USA (New York)', 'Canada (Toronto)'],
    utcOffset: -5
  },
  'America/Los_Angeles': {
    id: 'America/Los_Angeles',
    name: 'Pacific Time (US & Canada)',
    offset: 'UTC-8/-7',
    countries: ['USA (Los Angeles)', 'Canada (Vancouver)'],
    utcOffset: -8
  },
  'America/Chicago': {
    id: 'America/Chicago',
    name: 'Central Time (US & Canada)',
    offset: 'UTC-6/-5',
    countries: ['USA (Chicago)', 'Canada (Winnipeg)'],
    utcOffset: -6
  },
  'America/Denver': {
    id: 'America/Denver',
    name: 'Mountain Time (US & Canada)',
    offset: 'UTC-7/-6',
    countries: ['USA (Denver)', 'Canada (Calgary)'],
    utcOffset: -7
  },
  'Europe/London': {
    id: 'Europe/London',
    name: 'Greenwich Mean Time',
    offset: 'UTC+0/+1',
    countries: ['United Kingdom', 'Ireland'],
    utcOffset: 0
  },
  'Europe/Paris': {
    id: 'Europe/Paris',
    name: 'Central European Time',
    offset: 'UTC+1/+2',
    countries: ['France', 'Spain', 'Belgium'],
    utcOffset: 1
  },
  'Europe/Berlin': {
    id: 'Europe/Berlin',
    name: 'Central European Time',
    offset: 'UTC+1/+2',
    countries: ['Germany', 'Austria', 'Switzerland'],
    utcOffset: 1
  },
  'Europe/Rome': {
    id: 'Europe/Rome',
    name: 'Central European Time',
    offset: 'UTC+1/+2',
    countries: ['Italy', 'Vatican City'],
    utcOffset: 1
  },
  'Europe/Amsterdam': {
    id: 'Europe/Amsterdam',
    name: 'Central European Time',
    offset: 'UTC+1/+2',
    countries: ['Netherlands', 'Luxembourg'],
    utcOffset: 1
  },
  'Asia/Tokyo': {
    id: 'Asia/Tokyo',
    name: 'Japan Standard Time',
    offset: 'UTC+9',
    countries: ['Japan'],
    utcOffset: 9
  },
  'Asia/Shanghai': {
    id: 'Asia/Shanghai',
    name: 'China Standard Time',
    offset: 'UTC+8',
    countries: ['China'],
    utcOffset: 8
  },
  'Asia/Kolkata': {
    id: 'Asia/Kolkata',
    name: 'India Standard Time',
    offset: 'UTC+5:30',
    countries: ['India'],
    utcOffset: 5.5
  },
  'Australia/Sydney': {
    id: 'Australia/Sydney',
    name: 'Australian Eastern Time',
    offset: 'UTC+10/+11',
    countries: ['Australia (Sydney)'],
    utcOffset: 10
  },
  'Australia/Melbourne': {
    id: 'Australia/Melbourne',
    name: 'Australian Eastern Time',
    offset: 'UTC+10/+11',
    countries: ['Australia (Melbourne)'],
    utcOffset: 10
  }
};

export const DEFAULT_TIMEZONE_CONFIG = {
  defaultTimezone: 'UTC+1' as TTimezoneId,
  allowedTimezones: Object.keys(TIMEZONE_DATA) as TTimezoneId[]
};

export const DEFAULT_TIME_FORMAT = {
  format: '24h' as const,
  showSeconds: true,
  showDate: false,
  dateFormat: 'medium' as const
};
