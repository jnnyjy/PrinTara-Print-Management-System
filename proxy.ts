import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Edge-layer authentication guard.
 *
 * This is a SECOND line of defence — layout.tsx files still perform their own
 * checks. The middleware intercepts requests before any layout runs, providing
 * protection against layout-bypass edge cases.
 *
 * Protected route prefixes:
 *   /owner  → requires authenticated user with owner_ email
 *   /staff  → requires authenticated user with staff_ email
 *
 * Public routes (no auth required):
 *   /           hero / landing
 *   /submit     public job submission
 *   /track      public live queue
 *   /login      login page
 *   /api/track  public API
 *   /_next/*    Next.js internals
 */

function getRoleFromEmail(email: string | undefined): 'staff' | 'owner' | null {
  if (!email) return null
  const lower = email.toLowerCase()
  if (lower.startsWith('staff_') && lower.endsWith('@printara.com')) return 'staff'
  if (lower.startsWith('owner_') && lower.endsWith('@printara.com')) return 'owner'
  return null
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only guard /owner and /staff prefixes
  const isOwnerRoute = pathname.startsWith('/owner')
  const isStaffRoute = pathname.startsWith('/staff')

  if (!isOwnerRoute && !isStaffRoute) {
    return NextResponse.next()
  }

  // Build a response we can attach refreshed cookies to
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // getUser() makes a network call to verify the JWT — not just decoded locally
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  const role = getRoleFromEmail(user.email)

  if (isOwnerRoute && role !== 'owner') {
    // Staff trying to reach /owner — redirect to their own area
    const dest = role === 'staff' ? '/staff' : '/login'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  if (isStaffRoute && role !== 'staff') {
    // Owner trying to reach /staff — redirect to their own area
    const dest = role === 'owner' ? '/owner' : '/login'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match /owner and /staff and all sub-paths.
     * Exclude Next.js internals and static files.
     */
    '/owner/:path*',
    '/staff/:path*',
  ],
}
