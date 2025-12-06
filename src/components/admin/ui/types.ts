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
