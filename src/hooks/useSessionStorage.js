import { useUser } from '../context/UserContext';
import { examStorageKey } from '../utils/examStorage';
import { useState, useEffect } from 'react';

export function useSessionStorage(key, initialValue) {
  const { user } = useUser();
  const storageKey = examStorageKey(user?.id || user?._id, key);

  const getFallback = () => {
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  };

  const [value, setValue] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const item = window.sessionStorage.getItem(storageKey);
        return item ? JSON.parse(item) : getFallback();
      }
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${storageKey}":`, error);
    }
    return getFallback();
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(storageKey, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${storageKey}":`, error);
    }
  }, [storageKey, value]);

  return [value, setValue];
}
