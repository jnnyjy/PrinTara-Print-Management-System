'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, Button, Typography, Stack } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import printaraLogo from './Logo/PrintaraLogo.png'
import { STEPS, TAGLINE_LINE1, TAGLINE_LINE2, SUBTITLE } from './copy'

/**
 * Left column of the hero layout: logo, tagline, subtitle, and "how it works" steps.
 * Shared between the homepage and the submit page via the route-group layout,
 * so it stays locked in place during navigation.
 */
export default function HeroLeft() {
  const pathname = usePathname()
  const showBack = pathname !== '/'

  return (
    <Box sx={{ flex: 1 }}>
      {/* Fixed-height row so content below never shifts between pages */}
      <Box sx={{ minHeight: 44, mb: 1, display: 'flex', alignItems: 'flex-start' }}>
        {showBack && (
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackRoundedIcon sx={{ fontSize: '1.1rem' }} />}
            sx={{
              color: '#566170',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '20px',
              px: 2,
              py: 0.6,
              bgcolor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.18s ease-in-out',
              '&:hover': {
                bgcolor: '#FFFFFF',
                color: '#14233D',
                borderColor: 'rgba(0, 0, 0, 0.16)',
                transform: 'translateX(-3px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            Back to Home
          </Button>
        )}
      </Box>
      <Box sx={{ mb: 3 }}>
        <Image
          src={printaraLogo}
          alt="PrinTara"
          width={180}
          height={0}
          priority
          style={{ objectFit: 'contain', objectPosition: 'left center', width: 'clamp(140px, 18vw, 200px)', height: 'auto' }}
        />
      </Box>

      <Typography
        component="h1"
        sx={{
          fontFamily: 'var(--font-newsreader)',
          fontStyle: 'italic',
          fontSize: { xs: '2.5rem', md: '3.2rem' },
          lineHeight: 1.2,
          color: '#1E2B45',
          fontWeight: 400,
          mb: 2,
        }}
      >
        {TAGLINE_LINE1}
        <br />
        {TAGLINE_LINE2}
      </Typography>

      <Typography
        sx={{
          color: '#2E3440',
          fontSize: { xs: '1.05rem', md: '1.15rem' },
          lineHeight: 1.65,
          mb: 4,
          maxWidth: 440,
        }}
      >
        {SUBTITLE}
      </Typography>

      {/* Steps */}
      <Stack spacing={2.5}>
        {STEPS.map((step, index) => (
          <Box
            key={step.n}
            sx={{
              display: 'flex',
              gap: 2,
              animation: 'heroStepReveal 400ms ease-out both',
              animationDelay: `${index * 70 + 180}ms`,
              '@keyframes heroStepReveal': {
                from: { opacity: 0, transform: 'translateX(-8px)' },
                to: { opacity: 1, transform: 'translateX(0)' },
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-newsreader)',
                fontSize: '1.8rem',
                lineHeight: 1.1,
                color: '#B47A27',
                minWidth: 32,
                fontWeight: 700,
                pt: 0.1,
              }}
            >
              {step.n}
            </Typography>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#14233D', mb: 0.25, fontSize: '1.1rem' }}>
                {step.title}
              </Typography>
              <Typography sx={{ color: '#2E3440', fontSize: '1rem', lineHeight: 1.55, maxWidth: 380 }}>
                {step.body}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
