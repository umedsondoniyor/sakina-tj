import { useState, useEffect } from 'react';
import {
  getAboutSettings,
  getAboutStats,
  getAboutValues,
  getAboutTimeline,
  getAboutTeam,
  type AboutSettings,
  type AboutStat,
  type AboutValue,
  type AboutTimeline,
  type AboutTeam
} from '../lib/aboutApi';

interface UseAboutDataReturn {
  settings: AboutSettings | null;
  stats: AboutStat[];
  values: AboutValue[];
  timeline: AboutTimeline[];
  team: AboutTeam[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAboutData = (): UseAboutDataReturn => {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [stats, setStats] = useState<AboutStat[]>([]);
  const [values, setValues] = useState<AboutValue[]>([]);
  const [timeline, setTimeline] = useState<AboutTimeline[]>([]);
  const [team, setTeam] = useState<AboutTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [settingsData, statsData, valuesData, timelineData, teamData] = await Promise.allSettled([
        getAboutSettings(),
        getAboutStats(),
        getAboutValues(),
        getAboutTimeline(),
        getAboutTeam()
      ]);

      // Handle settings
      if (settingsData.status === 'fulfilled') {
        setSettings(settingsData.value);
      } else {
        console.warn('Failed to load settings:', settingsData.reason);
      }

      // Handle stats
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      } else {
        console.warn('Failed to load stats:', statsData.reason);
      }

      // Handle values
      if (valuesData.status === 'fulfilled') {
        setValues(valuesData.value);
      } else {
        console.warn('Failed to load values:', valuesData.reason);
      }

      // Handle timeline
      if (timelineData.status === 'fulfilled') {
        setTimeline(timelineData.value);
      } else {
        console.warn('Failed to load timeline:', timelineData.reason);
      }

      // Handle team
      if (teamData.status === 'fulfilled') {
        setTeam(teamData.value);
      } else {
        console.warn('Failed to load team:', teamData.reason);
      }

      // Check if all requests failed
      const allFailed = [settingsData, statsData, valuesData, timelineData, teamData]
        .every(result => result.status === 'rejected');

      if (allFailed) {
        setError('Не удалось загрузить данные о компании');
      }

    } catch (err) {
      console.error('Error in useAboutData:', err);
      setError('Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    settings,
    stats,
    values,
    timeline,
    team,
    loading,
    error,
    refetch: fetchData
  };
};