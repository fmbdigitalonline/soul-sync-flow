import { User } from '@supabase/supabase-js';

/**
 * Lijst van email adressen die toegang hebben tot hermetische rapporten
 * Dit is een UI-only restrictie - backend RLS blijft de echte security laag
 */
const ALLOWED_HERMETIC_EMAILS = [
  'info@fmbonline.nl',
  'nm@vc.com'
];

/**
 * Controleert of een gebruiker toegang heeft tot hermetische rapporten
 * @param user - De Supabase user object
 * @returns boolean - true als de gebruiker toegang heeft
 */
export const canAccessHermeticReport = (user: User | null | undefined): boolean => {
  if (!user?.email) {
    return false;
  }
  
  return ALLOWED_HERMETIC_EMAILS.includes(user.email.toLowerCase());
};
