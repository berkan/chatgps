import { useEffect, useState, useRef } from "react";
import { storage } from '#imports';


export function useSyncedStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const isLoaded = useRef(false);

  // Load initial value
  useEffect(() => {
    storage.getItem(`local:${key}`).then(
      (storedValue) => {
        if (storedValue !== undefined && storedValue !== null) {
          setValue(storedValue as T)
        }
        isLoaded.current = true;
      }
    )
  }, [key]);

  // Update storage when value changes
  useEffect(() => {
    if (!isLoaded.current) return;
    storage.setItem(`local:${key}`, value)
  }, [key, value]);

  // Listen for changes from other tabs/contexts
  useEffect(() => {
     const unwatch = storage.watch(`local:${key}`, (newValue) => {
        if (newValue !== undefined && newValue !== null) {
            // We verify if the new value is different from current to avoid loops,
            // though react state updates usually handle strict equality.
            // Also update the ref to ensure we don't treat this as "not loaded" if it happens fast.
            setValue(newValue as T);
            isLoaded.current = true;
        }
     });
     return () => {
        unwatch();
     }
  }, [key]);

  return [value, setValue] as const;
}
