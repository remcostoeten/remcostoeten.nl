import { createSignal, onCleanup } from "solid-js";
import { createTimeUpdater } from "../utils/time";

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = createSignal<string>("");

  const cleanup = createTimeUpdater(setCurrentTime);
  onCleanup(cleanup);

  return currentTime;
}
