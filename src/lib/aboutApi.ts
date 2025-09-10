import { supabase } from './supabaseClient';

export interface AboutSettings {
  id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  updated_at: string | null;
}

export interface AboutStat {
  id: string;
  number: string;
  label: string;
  icon: string;
  order: number;
}

export interface AboutValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface AboutTimeline {
  id: string;
  year: string;
  title: string;
  description: string;
  order: number;
}

export interface AboutTeam {
  id: string;
  name: string;
  position: string;
  description: string;
  image_url: string;
  order: number;
}

// Retry utility for better error handling
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
  context = ''
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      
      console.warn(`[aboutApi] ${context} failed (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
  
  throw lastError instanceof Error 
    ? new Error(`[aboutApi] ${context} failed after ${retries} attempts: ${lastError.message}`)
    : new Error(`[aboutApi] ${context} failed after ${retries} attempts`);
}

// Settings API
export async function getAboutSettings(): Promise<AboutSettings | null> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }, 3, 1000, 'getAboutSettings');
}

export async function upsertAboutSettings(settings: Partial<AboutSettings>): Promise<AboutSettings> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }, 3, 1000, 'upsertAboutSettings');
}

// Stats API
export async function getAboutStats(): Promise<AboutStat[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_stats')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  }, 3, 1000, 'getAboutStats');
}

export async function createAboutStat(stat: Omit<AboutStat, 'id'>): Promise<AboutStat> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_stats')
      .insert([stat])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }, 3, 1000, 'createAboutStat');
}

export async function updateAboutStat(id: string, updates: Partial<AboutStat>): Promise<AboutStat> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_stats')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }, 3, 1000, 'updateAboutStat');
}

export async function deleteAboutStat(id: string): Promise<void> {
  return retryOperation(async () => {
    const { error } = await supabase
      .from('about_stats')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }, 3, 1000, 'deleteAboutStat');
}

// Values API
export async function getAboutValues(): Promise<AboutValue[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_values')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  }, 3, 1000, 'getAboutValues');
}

export async function createAboutValue(value: Omit<AboutValue, 'id'>): Promise<AboutValue> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_values')
      .insert([value])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }, 3, 1000, 'createAboutValue');
}

export async function updateAboutValue(id: string, updates: Partial<AboutValue>): Promise<AboutValue> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_values')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }, 3, 1000, 'updateAboutValue');
}

export async function deleteAboutValue(id: string): Promise<void> {
  return retryOperation(async () => {
    const { error } = await supabase
      .from('about_values')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }, 3, 1000, 'deleteAboutValue');
}

// Timeline API
export async function getAboutTimeline(): Promise<AboutTimeline[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_timeline')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  }, 3, 1000, 'getAboutTimeline');
}

export async function createAboutTimelineItem(item: Omit<AboutTimeline, 'id'>): Promise<AboutTimeline> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_timeline')
      .insert([item])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }, 3, 1000, 'createAboutTimelineItem');
}

export async function updateAboutTimelineItem(id: string, updates: Partial<AboutTimeline>): Promise<AboutTimeline> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_timeline')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }, 3, 1000, 'updateAboutTimelineItem');
}

export async function deleteAboutTimelineItem(id: string): Promise<void> {
  return retryOperation(async () => {
    const { error } = await supabase
      .from('about_timeline')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }, 3, 1000, 'deleteAboutTimelineItem');
}

// Team API
export async function getAboutTeam(): Promise<AboutTeam[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_team')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  }, 3, 1000, 'getAboutTeam');
}

export async function createAboutTeamMember(member: Omit<AboutTeam, 'id'>): Promise<AboutTeam> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_team')
      .insert([member])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }, 3, 1000, 'createAboutTeamMember');
}

export async function updateAboutTeamMember(id: string, updates: Partial<AboutTeam>): Promise<AboutTeam> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('about_team')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }, 3, 1000, 'updateAboutTeamMember');
}

export async function deleteAboutTeamMember(id: string): Promise<void> {
  return retryOperation(async () => {
    const { error } = await supabase
      .from('about_team')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }, 3, 1000, 'deleteAboutTeamMember');
}