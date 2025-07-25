import { useState, useEffect } from "react";
import { createTimeUpdater } from "../utils/time";

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const cleanup = createTimeUpdater(setCurrentTime);
    return cleanup;
  }, []);

  return currentTime;
}
