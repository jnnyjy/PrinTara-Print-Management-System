import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Box, Container } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import printaraLogo from '@/app/Logo/PrintaraLogo.png'
import LogoutButton from './logout-button'
import NavLinks from './nav-links'
import { getRoleFromEmail } from '@/lib/auth'

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = getRoleFromEmail(user.email)

  // Owner can only access owner routes
  // Staff should use staff routes
  if (role !== 'owner') {
    if (role === 'staff') {
      redirect('/staff')
    } else {
      redirect('/login')
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        '@keyframes floatSlow': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(8px, -12px) scale(1.03)' },
        },
        '@keyframes floatMedium': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-10px, 8px) scale(1.02)' },
        },
        '@keyframes floatFast': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(6px, 10px) scale(1.04)' },
        },
      }}
    >
      {/* Background blobs — fixed so they stay put during scroll */}
      <Box aria-hidden="true" sx={{ position: 'fixed', top: { xs: '-14vw', md: '-10vw' }, left: { xs: '-14vw', md: '-7vw' }, width: { xs: '34vw', md: '19vw' }, height: { xs: '34vw', md: '19vw' }, borderRadius: '50%', bgcolor: '#FFC82C', opacity: 0.35, filter: 'blur(2px)', animation: 'floatSlow 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <Box aria-hidden="true" sx={{ position: 'fixed', top: { xs: '-10vw', md: '-9vw' }, right: { xs: '-4vw', md: '4vw' }, width: { xs: '28vw', md: '20vw' }, height: { xs: '28vw', md: '20vw' }, borderRadius: '50%', bgcolor: '#A8CBE8', opacity: 0.5, filter: 'blur(2px)', animation: 'floatMedium 14s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <Box aria-hidden="true" sx={{ position: 'fixed', bottom: { xs: '2vw', md: '4vw' }, right: { xs: '-12vw', md: '-5vw' }, width: { xs: '26vw', md: '15vw' }, height: { xs: '26vw', md: '15vw' }, borderRadius: '50%', bgcolor: '#F3C9CE', opacity: 0.6, filter: 'blur(2px)', animation: 'floatFast 10s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <Box aria-hidden="true" sx={{ position: 'fixed', bottom: { xs: '-14vw', md: '-10vw' }, left: { xs: '-10vw', md: '-5vw' }, width: { xs: '36vw', md: '22vw' }, height: { xs: '36vw', md: '22vw' }, borderRadius: '50%', bgcolor: '#C9C3E8', opacity: 0.5, filter: 'blur(2px)', animation: 'floatSlow 16s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <Box aria-hidden="true" sx={{ position: 'fixed', bottom: { xs: '-10vw', md: '-8vw' }, left: { xs: '50vw', md: '38vw' }, width: { xs: '26vw', md: '16vw' }, height: { xs: '26vw', md: '16vw' }, borderRadius: '50%', bgcolor: '#B8DDD4', opacity: 0.45, filter: 'blur(2px)', animation: 'floatMedium 13s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar — pinned at top */}
      <Box
        component="header"
        sx={{
          flexShrink: 0,
          zIndex: 10,
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          bgcolor: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(12px)',
          py: 1.5,
        }}
      >
        <Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' }, rowGap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 3 }, minWidth: 0, width: { xs: '100%', md: 'auto' }, overflowX: 'auto' }}>
            <Link href="/owner" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <Image
                src={printaraLogo}
                alt="PrinTara"
                width={130}
                height={0}
                priority
                style={{ objectFit: 'contain', width: 'clamp(100px, 12vw, 140px)', height: 'auto' }}
              />
            </Link>
            <NavLinks />
          </Box>
          <Box sx={{ ml: { xs: 'auto', md: 2 } }}><LogoutButton /></Box>
        </Container>
      </Box>

      {/* Page content — fills remaining height, scrollable for analytics/completed-jobs */}
      <Box sx={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  )
}
