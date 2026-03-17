import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Types basés sur le schéma Supabase
interface User {
  id: string;
  name: string;
  profile: 'marianne' | 'killian';
  goal: string;
  streak: number;
  points: number;
  created_at: string;
  updated_at: string;
}

interface Session {
  id: string;
  user_id: string;
  date: string;
  type: 'duofit' | 'external';
  workout_name: string;
  duration: number;
  points_earned: number;
  created_at: string;
}

interface ExternalActivity {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  created_at: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  unlocked_at: string | null;
  created_at: string;
}

interface CoupleStats {
  id: string;
  total_points: number;
  updated_at: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getUserByProfile = (profile: 'marianne' | 'killian') =>
    users.find(u => u.profile === profile);

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (!error) await fetchUsers();
    else setError(error.message);
    return { error };
  };

  return { users, loading, error, getUserByProfile, updateUser, refetch: fetchUsers };
}

interface SessionInsert {
  user_id: string;
  date: string;
  type: 'duofit' | 'external';
  workout_name: string;
  duration: number;
  points_earned?: number;
}

export function useSessions(userId?: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);

  const fetchSessions = useCallback(async (since?: string) => {
    if (!userId) { setLoading(false); return; }

    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (since) query = query.gte('date', since);

      const { data, error } = await query;
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const addSession = async (session: SessionInsert) => {
    setMutating(true);
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .single();

    if (!error) await fetchSessions();
    setMutating(false);
    return { data: data as Session | null, error };
  };

  return { sessions, loading, error, mutating, addSession, refetch: fetchSessions };
}

export function useExternalActivities(userId?: string) {
  const [activities, setActivities] = useState<ExternalActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('external_activities')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, refetch: fetchActivities };
}

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const unlockReward = async (rewardId: string) => {
    const { error } = await supabase
      .from('rewards')
      .update({ unlocked_at: new Date().toISOString() })
      .eq('id', rewardId);

    if (!error) await fetchRewards();
    return { error };
  };

  const addReward = async (reward: { name: string; description: string; points_required: number }) => {
    const { data, error } = await supabase
      .from('rewards')
      .insert(reward)
      .select()
      .single();

    if (!error) await fetchRewards();
    return { data: data as Reward | null, error };
  };

  const getNextReward = (currentPoints: number) =>
    rewards.find(r => !r.unlocked_at && r.points_required > currentPoints);

  return { rewards, loading, error, unlockReward, addReward, getNextReward, refetch: fetchRewards };
}

export function useCoupleStats() {
  const [stats, setStats] = useState<CoupleStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('couple_stats')
        .select('*')
        .single();

      if (error) throw error;
      setStats(data);
    } catch (err) {
      console.error('Error fetching couple stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const addCouplePoints = async (points: number) => {
    // On refetch juste avant l'update pour réduire la fenêtre de race condition.
    // Solution définitive : créer une RPC Supabase `increment_couple_points(amount int)`
    // qui fait UPDATE couple_stats SET total_points = total_points + amount atomiquement.
    const { data: latest, error: fetchError } = await supabase
      .from('couple_stats')
      .select('*')
      .single();

    if (fetchError || !latest) return { error: fetchError || new Error('No stats found') };

    const { error } = await supabase
      .from('couple_stats')
      .update({ total_points: latest.total_points + points })
      .eq('id', latest.id);

    if (!error) {
      setStats({ ...latest, total_points: latest.total_points + points });
      await fetchStats();
    }
    return { error };
  };

  return { stats, loading, addCouplePoints, refetch: fetchStats };
}
