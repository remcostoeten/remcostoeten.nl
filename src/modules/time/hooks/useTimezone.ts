import { useState, useEffect } from 'react';
import { TTimezoneId, TTimeFormat } from '../types/timezone';
import { createTimezoneTimeUpdater, getTimezoneInfo } from '../utils/timezone';
import { DEFAULT_TIME_FORMAT } from '../constants/timezones';

type TProps = {
  timezoneId: TTimezoneId;
  format?: TTimeFormat;
};

export function useTimezone({ timezoneId, format = DEFAULT_TIME_FORMAT }: TProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timezoneInfo] = useState(function getInfo() {
    return getTimezoneInfo(timezoneId);
  });

  useEffect(() => {
    const cleanup = createTimezoneTimeUpdater(timezoneId, setCurrentTime, format);
    return cleanup;
  }, [timezoneId, format]);

  return {
    currentTime,
    timezoneInfo
  };
}
