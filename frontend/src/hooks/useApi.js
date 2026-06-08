import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Generic data-fetching hook that uses authenticated fetch.
 * @param {string} path  - API path e.g. '/dashboard'
 * @param {any}    deps  - Extra dependency array items that re-trigger fetch
 */
export function useApi(path, deps = []) {
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch(path);
      if (!res.success) throw new Error(res.message);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, ...deps]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
