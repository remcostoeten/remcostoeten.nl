/**
 * Converts current time to UTC+1 timezone
 */
export const getCurrentTimeUTCPlus1 = (): string => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const utcPlus1 = new Date(utcTime + (1 * 3600000));
  
  return utcPlus1.toTimeString().split(' ')[0];
};

/**
 * Updates time every second
 */
export const createTimeUpdater = (callback: (time: string) => void) => {
  const updateTime = () => {
    callback(getCurrentTimeUTCPlus1());
  };

  updateTime(); // Initial call
  const interval = setInterval(updateTime, 1000);

  return () => clearInterval(interval);
};