'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import printaraLogo from '../Logo/PrintaraLogo.png'
import BackgroundBlobs from '../background-blobs'
import Loader from '@/app/loading-indicator'

type QueueJob = {
  orderCode: string
  status: string
  quantity: number
  paperSize: string | null
  colorMode: string | null
  createdAt: string
}

const COLUMNS = [
  {
    key: 'RECEIVED',
    label: 'In queue',
    headerTitle: 'IN QUEUE',
    description: 'Next up! Your print job is waiting in line.',
    icon: AccessTimeRoundedIcon,
    accent: '#B47A27',
    bgColor: '#FEF8DE',
    borderColor: '#F6E6B4',
  },
  {
    key: 'PRINTING',
    label: 'Printing now',
    headerTitle: 'PRINTING',
    description: 'Your order is currently being processed.',
    icon: PrintRoundedIcon,
    accent: '#2B6CB0',
    bgColor: '#E3EEFE',
    borderColor: '#C7DCFB',
  },
  {
    key: 'READY',
    label: 'Ready for pickup',
    headerTitle: 'READY',
    description: 'Please claim at the counter with your order code.',
    icon: TaskAltRoundedIcon,
    accent: '#5E548E',
    bgColor: '#EAE4F8',
    borderColor: '#D4C9F0',
  },
] as const

function formatOrderCode(code: string) {
  if (!code) return ''
  return code.includes('-') ? code.replace('-', ' - ') : code
}

