// Mini-Router über den URL-Hash (#/puzzles, #/analysis/abc123 …)
import { useEffect, useState } from 'react';

function parse(): [string, string | undefined] {
  const [route, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  return [route || 'coach', rest.length ? decodeURIComponent(rest.join('/')) : undefined];
}

export function navigate(route: string) {
  location.hash = `/${route}`;
}

export function useRoute() {
  const [r, setR] = useState(parse);
  useEffect(() => {
    const on = () => {
      setR(parse());
      document.querySelector('main')?.scrollTo(0, 0);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}
