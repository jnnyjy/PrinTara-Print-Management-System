import { Box, Typography } from '@mui/material'
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded'
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'

const FEATURES = [
  { icon: FormatListBulletedRoundedIcon, title: 'Review print requests', body: 'Check customer files, specifications, and queue details', color: '#FFF0B8' },
  { icon: UpdateRoundedIcon, title: 'Process print jobs', body: 'Set prices, record payments, and move jobs through production', color: '#D8EAFE' },
  { icon: BarChartRoundedIcon, title: 'Track shop performance', body: 'Review completed jobs, paid work, and earnings analytics', color: '#D9F3EA' },
]

function PrinterIllustration() {
  return (
    <Box component="svg" viewBox="0 0 360 220" aria-hidden="true" sx={{ width: '100%', maxWidth: 360, height: 'auto', display: 'block', mx: 'auto', my: { xs: 1, md: 2 } }}>
      <rect x="100" y="24" width="160" height="92" rx="8" fill="#FFFFFF" transform="rotate(-4 100 24)" />
      <rect x="126" y="48" width="104" height="7" rx="3.5" fill="#FFC400" transform="rotate(-4 126 48)" />
      <rect x="126" y="70" width="116" height="7" rx="3.5" fill="#CBD5E1" transform="rotate(-4 126 70)" />
      <rect x="126" y="87" width="86" height="7" rx="3.5" fill="#CBD5E1" transform="rotate(-4 126 87)" />
      <rect x="56" y="98" width="248" height="92" rx="28" fill="#14213D" />
      <rect x="78" y="113" width="204" height="16" rx="8" fill="#0B1730" />
      <rect x="80" y="148" width="72" height="18" rx="9" fill="#34466D" />
      <circle cx="238" cy="157" r="11" fill="#2563EB" />
      <circle cx="270" cy="157" r="11" fill="#FFC400" />
      <rect x="91" y="181" width="178" height="13" rx="6.5" fill="#FFFFFF" opacity="0.9" />
    </Box>
  )
}

export default function BrandPanel() {
  return (
    <Box
      component="section"
      aria-label="Printara features"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#CFE2F5',
        borderRadius: '32px',
        p: { xs: 2.5, md: 3.5 },
        minHeight: { md: 600 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        animation: 'brandPanelReveal 650ms ease-out 80ms both',
        '@keyframes brandPanelReveal': {
          from: { opacity: 0, transform: 'translateX(14px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        '@keyframes printerFloat': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        '@keyframes featureReveal': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -120,
          right: -110,
          width: 300,
          height: 300,
          borderRadius: '50%',
          bgcolor: '#FFE99A',
          opacity: 0.95,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography sx={{ color: '#14213D', fontFamily: 'var(--font-newsreader)', fontStyle: 'italic', fontSize: { xs: '2rem', md: '2.25rem' }, lineHeight: 1.12, mt: 2 }}>
          Print with ease,
          <br />
          on every page and piece.
        </Typography>
        <Typography sx={{ color: '#52627A', fontSize: '0.95rem', lineHeight: 1.55, maxWidth: 430, mt: 1.5 }}>
          Streamline your workflow, monitor orders instantly, and oversee your entire printing hub with absolute clarity.
        </Typography>
      </Box>

      <Box sx={{ animation: 'printerFloat 5s ease-in-out 700ms infinite' }}>
        <PrinterIllustration />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {FEATURES.map(({ icon: Icon, title, body, color }, index) => (
          <Box key={title} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, bgcolor: '#FFFFFF', borderRadius: '16px', px: 1.25, py: 1, opacity: 0, animation: 'featureReveal 400ms ease-out forwards', animationDelay: `${index * 90 + 650}ms`, transition: 'transform 180ms ease, box-shadow 180ms ease', '&:hover': { transform: 'translateX(3px)', boxShadow: '0 6px 16px rgba(20,33,61,0.08)' } }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon sx={{ color: '#14213D', fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#14213D', fontSize: '0.8rem', fontWeight: 800, lineHeight: 1.2 }}>{title}</Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.68rem', lineHeight: 1.35, mt: 0.2 }}>{body}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
