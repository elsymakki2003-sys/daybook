import { useEffect, useState } from 'react';

// Minimal hash router: #/journal, #/todos. Back/forward buttons work.
export function useHashRoute(validRoutes, fallback) {
  const read = () => {
    const key = window.location.hash.replace(/^#\/?/, '');
    return validRoutes.includes(key) ? key : fallback;
  };

  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (key) => {
    window.location.hash = `/${key}`;
  };

  return [route, navigate];
}
