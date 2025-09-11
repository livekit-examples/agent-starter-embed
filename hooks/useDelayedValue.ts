import { useEffect, useState } from 'react';

export function useDelayedValue<T>(value: T, delay: number) {
  const [delayedValue, setDelayedValue] = useState(value);

  useEffect(() => {
    if (value === delayedValue) {
      return;
    }

    const timeout = setTimeout(() => setDelayedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay, delayedValue]);

  return delayedValue;
}
