import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContext, type AuthContextValue, type PublicProfile } from '@/hooks/useAuth';
import type { Profile } from '@/types/db';

const STORAGE_KEY = 'einkaufsliste:session';

function toPublicProfile(profile: Profile): PublicProfile {
  return {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    created_at: profile.created_at,
  };
}

function readStoredProfile(): PublicProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PublicProfile) : null;
  } catch {
    return null;
  }
}

function friendlyAuthError(message: string): string {
  if (message.includes('USERNAME_TAKEN')) return 'Username ist schon vergeben';
  if (message.includes('INVALID_USERNAME')) return 'Username: 3-20 Zeichen, nur a-z, 0-9, _ und -';
  if (message.includes('INVALID_PIN')) return 'PIN muss genau 6 Ziffern haben';
  if (message.includes('INVALID_CREDENTIALS')) return 'Username oder PIN ist falsch';
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PublicProfile | null>(readStoredProfile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [profile]);

  const signUp = useCallback(async (username: string, pin: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('register_user', {
        _username: username,
        _pin: pin,
      });
      if (error) throw new Error(friendlyAuthError(error.message));
      setProfile(toPublicProfile(data));
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (username: string, pin: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('login_user', {
        _username: username,
        _pin: pin,
      });
      if (error) throw new Error(friendlyAuthError(error.message));
      setProfile(toPublicProfile(data));
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setProfile(null);
  }, []);

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      if (!profile) throw new Error('Nicht eingeloggt');
      const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', profile.id);
      if (error) throw error;
      setProfile((current) => (current ? { ...current, display_name: displayName } : current));
    },
    [profile],
  );

  const updatePassword = useCallback(
    async (newPin: string, oldPin: string) => {
      if (!profile) throw new Error('Nicht eingeloggt');
      const { error } = await supabase.rpc('update_pin', {
        _user_id: profile.id,
        _old_pin: oldPin,
        _new_pin: newPin,
      });
      if (error) throw new Error(friendlyAuthError(error.message));
    },
    [profile],
  );

  const value: AuthContextValue = {
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateDisplayName,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
