import { z } from 'zod';
import { FAKE_EMAIL_DOMAIN } from './constants';

export const usernameSchema = z
  .string()
  .min(3, 'Mindestens 3 Zeichen')
  .max(20, 'Höchstens 20 Zeichen')
  .regex(/^[a-z0-9_-]+$/, 'Nur Kleinbuchstaben, Zahlen, _ und -');

export const passwordSchema = z.string().min(8, 'Mindestens 8 Zeichen');

export const displayNameSchema = z.string().min(1, 'Darf nicht leer sein').max(40, 'Höchstens 40 Zeichen');

export function usernameToFakeEmail(username: string): string {
  return `${username.toLowerCase()}@${FAKE_EMAIL_DOMAIN}`;
}
