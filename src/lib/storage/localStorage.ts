const NAMESPACE = 'nadebook:v1';

export const storageKey = (key: string) => `${NAMESPACE}:${key}`;

export const load = <T = unknown>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('storage.load failed', e);
    return null;
  }
};

export const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch (e) {
    console.warn('storage.save failed', e);
  }
};

export const remove = (key: string) => {
  try {
    localStorage.removeItem(storageKey(key));
  } catch (e) {
    console.warn('storage.remove failed', e);
  }
};
