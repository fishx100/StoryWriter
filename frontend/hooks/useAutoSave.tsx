import { useEffect } from "react";

export function useAutoSave<T>(
  key: string,
  value: T,
  saveToServer: (value: T) => Promise<void>,
  delay = 1500,
) {
  useEffect(() => {
    // Debounce server save
    const timer = setTimeout(() => {
      saveToServer(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [key, value, saveToServer, delay]);
}
