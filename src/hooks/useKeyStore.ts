import { useState, useEffect } from 'react';

export interface KeyData {
  key: string;
  expiry: string;
  expired: string;
  user: string;
}

const STORAGE_KEY = 'nmhtools_activated_key';

export function useKeyStore() {
  const [activatedKey, setActivatedKey] = useState<KeyData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: KeyData = JSON.parse(stored);
        setActivatedKey(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveKey = (data: KeyData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setActivatedKey(data);
  };

  const clearKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActivatedKey(null);
  };

  return { activatedKey, saveKey, clearKey };
}
