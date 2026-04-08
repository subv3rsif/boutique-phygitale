/**
 * Auth Layout
 *
 * Minimal layout for authentication pages (login, etc.)
 * No auth protection here - these are public pages
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
