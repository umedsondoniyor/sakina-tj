// Shared Type Definitions

export type AboutSettings = {
  id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  mission_text: string | null;
  mission_section_title: string | null;
  timeline_section_title: string | null;
  timeline_section_description: string | null;
  team_section_title: string | null;
  team_section_description: string | null;
  cta_title: string | null;
  cta_description: string | null;
  updated_at?: string | null;
};

export type AboutStat = {
  id: string;
  number: string;
  label: string;
  icon: string;
  order: number;
};

export type AboutValue = {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
};

export type AboutTimeline = {
  id: string;
  year: string;
  title: string;
  description: string;
  order: number;
};

export type AboutTeam = {
  id: string;
  name: string;
  position: string;
  description: string;
  image_url: string;
  order: number;
};

export type MattressPageSettings = {
  id: string;
  hero_title: string;
  hero_description: string;
  type_section_title: string;
  hardness_section_title: string;
  popular_filters_section_title: string;
  collections_section_title: string;
  first_purchase_section_title: string;
  hit_sales_section_title: string;
  view_all_button_text: string;
  updated_at?: string | null;
};

export type MattressCollection = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  collection_type: string;
  price_min: number | null;
  price_max: number | null;
  preferences: string[] | null;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type MattressType = {
  id: string;
  name: string;
  image_url: string;
  type_id: string;
  width_min: number | null;
  width_max: number | null;
  age_categories: string[] | null;
  preferences: string[] | null;
  mattress_types: string[] | null;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type MattressHardnessLevel = {
  id: string;
  name: string;
  description: string;
  level: number;
  hardness_value: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type MattressPopularFilter = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  filter_id: string;
  age_categories: string[] | null;
  preferences: string[] | null;
  functions: string[] | null;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type MattressFirstPurchaseArticle = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  article_url: string | null;
  is_main: boolean;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};
