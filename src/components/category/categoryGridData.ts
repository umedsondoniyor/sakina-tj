import type { NavigationItem } from '../../lib/types';

export type CategoryTile = {
  id: string | number;
  name: string;
  image: string;
  slug: string;
  link?: string;
};

export const FALLBACK_CATEGORIES: CategoryTile[] = [
  { id: 1, name: 'Матрасы', image: 'https://ik.imagekit.io/3js0rb3pk/categ_matress.png', slug: 'mattresses', link: '/categories/mattresses' },
  { id: 2, name: 'Кровати', image: 'https://ik.imagekit.io/3js0rb3pk/categ_bed.png', slug: 'beds', link: '/categories/beds' },
  { id: 3, name: 'Одеяло', image: 'https://ik.imagekit.io/3js0rb3pk/categ_blanket.png', slug: 'blankets' },
  { id: 4, name: 'Массажное кресло', image: '/images/smart-chair-b.png', slug: 'smartchair', link: '/categories/smartchair' },
  { id: 5, name: 'Подушки', image: 'https://ik.imagekit.io/3js0rb3pk/categ_pillow.png', slug: 'pillows', link: '/categories/pillows' },
];

export function mapHomeGridRows(rows: NavigationItem[]): CategoryTile[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.title,
    image: row.icon_image_url || '',
    slug: row.category_slug,
    link: row.link_url || undefined,
  }));
}

/** Two stacked tiles per horizontal column (mobile rail). */
export function chunkCategoryColumns(categories: CategoryTile[]): { top: CategoryTile; bottom?: CategoryTile }[] {
  const columns: { top: CategoryTile; bottom?: CategoryTile }[] = [];
  for (let i = 0; i < categories.length; i += 2) {
    columns.push({
      top: categories[i],
      bottom: categories[i + 1],
    });
  }
  return columns;
}
