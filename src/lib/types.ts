src/lib/types.ts
export interface Product {
  id: string;
  /** URL segment for /products/:slug when set (Latin kebab-case); otherwise id is used. */
  slug?: string | null;
  name: string;
  description?: string;
  price: number;
  old_price?: number;
  image_url: string;
  image_urls: string[];
  category: string;
  sale_percentage?: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
  // Mattress characteristics (optional, mainly for mattresses category)
  mattress_type?: string;
  hardness?: string;
  spring_count?: number;
  spring_block_type?: string;
  cover_material?: string;
  removable_cover?: boolean;
  filler_material?: string;
  warranty_years?: number;
  recommended_mattress_pad?: string;
  country_of_origin?: string;
  weight_category?: string;
}

export interface RelatedProduct {
  id: string;
  product_id: string;
  related_product_id: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Joined product data
  related_product?: Product;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_name: string;
  size_type: 'pillow' | 'mattress' | 'bed' | 'sofa' | 'blanket' | 'furniture';
  height_cm?: number;
  width_cm?: number;
  length_cm?: number;
  price: number;
  old_price?: number;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Stock information will come from inventory table
  inventory?: {
    stock_quantity: number;
    in_stock: boolean;
    location_id: string;
  };
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  location_id: string;
  product_variant_id: string;
  stock_quantity: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  /** Sort order in admin and in getCategories() (lower = first). */
  order_index?: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerReview {
  id: string;
  username: string;
  description?: string;
  image_url: string;
  type: 'image' | 'video';
  instagram_url?: string;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  card_image: string;
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  phone?: string;
  full_name?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface ClubMember {
  id: string;
  user_id: string | null;
  phone: string;
  full_name: string;
  email: string | null;
  date_of_birth: string | null;
  member_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  total_purchases: number;
  discount_percentage: number;
  is_active: boolean;
  last_purchase_at: string | null;
  birthday_bonus_claimed_at: string | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClubMemberPointsHistory {
  id: string;
  member_id: string;
  points_change: number;
  reason: string;
  order_id: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  size?: string;
  variant_id?: string;
}

export interface CartItemMatchOptions {
  size?: string;
  variantId?: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, options?: CartItemMatchOptions) => void;
  updateQuantity: (id: string, quantity: number, options?: CartItemMatchOptions) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  total: number;
  totalItems: number;
}

export interface QuizStep {
  id: string;
  label: string;
  step_key: string;
  order_index: number;
  is_active: boolean;
  product_type?: 'mattress' | 'bed';
  parent_step_key?: string;
  parent_value?: string;
  created_at: string;
  updated_at: string;
  options: QuizStepOption[];
}

export interface QuizStepOption {
  id: string;
  step_id: string;
  option_value: string;
  option_label: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  category_slug: string;
  icon_name?: string;
  icon_image_url?: string;
  /** Only `home_category_grid_items`: optional override for `/categories/{slug}`. */
  link_url?: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Extra `<meta>` rows (Open Graph, Twitter, verification, etc.). */
export interface SeoExtraMetaTag {
  /** Use `name` for standard meta, e.g. `twitter:card` */
  name?: string;
  /** Use `property` for Open Graph, e.g. `og:image` */
  property?: string;
  content: string;
}

/** SEO meta for a logical route (`default` = site fallback, `home` = главная). */
export interface SeoPageSetting {
  id: string;
  route_key: string;
  meta_title: string;
  meta_description: string | null;
  /** Parsed JSON array from DB; see `SeoExtraMetaTag`. */
  extra_meta?: SeoExtraMetaTag[] | null;
  created_at: string;
  updated_at: string;
}

/** Repeatable icon cards on /services */
export interface ServicePageItem {
  id: string;
  title: string;
  description: string | null;
  icon_name: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Single row in `services_settings` */
export interface ServicesPageSettings {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  cta_title: string | null;
  cta_description: string | null;
  cta_button_label: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PrivacyPolicySettings {
  id: string;
  page_title: string;
  meta_description: string | null;
  intro: string | null;
  body_markdown: string;
  created_at: string;
  updated_at: string;
}

/** Single-row footer contact / legal / social (see footer_settings) */
export interface FooterSiteSettings {
  id: string;
  phone_display: string;
  phone_href: string;
  email: string;
  email_href: string;
  address: string;
  copyright_line1: string;
  copyright_line2: string | null;
  legal_text: string | null;
  payment_label: string;
  show_payment_icons: boolean;
  social_heading: string;
  instagram_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FooterSectionRecord {
  id: string;
  slug: string;
  title: string;
  /** If set and `links` is empty, the column title is the only link (e.g. /about). */
  title_href: string | null;
  sort_order: number;
  section_type: 'manual' | 'categories' | 'blog';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FooterSectionLinkRecord {
  id: string;
  section_id: string;
  label: string;
  href: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FooterColumn {
  slug: string;
  title: string;
  /** When present and links is empty, title alone links here. */
  titleHref?: string | null;
  links: { label: string; href: string }[];
}

export interface FooterPayload {
  settings: FooterSiteSettings;
  columns: FooterColumn[];
}

export interface OneClickOrder {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  selected_variant_id?: string;
  selected_size?: string;
  phone_number: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  category_id?: string;
  author_id?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  published_at?: string;
  reading_time: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  category?: BlogCategory;
  author?: {
    id: string;
    full_name?: string;
    email?: string;
  };
  tags?: BlogTag[];
}