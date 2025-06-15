
export const ADMIN_EMAIL = 'nm@vc.com';

export function isAdminUser(user?: { email?: string | null }) {
  return !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
