import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Showroom {
  id: string;
  name: string;
  address: string;
  map_link: string;
  phone?: string;
  order_index: number;
}

const TopHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);
  const [panelRect, setPanelRect] = useState<{ left: number; top: number; width: number } | null>(null);

  // Fetch showrooms from database
  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        const { data, error } = await supabase
          .from('showrooms')
          .select('id, name, address, map_link, phone, order_index')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;
        setShowrooms(data || []);
      } catch (error) {
        console.error('Error fetching showrooms:', error);
        // Fallback to default showroom if fetch fails
        setShowrooms([{
          id: 'default',
          name: 'Душанбе, Пулоди 4',
          address: 'Душанбе, Пулоди 4',
          map_link: 'https://maps.app.goo.gl/5exgpkraKy9foeD27',
          order_index: 0
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchShowrooms();
  }, []);

  // measure where to place the fixed dropdown
  const measure = () => {
    const el = rowRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPanelRect({
      left: Math.round(r.left),
      top: Math.round(r.bottom),
      width: Math.round(r.width),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    const onScroll = () => measure();
    const onResize = () => measure();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  // close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const panel = document.getElementById('showrooms-panel');
      if (panel && panel.contains(e.target as Node)) return;
      if (rowRef.current && rowRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const Panel = open && panelRect && !loading
    ? createPortal(
        <div
          id="showrooms-panel"
          style={{
            position: 'fixed',
            left: panelRect.left,
            top: panelRect.top + 8,
            zIndex: 1000,
          }}
        >
          <div className="rounded-xl bg-white shadow-xl border border-gray-100">
            <div className="p-5">
              {showrooms.length === 0 ? (
                <div className="text-sm text-gray-500">Шоурумы не найдены</div>
              ) : (
                <div className="space-y-3">
                  {showrooms.map((showroom) => (
                    <a
                      key={showroom.id}
                      href={showroom.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-left text-gray-700 hover:text-teal-600 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <MapPin size={18} className="mt-0.5 shrink-0 text-teal-600" />
                      <div className="flex-1">
                        <div className="font-medium">{showroom.name}</div>
                        {showroom.address !== showroom.name && (
                          <div className="text-sm text-gray-500">{showroom.address}</div>
                        )}
                        {showroom.phone && (
                          <div className="text-sm text-gray-500 mt-1">{showroom.phone}</div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="hidden md:block bg-gray-100 py-2 px-4 text-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left row (used for measuring width/left) */}
        <div ref={rowRef} className="flex items-center space-x-4 relative">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="flex items-center hover:text-teal-600"
          >
            Шоурумы
            <ChevronDown
              size={16}
              className={`ml-1 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
          <a href="/services" className="hover:text-teal-600">Услуги</a>
        </div>

        <div className="flex items-center space-x-6">
          <a href="/delivery-payment" className="flex items-center hover:text-teal-600">
            Доставка и оплата
          </a>
          <a href="tel:+992905339595" className="font-medium hover:text-teal-600">
            +992 90 533 9595
          </a>
        </div>
      </div>

      {Panel}
    </div>
  );
};

export default TopHeader;
