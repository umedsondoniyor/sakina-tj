const DEFAULT_CURRENCY = 'TJS';
const GA4_DEBUG = import.meta.env.VITE_GA4_DEBUG === 'true';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
    __ga4Initialized?: boolean;
  }
}

export interface Ga4Item {
  item_id: string;
  item_name: string;
  price: number;
  currency: string;
  quantity?: number;
}

const isBrowser = typeof window !== 'undefined';

function debugLog(message: string, payload?: unknown) {
  if (!GA4_DEBUG || !isBrowser) {
    return;
  }
  if (payload !== undefined) {
    console.log(`[GA4 DEBUG] ${message}`, payload);
    return;
  }
  console.log(`[GA4 DEBUG] ${message}`);
}

function sendEvent(eventName: string, params: Record<string, unknown>) {
  if (!isBrowser || typeof window.gtag !== 'function') {
    debugLog(`Skipped event "${eventName}" (gtag unavailable)`, params);
    return;
  }
  debugLog(`Event "${eventName}"`, params);
  window.gtag('event', eventName, params);
}

export function initGA4(measurementId?: string) {
  if (!isBrowser) {
    return;
  }

  if (!measurementId || window.__ga4Initialized) {
    debugLog('GA4 init skipped', { hasMeasurementId: Boolean(measurementId), initialized: window.__ga4Initialized });
    return;
  }

  const scriptId = 'ga4-gtag-script';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtagShim(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
  });
  debugLog('GA4 initialized', { measurementId });

  window.__ga4Initialized = true;
}

export function toGa4Item(item: {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  currency?: string;
}): Ga4Item {
  return {
    item_id: item.item_id,
    item_name: item.item_name,
    price: Number(item.price) || 0,
    quantity: item.quantity ?? 1,
    currency: item.currency || DEFAULT_CURRENCY,
  };
}

export function trackViewItem(item: Ga4Item) {
  sendEvent('view_item', {
    currency: item.currency || DEFAULT_CURRENCY,
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: Ga4Item) {
  sendEvent('add_to_cart', {
    currency: item.currency || DEFAULT_CURRENCY,
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackBeginCheckout(items: Ga4Item[]) {
  const safeItems = items.filter((item) => item.item_id && item.item_name);
  if (!safeItems.length) {
    return;
  }
  sendEvent('begin_checkout', {
    currency: DEFAULT_CURRENCY,
    value: safeItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0),
    items: safeItems,
  });
}

export function trackPurchase(payload: {
  transaction_id?: string;
  value?: number;
  items: Ga4Item[];
  currency?: string;
}) {
  const safeItems = payload.items.filter((item) => item.item_id && item.item_name);
  if (!safeItems.length) {
    return;
  }

  sendEvent('purchase', {
    transaction_id: payload.transaction_id,
    currency: payload.currency || DEFAULT_CURRENCY,
    value:
      payload.value ??
      safeItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0),
    items: safeItems,
  });
}
