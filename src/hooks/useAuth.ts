import { createContext, useContext } from 'react';
import type { Profile } from '@/types/db';

export type PublicProfile = Omit<Profile, 'pin_hash'>;

export interface AuthContextValue {
  profile: PublicProfile | null;
  loading: boolean;
  signUp: (username: string, pin: string) => Promise<void>;
  signIn: (username: string, pin: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updatePassword: (newPin: string, oldPin: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  return context;
}