export default function TrackPage() {
  const router = useRouter()
  const [isNavigatingHome, startHomeTransition] = useTransition()
  const [jobs, setJobs] = useState<QueueJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadQueue = useCallback(async () => {
    setError(null)

    try {
      let res: Response | null = null

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          res = await fetch('/api/track', { cache: 'no-store' })
          break
        } catch (fetchError) {
          if (attempt === 1) throw fetchError
          await new Promise((resolve) => window.setTimeout(resolve, 500))
        }
      }

      if (!res) throw new Error('The queue server is unavailable.')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setJobs(data.jobs ?? [])
      setLastUpdated(new Date())
    } catch (queueError) {
      setError(
        queueError instanceof TypeError
          ? 'The queue is temporarily unavailable. Please refresh the page.'
          : queueError instanceof Error
            ? queueError.message
            : 'Unable to load the print queue.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const POLL_INTERVAL = 20000
    let interval: number | null = null

    const startPolling = () => {
      if (interval !== null) return
      interval = window.setInterval(() => loadQueue(), POLL_INTERVAL)
    }

    const stopPolling = () => {
      if (interval === null) return
      window.clearInterval(interval)
      interval = null
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadQueue()
        startPolling()
      } else {
        stopPolling()
      }
    }

    const initialLoad = window.setTimeout(() => loadQueue(), 0)
    if (document.visibilityState === 'visible') {
      startPolling()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearTimeout(initialLoad)
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadQueue])

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
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
          '@keyframes trackContentReveal': {
            from: { opacity: 0, transform: 'translateY(12px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
      }}
    >
      {isNavigatingHome && <Loader fullScreen label="Returning home" />}
      <BackgroundBlobs />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
          width: '100%',
          maxWidth: 1240,
          animation: 'trackContentReveal 500ms ease-out both',
        }}
      >
        {/* Top row — back button and live-queue chip share the same baseline */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2.5,
          }}
        >
          <Button
            component={Link}
            href="/"
            onClick={(event) => {
              event.preventDefault()
              startHomeTransition(() => router.push('/'))
            }}
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

          <Chip
            icon={
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#34D399',
                  boxShadow: '0 0 0 4px rgba(52, 211, 153, 0.22)',
                  ml: '8px',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    bgcolor: '#34D399',
                    animation: 'livePulse 2.2s ease-out infinite',
                  },
                  '@keyframes livePulse': {
                    '0%': { transform: 'scale(1)', opacity: 0.7 },
                    '100%': { transform: 'scale(2.4)', opacity: 0 },
                  },
                }}
              />
            }
            label={
              lastUpdated
                ? `Live · Updated ${lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                : 'Connecting...'
            }
            sx={{
              height: 36,
              px: 1,
              borderRadius: '999px',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(20, 35, 61, 0.06)',
              color: '#14233D',
              fontFamily: 'var(--font-geist-sans)',
              fontWeight: 600,
              fontSize: '0.8rem',
              letterSpacing: '0.01em',
              boxShadow: '0 6px 16px rgba(20, 35, 61, 0.1), 0 1px 4px rgba(20, 35, 61, 0.05)',
              '& .MuiChip-label': {
                pl: 1.25,
                pr: 1,
                fontFamily: 'var(--font-geist-sans)',
              },
              '& .MuiChip-icon': {
                ml: 0,
              },
            }}
          />
        </Box>

        {/* Main row — logo, tagline and the board now share the same top edge */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'stretch' },
            gap: { xs: 5, md: 8 },
          }}
        >
          {/* Left column — logo, tagline, and a legend for the three stages */}
          <Box sx={{ width: { xs: '100%', md: 360, lg: 400 }, flexShrink: 0, order: { xs: 2, md: 1 } }}>
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Link href="/" style={{ display: 'inline-block' }}>
                <Image
                  src={printaraLogo}
                  alt="PrinTara"
                  width={180}
                  height={0}
                  priority
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'left center',
                    width: 'clamp(140px, 18vw, 200px)',
                    height: 'auto',
                  }}
                />
              </Link>
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
              See where your
              <br />
              print job stands.
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
              Jobs move across the board as our team works through them. Your order code
              is shown so you can spot your place at a glance.
            </Typography>

            {/* Steps */}
            <Stack spacing={2.5}>
              {COLUMNS.map((col, index) => (
                <Box key={col.key} sx={{ display: 'flex', gap: 2 }}>
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
                    {index + 1}
                  </Typography>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: '#14233D',
                        mb: 0.25,
                        fontSize: '1.1rem',
                      }}
                    >
                      {col.label}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#2E3440',
                        fontSize: '1rem',
                        lineHeight: 1.55,
                        maxWidth: 380,
                      }}
                    >
                      {col.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Right column — the live board, top-aligned with the logo */}
          <Box sx={{ flex: 1, width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', order: { xs: 1, md: 2 } }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading && jobs.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  textAlign: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '20px',
                }}
              >
                <CircularProgress size={30} sx={{ color: '#E0A526' }} />
                <Typography sx={{ mt: 2, color: '#566170' }}>Loading the live queue...</Typography>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: { xs: 2.5, md: 2.5, lg: 3 },
                  flex: 1,
                }}
              >
                {COLUMNS.map(({ key, headerTitle, bgColor, borderColor }, index) => {
                  const columnJobs = jobs.filter((job) =>
                    job.status === key || (key === 'RECEIVED' && job.status === 'PENDING')
                  )
                  return (
                    <Box
                      key={key}
                      component="section"
                      aria-labelledby={`${key}-heading`}
                      sx={{
                        bgcolor: bgColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '24px',
                        p: { xs: 2, sm: 2.25 },
                        minHeight: { xs: 280, md: 'auto' },
                        height: { xs: 'auto', md: '100%' },
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                        backdropFilter: 'blur(8px)',
                        animation: 'trackColumnReveal 400ms ease-out both',
                        animationDelay: `${index * 70}ms`,
                        '@keyframes trackColumnReveal': {
                          from: { opacity: 0, transform: 'translateY(10px)' },
                          to: { opacity: 1, transform: 'translateY(0)' },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 2,
                          px: 0.5,
                        }}
                      >
                        <Box
                          component="span"
                          id={`${key}-heading`}
                          sx={{
                            fontFamily: 'var(--font-geist-sans)',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            color: '#1E2B45',
                            textTransform: 'uppercase',
                          }}
                        >
                          {headerTitle}
                        </Box>
                        {columnJobs.length > 0 && (
                          <Box
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.8)',
                              px: 1,
                              py: 0.2,
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              fontFamily: 'var(--font-geist-sans)',
                              color: '#4A5568',
                            }}
                          >
                            {columnJobs.length}
                          </Box>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                          flex: 1,
                          overflowY: 'auto',
                          pr: 0.5,
                          '&::-webkit-scrollbar': { width: '4px' },
                          '&::-webkit-scrollbar-thumb': {
                            bgcolor: 'rgba(0, 0, 0, 0.12)',
                            borderRadius: '4px',
                          },
                        }}
                      >
                        {columnJobs.map((job, jobIndex) => (
                          <Box
                            key={job.orderCode}
                            sx={{
                              py: 1.85,
                              px: 1.5,
                              bgcolor: '#FFFFFF',
                              borderRadius: '14px',
                              textAlign: 'center',
                              border: '1px solid rgba(0, 0, 0, 0.04)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                              animation: 'trackJobReveal 350ms ease-out both',
                              animationDelay: `${jobIndex * 45}ms`,
                              '@keyframes trackJobReveal': {
                                from: { opacity: 0, transform: 'translateY(7px)' },
                                to: { opacity: 1, transform: 'translateY(0)' },
                              },
                              transition: 'all 0.18s ease-in-out',
                              cursor: 'default',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                              },
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                fontFamily: 'var(--font-geist-sans)',
                                fontWeight: 900,
                                fontSize: { xs: '1.05rem', sm: '1.2rem' },
                                letterSpacing: '0.04em',
                                color: '#14233D',
                                lineHeight: 1.2,
                              }}
                            >
                              {formatOrderCode(job.orderCode)}
                            </Box>
                          </Box>
                        ))}

                        {columnJobs.length === 0 && (
                          <Box
                            sx={{
                              p: 3,
                              my: 'auto',
                              border: '2px dashed rgba(0, 0, 0, 0.08)',
                              borderRadius: '16px',
                              textAlign: 'center',
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                fontFamily: 'var(--font-geist-sans)',
                                color: '#8A92A0',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                              }}
                            >
                              No jobs right now
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        </Box>

      </Box>
    </Box>
  )
}