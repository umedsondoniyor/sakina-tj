export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  old_price?: number;
  image_url: string;
  category: string;
  sale_percentage?: number;
  rating: number;
  review_count: number;
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