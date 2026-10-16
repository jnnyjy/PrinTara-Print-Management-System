/**
 * Role-based access control utilities
 * 
 * Staff accounts: staff_shopname@printara.com
 * Owner accounts: owner_shopname@printara.com
 */

export type UserRole = 'staff' | 'owner' | null

export function getRoleFromEmail(email: string | undefined): UserRole {
  if (!email) return null
  
  const lowerEmail = email.toLowerCase()
  
  if (lowerEmail.startsWith('staff_') && lowerEmail.endsWith('@printara.com')) {
    return 'staff'
  }
  
  if (lowerEmail.startsWith('owner_') && lowerEmail.endsWith('@printara.com')) {
    return 'owner'
  }
  
  return null
}

export function canAccessAnalytics(role: UserRole): boolean {
  return role === 'owner'
}

export function canAccessCompletedJobs(role: UserRole): boolean {
  return role === 'owner'
}

export function canAccessOrders(role: UserRole): boolean {
  return role === 'staff' || role === 'owner'
}

export function getHomePageForRole(role: UserRole): string {
  if (role === 'owner') return '/owner'
  if (role === 'staff') return '/staff'
  return '/login'
}
