import { useState, useEffect } from "react";

type TLoadingState = {
  isLoading: boolean;
  hasMinTimeElapsed: boolean;
};

export function useLoadingState(
  actualLoading: boolean,
  minimumDisplayTime: number = 500
): TLoadingState {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);

  useEffect(() => {
    if (actualLoading && startTime === null) {
      setStartTime(Date.now());
      setHasMinTimeElapsed(false);
    }

    if (!actualLoading && startTime !== null) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minimumDisplayTime - elapsed);

      if (remaining > 0) {
        const timer = setTimeout(() => {
          setHasMinTimeElapsed(true);
          setStartTime(null);
        }, remaining);

        return () => clearTimeout(timer);
      } else {
        setHasMinTimeElapsed(true);
        setStartTime(null);
      }
    }
  }, [actualLoading, startTime, minimumDisplayTime]);

  const isLoading = actualLoading || (startTime !== null && !hasMinTimeElapsed);

  return {
    isLoading,
    hasMinTimeElapsed
  };
}

export function usePreventFlash<T>(
  data: T | undefined | null,
  minimumDisplayTime: number = 300
): T | undefined | null {
  const [displayData, setDisplayData] = useState<T | undefined | null>(data);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  useEffect(() => {
    if (data !== undefined && data !== null) {
      const elapsed = Date.now() - lastUpdateTime;
      const remaining = Math.max(0, minimumDisplayTime - elapsed);

      if (remaining > 0) {
        const timer = setTimeout(() => {
          setDisplayData(data);
          setLastUpdateTime(Date.now());
        }, remaining);

        return () => clearTimeout(timer);
      } else {
        setDisplayData(data);
        setLastUpdateTime(Date.now());
      }
    }
  }, [data, lastUpdateTime, minimumDisplayTime]);

  return displayData;
}
