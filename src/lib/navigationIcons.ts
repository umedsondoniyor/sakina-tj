import type { LucideIcon } from 'lucide-react';
import {
  Bed,
  BedDouble,
  Sofa,
  Box,
  Baby,
  Pill as Pillow,
  RockingChair,
  Earth,
  Users,
  Package,
  Home,
  ShoppingCart,
  Heart,
  Star,
  Map as MapIcon,
} from 'lucide-react';
import type { NavigationItem } from './types';

/** Lucide icons selectable in admin for navigation / catalog menu */
export const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  Bed,
  BedDouble,
  Sofa,
  Box,
  Baby,
  Pillow,
  RockingChair,
  Earth,
  Users,
  Package,
  Home,
  ShoppingCart,
  Heart,
  Star,
  Map: MapIcon,
};

export function getLucideIconByName(iconName?: string | null): LucideIcon {
  if (!iconName) return Box;
  return LUCIDE_ICON_MAP[iconName] ?? Box;
}

/** Icon for a navigation row: Lucide by name, or placeholder when only custom image is set */
export function getIconForNavigationItem(item: NavigationItem): LucideIcon {
  return getLucideIconByName(item.icon_name);
}

/** Default Lucide icon name per product category slug (when `categories.image_url` is empty). */
export const CATALOG_SLUG_ICON_NAME: Record<string, string> = {
  mattresses: 'BedDouble',
  beds: 'BedDouble',
  sofas: 'Sofa',
  pillows: 'Pillow',
  blankets: 'Box',
  covers: 'Box',
  kids: 'Baby',
  furniture: 'Box',
  smartchair: 'RockingChair',
  map: 'Map',
  about: 'Users',
};

export function getCatalogIconForSlug(slug: string): LucideIcon {
  const name = CATALOG_SLUG_ICON_NAME[slug] ?? 'Box';
  return getLucideIconByName(name);
}
