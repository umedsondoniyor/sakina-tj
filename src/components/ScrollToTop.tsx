import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type Props = {
  /** 'smooth' for animated scroll, 'auto' for instant */
  behavior?: ScrollBehavior;
  /** Also scroll to top when only the query (?x=1) changes */
  watchSearch?: boolean;
};

export default function ScrollToTop({ behavior = 'smooth', watchSearch = false }: Props) {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If you're navigating to an in-page anchor (#section), don't jump to top.
    if (hash) return;

    // Scroll the window to top-left
    window.scrollTo({ top: 0, left: 0, behavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, watchSearch ? search : null]); // re-run when path (and optionally search) changes

  return null;
}
