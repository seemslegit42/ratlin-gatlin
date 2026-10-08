
/**
 * @file hooks/useDebounce.ts
 * @description A custom React hook that debounces a value. Debouncing is a technique to limit the rate
 * at which a function gets called. This hook delays updating a value until a specified amount of time has
 * passed without any new updates to the original value. It's highly useful for performance optimization
 * in scenarios like handling user input in a search field or responding to window resize events.
 */

import { useEffect, useState } from 'react';

/**
 * A custom React hook that debounces a value.
 * The `debouncedValue` will only reflect the latest `value` after `delay` milliseconds
 * have passed without `value` changing.
 * 
 * @template T The type of the value to be debounced.
 * @param {T} value - The value to debounce. This could be a string, number, object, etc.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {T} The debounced value, which updates only after the specified delay has passed.
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * // This effect will only run 500ms after the user stops typing.
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     fetchApi(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  /**
   * @state {T} debouncedValue - The state that holds the debounced value.
   */
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer that will update the debounced value after the specified delay.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // The cleanup function is crucial. It clears the timeout if the `value` or `delay`
    // changes before the timeout has completed. This is what "resets" the debounce timer.
    return () => {
      clearTimeout(handler);
    };
  }, 
  // The effect re-runs only if the `value` or `delay` changes.
  [value, delay]);

  return debouncedValue;
}