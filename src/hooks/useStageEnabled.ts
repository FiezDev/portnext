import { useEffect, useState } from 'react';

const DESKTOP = '(min-width: 768px)';
const REDUCED = '(prefers-reduced-motion: reduce)';

export function useStageEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const desktopMql = window.matchMedia(DESKTOP);
    const reducedMql = window.matchMedia(REDUCED);

    const compute = () => setEnabled(desktopMql.matches && !reducedMql.matches);
    compute();

    desktopMql.addEventListener('change', compute);
    reducedMql.addEventListener('change', compute);
    return () => {
      desktopMql.removeEventListener('change', compute);
      reducedMql.removeEventListener('change', compute);
    };
  }, []);

  return enabled;
}
