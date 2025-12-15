import React, { useCallback, useRef } from 'react';

/**
 * Hook para cachear datos con TTL (time to live)
 */
export const useCache = (ttl = 5 * 60 * 1000) => {
  const cacheRef = useRef(new Map());
  const timersRef = useRef(new Map());

  const get = useCallback((key) => {
    return cacheRef.current.get(key);
  }, []);

  const set = useCallback((key, value) => {
    // Limpiar timer anterior si existe
    if (timersRef.current.has(key)) {
      clearTimeout(timersRef.current.get(key));
    }

    // Guardar en cache
    cacheRef.current.set(key, value);

    // Configurar expiración
    const timer = setTimeout(() => {
      cacheRef.current.delete(key);
      timersRef.current.delete(key);
    }, ttl);

    timersRef.current.set(key, timer);
  }, [ttl]);

  const clear = useCallback((key) => {
    if (key) {
      cacheRef.current.delete(key);
      if (timersRef.current.has(key)) {
        clearTimeout(timersRef.current.get(key));
        timersRef.current.delete(key);
      }
    } else {
      cacheRef.current.clear();
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    }
  }, []);

  return { get, set, clear };
};

/**
 * Hook para debounce de requests con caching
 */
export const useCachedRequest = (requestFn, options = {}) => {
  const { ttl = 5 * 60 * 1000, debounceDelay = 300 } = options;
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const cache = useCache(ttl);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (...args) => {
    // Generar clave de cache
    const cacheKey = JSON.stringify(args);

    // Verificar cache
    const cached = cache.get(cacheKey);
    if (cached) {
      setData(cached);
      setError(null);
      return cached;
    }

    // Cancelar request anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Debounce
    clearTimeout(debounceTimerRef.current);

    return new Promise((resolve) => {
      debounceTimerRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);

          const result = await requestFn(...args, abortControllerRef.current.signal);

          setData(result);
          cache.set(cacheKey, result);
          resolve(result);
        } catch (err) {
          if (err.name !== 'AbortError') {
            setError(err);
            console.error('Cached request error:', err);
          }
        } finally {
          setLoading(false);
        }
      }, debounceDelay);
    });
  }, [cache, debounceDelay, requestFn]);

  React.useEffect(() => {
    return () => {
      clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, execute, clearCache: () => cache.clear() };
};

/**
 * Hook para sincronización con localStorage
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = React.useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

/**
 * Hook para sesión con expiración
 */
export const useSessionCache = (key, ttl = 30 * 60 * 1000) => {
  const [value, setValue] = React.useState(() => {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      const { data, expires } = JSON.parse(item);
      if (Date.now() > expires) {
        sessionStorage.removeItem(key);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error reading session cache:', error);
      return null;
    }
  });

  const setSessionValue = React.useCallback((newValue) => {
    try {
      const expires = Date.now() + ttl;
      sessionStorage.setItem(key, JSON.stringify({ data: newValue, expires }));
      setValue(newValue);
    } catch (error) {
      console.error('Error setting session cache:', error);
    }
  }, [key, ttl]);

  const clearSessionValue = React.useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setValue(null);
    } catch (error) {
      console.error('Error clearing session cache:', error);
    }
  }, [key]);

  return [value, setSessionValue, clearSessionValue];
};

/**
 * Hook para infinito scroll con lazy loading
 */
export const useInfiniteScroll = (loadMore, options = {}) => {
  const { threshold = 200 } = options;
  const observerTarget = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore?.();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore, threshold]);

  return observerTarget;
};
