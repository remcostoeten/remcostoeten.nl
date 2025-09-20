/**
 * Converts current time to UTC+2 timezone
 */
export const getCurrentTimeUTCPlus2 = (): string => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const utcPlus2 = new Date(utcTime + (2 * 3600000));
  
  return utcPlus2.toTimeString().split(' ')[0];
};

/**
 * Get time components for NumberFlow animation
 */
export const getTimeComponents = () => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const utcPlus2 = new Date(utcTime + (2 * 3600000));
  
  return {
    hours: utcPlus2.getHours(),
    minutes: utcPlus2.getMinutes(),
    seconds: utcPlus2.getSeconds()
  };
};

/**
 * Updates time every second
 */
export const createTimeUpdater = (callback: (time: string) => void) => {
  const updateTime = () => {
    callback(getCurrentTimeUTCPlus2());
  };

  updateTime(); // Initial call
  const interval = setInterval(updateTime, 1000);

  return () => clearInterval(interval);
};