// TrialGuard — Profile Hook
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;
      setProfile(data as Profile);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<Profile, 'name' | 'avatar_url'>>) => {
      if (!userId) return;
      setSaving(true);
      try {
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

        if (updateError) throw updateError;
        setProfile(data as Profile);
      } catch (e: any) {
        setError(e.message ?? 'Failed to update profile.');
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  return {
    profile,
    loading,
    saving,
    error,
    fetchProfile,
    updateProfile,
    setProfile,
  };
}
