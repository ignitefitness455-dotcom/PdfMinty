import { useState, useEffect, useRef } from "react";

/**
 * A highly portable, custom React hook designed to debounce rapid state variations
 * (e.g. search keyboard strokes) client-side.
 * It exposes the debounced value and a reactive boolean state representing whether
 * a debounce timer is currently active (ideal for displaying live spinner indicators).
 */
export function useDebounce<T>(value: T, delay = 300): { debouncedValue: T; isDebouncing: boolean } {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If the immediate user query changes, mark as debouncing
    if (value !== debouncedValue) {
      setIsDebouncing(true);
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay, debouncedValue]);

  // Handle instant sync for when the input is reset to original state
  useEffect(() => {
    if (value === debouncedValue) {
      setIsDebouncing(false);
    }
  }, [value, debouncedValue]);

  return { debouncedValue, isDebouncing };
}
