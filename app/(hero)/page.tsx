import { Box, Typography } from '@mui/material'
import HeroCTA from '../hero-cta'

/**
 * Homepage — only renders the right-panel "Get Started" card.
 * The left column (logo / tagline / steps) and background blobs
 * come from the shared (hero) layout and stay locked in place.
 */
export default function Home() {
  return (
    <Box
      sx={{
        bgcolor: '#FFEB99',
        borderRadius: { xs: '18px', md: '22px' },
        p: { xs: 5, md: 6 },
        width: '100%',
        maxWidth: 500,
        flexShrink: 0,
        boxShadow: '0 8px 40px rgba(255, 235, 153, 0.28), 0 2px 12px rgba(0,0,0,0.06)',
        textAlign: 'center',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        animation: 'cardFloat 3s ease-in-out infinite',
        '&:hover': {
          boxShadow: '0 12px 48px rgba(255, 235, 153, 0.38), 0 4px 16px rgba(0,0,0,0.08)',
          transform: 'translateY(-4px)',
          animation: 'none',
        },
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 900,
          color: '#1a1a1a',
          mb: 3,
          fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
          fontFamily: 'var(--font-geist-sans)',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          whiteSpace: 'normal',
        }}
      >
        Get Started Instantly
      </Typography>

      <Typography
        sx={{
          color: '#2a2a2a',
          fontSize: '0.85rem',
          lineHeight: 1.5,
          mb: 5,
          textAlign: 'center',
          px: 1,
        }}
      >
        Choose an option below to proceed right away. Completely guest-friendly!
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <HeroCTA />
      </Box>
    </Box>
  )
}
