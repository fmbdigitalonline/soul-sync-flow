
// DEPRECATED: This client-side check provides no real security
// Admin status should only be checked server-side via RLS policies
// This is kept for backward compatibility but should not be relied upon
export const ADMIN_EMAIL = 'nm@vc.com';

export function isAdminUser(user?: { email?: string | null }) {
  console.warn('isAdminUser() is deprecated and insecure. Use server-side admin checks instead.');
  return false; // Always return false for security - use server-side checks
}
