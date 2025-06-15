
export const ADMIN_EMAIL = 'your-dev-email@domain.com'; // TODO: Replace with your email

export function isAdminUser(user?: { email?: string | null }) {
  return !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
