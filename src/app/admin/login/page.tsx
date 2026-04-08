import { redirect } from 'next/navigation';

/**
 * Redirect /admin/login → /auth/admin
 *
 * The login page has been moved outside the admin layout
 * to avoid authentication check loops.
 */
export default function AdminLoginRedirect() {
  redirect('/auth/admin');
}
