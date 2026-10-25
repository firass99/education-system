import { useCallback, useEffect, useState } from 'react';

/** Run an async loader on mount (and whenever `deps` change); exposes data/loading/error/reload. */
export default function useFetch(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  const load = useCallback(() => {
    setLoading(true);
    return run()
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [run]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load, setData };
}
