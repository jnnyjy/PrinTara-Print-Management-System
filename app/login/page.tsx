import { Box } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import BackgroundCircles from './background-circles'
import BrandPanel from './brand-panel'
import LoginCard from './login-card'
import LoadingLink from '@/app/loading-link'

export default function LoginPage() {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, md: 4 },
        py: { xs: 7, md: 5 },
        '@keyframes circleDrift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(12px, -10px) scale(1.03)' },
        },
        '@keyframes loginCardReveal': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <BackgroundCircles />

      <LoadingLink
        href="/"
        aria-label="Back to Home"
        style={{
          position: 'absolute',
          top: 24,
          left: 32,
          zIndex: 2,
          color: '#14213D',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(20,33,61,0.08)',
          borderRadius: '999px',
          padding: '7px 14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '0.8rem',
          fontWeight: 700,
          textDecoration: 'none',
          fontFamily: 'var(--font-geist-sans)',
          boxShadow: '0 5px 14px rgba(20,33,61,0.08)',
        }}
      >
        <ArrowBackRoundedIcon sx={{ fontSize: '1.05rem' }} />
        Back to Home
      </LoadingLink>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 1040,
          bgcolor: '#FFFFFF',
          borderRadius: { xs: '28px', md: '44px' },
          p: { xs: 1.25, md: 1.75 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
          gap: { xs: 1.5, md: 1.5 },
          boxShadow: '0 24px 60px rgba(20,33,61,0.18)',
          animation: 'loginCardReveal 500ms ease-out both',
        }}
      >
        <LoginCard />
        <BrandPanel />
      </Box>
    </Box>
  )
}
