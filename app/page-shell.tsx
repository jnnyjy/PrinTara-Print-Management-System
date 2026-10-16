import { Box } from '@mui/material'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import BackgroundBlobs from './background-blobs'
import HeroLeft from './hero-left'
import LoadingLink from './loading-link'

/**
 * Shared page shell used by both `/` and `/submit`.
 * The left column (logo + tagline + steps) and background blobs are rendered
 * once in this layout and stay locked in place during navigation.
 * Only the right panel (`children`) swaps between pages.
 */
export default function PageShell({ children }: { children: React.ReactNode }) {
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
        py: { xs: 4, md: 0 },
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
        '@keyframes cardFloat': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      }}
    >
      <Box
        component="nav"
        aria-label="Staff access"
        sx={{
          position: 'absolute',
          top: { xs: 16, md: 24 },
          right: { xs: 16, md: 32 },
          zIndex: 2,
        }}
      >
        <LoadingLink className="staff-login-link" href="/login" aria-label="Staff and admin login">
          <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 17 }} />
          <Box component="span" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
            Staff &amp; Admin
          </Box>
        </LoadingLink>
      </Box>

      <BackgroundBlobs />

      {/* Two-column layout */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 5, md: 8 },
          zIndex: 1,
          width: '100%',
          maxWidth: 1100,
          animation: 'pageContentReveal 500ms ease-out both',
          '@keyframes pageContentReveal': {
            from: { opacity: 0, transform: 'translateY(12px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <HeroLeft />

        {/* Right panel — swapped per-page */}
        {children}
      </Box>
    </Box>
  )
}
