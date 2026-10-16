'use client'

import { Box } from '@mui/material'
import JobDetailsDialog, { type BoardJob } from '../job-details-dialog'

function money(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0)
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export type CompletedJobRow = BoardJob & {
  completed_at: string
  amount: number
}

export default function CompletedJobsList({ jobs }: { jobs: CompletedJobRow[] }) {
  if (jobs.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: '18px',
          p: 4,
          textAlign: 'center',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 6px rgba(0,0,0,0.04)',
        }}
      >
        <Box
          component="p"
          sx={{ m: 0, fontFamily: 'var(--font-geist-sans)', fontSize: '0.95rem', color: '#566170' }}
        >
          No completed paid jobs yet.
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 6px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1.2fr) minmax(80px, .9fr) auto', sm: '1fr 1fr 1fr' },
          px: { xs: 1.5, sm: 3 },
          py: 1.25,
          borderBottom: '1px solid rgba(20,35,61,0.1)',
          bgcolor: 'rgba(0,0,0,0.03)',
        }}
      >
        <Box
          component="span"
          sx={{
            fontFamily: 'var(--font-geist-sans)',
            fontWeight: 700,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: '#566170',
            textAlign: 'left',
          }}
        >
          Order
        </Box>
        <Box
          component="span"
          sx={{
            fontFamily: 'var(--font-geist-sans)',
            fontWeight: 700,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: '#566170',
            textAlign: 'center',
          }}
        >
          Amount
        </Box>
        <Box component="span" />
      </Box>

      {/* Data rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {jobs.map((job, index) => (
          <Box
            key={`${job.order_code}-${job.completed_at}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1.2fr) minmax(80px, .9fr) auto', sm: '1fr 1fr 1fr' },
              px: { xs: 1.5, sm: 3 },
              py: 1.75,
              borderBottom: '1px solid rgba(20,35,61,0.07)',
              alignItems: 'center',
              animation: 'completedJobReveal 350ms ease-out both',
              animationDelay: `${index * 55}ms`,
              '@keyframes completedJobReveal': {
                from: { opacity: 0, transform: 'translateY(8px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              transition: 'bgcolor 0.15s ease',
              '&:last-child': { borderBottom: 'none' },
              '&:hover': { bgcolor: 'rgba(20,35,61,0.03)' },
            }}
          >
            <Box>
              <Box
                component="span"
                sx={{
                  display: 'block',
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 800,
                  color: '#14233D',
                  fontSize: '0.95rem',
                }}
              >
                {job.order_code}
              </Box>
              <Box
                component="span"
                sx={{
                  display: 'block',
                  fontFamily: 'var(--font-geist-sans)',
                  fontSize: '0.78rem',
                  color: '#566170',
                  mt: 0.25,
                }}
              >
                {dateTime(job.completed_at)}
              </Box>
            </Box>
            <Box
              component="span"
              sx={{
                fontFamily: 'var(--font-geist-sans)',
                fontWeight: 800,
                color: '#14233D',
                fontSize: '0.95rem',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {money(job.amount)}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ width: 'fit-content' }}>
                <JobDetailsDialog job={job} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
