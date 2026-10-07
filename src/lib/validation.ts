import { z } from 'zod';

export const usernameSchema = z
  .string()
  .min(3, 'Mindestens 3 Zeichen')
  .max(20, 'Höchstens 20 Zeichen')
  .regex(/^[a-z0-9_-]+$/, 'Nur Kleinbuchstaben, Zahlen, _ und -');

export const pinSchema = z
  .string()
  .regex(/^\d{6}$/, 'PIN muss genau 6 Ziffern haben');

export const displayNameSchema = z.string().min(1, 'Darf nicht leer sein').max(40, 'Höchstens 40 Zeichen');
