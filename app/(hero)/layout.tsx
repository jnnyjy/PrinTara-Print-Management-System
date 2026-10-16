import PageShell from '../page-shell'

/**
 * Shared layout for the (hero) route group.
 * Both `/` and `/submit` render inside PageShell,
 * so the left column and blobs stay locked in place.
 */
export default function HeroLayout({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>
}
