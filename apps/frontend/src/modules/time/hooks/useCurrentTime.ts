'use client';

import { useState, useEffect } from "react";
import { createTimeUpdater, getTimeComponents } from "../utils/time";

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const cleanup = createTimeUpdater(setCurrentTime);
    return cleanup;
  }, []);

  return currentTime;
};

export function useTimeComponents() {
  const [timeComponents, setTimeComponents] = useState(getTimeComponents);

  useEffect(() => {
    const updateComponents = () => {
      setTimeComponents(getTimeComponents());
    };

    updateComponents(); // Initial call
    const interval = setInterval(updateComponents, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeComponents;
};