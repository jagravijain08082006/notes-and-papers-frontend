"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a fast-changing value (e.g. search input or filter text)
 * by delaying updates until a specified idle duration has passed.
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
