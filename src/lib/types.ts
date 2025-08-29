export interface Product {
  id: string;
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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  size?: string;
  variant_id?: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  total: number;
}

export interface QuizStep {
  id: string;
  label: string;
  step_key: string;
  order_index: number;
  is_active: boolean;
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
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}