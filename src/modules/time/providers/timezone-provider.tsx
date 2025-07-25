import { createContext, useContext, useState, ReactNode } from 'react';
import { TTimezoneId, TTimezoneConfig, TTimeFormat } from '../types/timezone';
import { DEFAULT_TIMEZONE_CONFIG, DEFAULT_TIME_FORMAT } from '../constants/timezones';

type TTimezoneContext = {
  currentTimezone: TTimezoneId;
  timeFormat: TTimeFormat;
  config: TTimezoneConfig;
  setTimezone: (timezone: TTimezoneId) => void;
  setTimeFormat: (format: TTimeFormat) => void;
};

const TimezoneContext = createContext<TTimezoneContext | null>(null);

type TProps = {
  children: ReactNode;
  initialConfig?: Partial<TTimezoneConfig>;
  initialTimeFormat?: Partial<TTimeFormat>;
};

export function TimezoneProvider({ 
  children, 
  initialConfig = {}, 
  initialTimeFormat = {} 
}: TProps) {
  const [config] = useState<TTimezoneConfig>({
    ...DEFAULT_TIMEZONE_CONFIG,
    ...initialConfig
  });
  
  const [currentTimezone, setCurrentTimezone] = useState<TTimezoneId>(
    config.defaultTimezone
  );
  
  const [timeFormat, setTimeFormatState] = useState<TTimeFormat>({
    ...DEFAULT_TIME_FORMAT,
    ...initialTimeFormat
  });

  function setTimezone(timezone: TTimezoneId) {
    if (!config.allowedTimezones?.includes(timezone)) {
      console.warn(`Timezone ${timezone} is not in allowed timezones list`);
      return;
    }
    setCurrentTimezone(timezone);
  }

  function setTimeFormat(format: TTimeFormat) {
    setTimeFormatState(format);
  }

  const value: TTimezoneContext = {
    currentTimezone,
    timeFormat,
    config,
    setTimezone,
    setTimeFormat
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezoneContext() {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezoneContext must be used within a TimezoneProvider');
  }
  return context;
}
