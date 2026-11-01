import { useCallback, useEffect, useState } from 'react';

export const ADMIN_PATH = '/admin';
export const STORE_PATH = '/';

export function useRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((nextPath) => {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return { view: path.startsWith(ADMIN_PATH) ? 'admin' : 'store', navigate };
}
