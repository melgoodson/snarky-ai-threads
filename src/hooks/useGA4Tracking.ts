import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA4, trackPageView } from '@/utils/ga4';

export function useGA4Tracking() {
  const location = useLocation();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      initGA4();
      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    // Record distinct page_view event on every route transition
    const currentPath = location.pathname + location.search;
    trackPageView(currentPath);
  }, [location.pathname, location.search]);
}
