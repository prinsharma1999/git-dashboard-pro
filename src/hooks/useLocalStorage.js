import { useState, useEffect } from 'react';

/**
 * Custom hook for managing state in local storage
 * @param {string} key - The key to store the value under in localStorage
 * @param {any} initialValue - The default value if no value exists in localStorage
 * @returns {Array} - [storedValue, setValue] state tuple
 */
const useLocalStorage = (key, initialValue) => {
  // Create state to store the value
  // Pass a function to useState so the localStorage lookup
  // only happens once during initialization
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage
      const item = window.localStorage.getItem(key);
      // Parse stored JSON if it exists, otherwise return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If there's an error (e.g., JSON parse error), return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when the state changes
  useEffect(() => {
    try {
      // Store state in localStorage
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      // Handle potential errors (e.g., quota exceeded, private browsing mode)
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Return the state and a wrapped setter that also updates localStorage
  return [storedValue, setStoredValue];
};

export default useLocalStorage; 