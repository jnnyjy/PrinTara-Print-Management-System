'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Box, Button } from '@mui/material'
import { createClient } from '@/lib/supabase/client'
import { updateJobStatus } from './actions'
import RequestDetailsDialog, { type PendingRequest } from './request-details-dialog'
import ReceiptPreviewDialog from './receipt-preview-dialog'
import type { AcceptState } from './actions'
import JobDetailsDialog, { type BoardJob } from './job-details-dialog'
import Loader from '@/app/loading-indicator'

type Job = BoardJob

const COLUMNS = ['RECEIVED', 'PRINTING', 'READY', 'COMPLETED'] as const
const COLUMN_LABELS: Record<(typeof COLUMNS)[number], string> = {
  RECEIVED: 'IN QUEUE',
  PRINTING: 'PRINTING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
}
const NEXT_STATUS: Record<string, string | null> = {
  RECEIVED: 'PRINTING',
  PRINTING: 'READY',
  READY: 'COMPLETED',
  COMPLETED: null,
}

export default function KanbanBoard({
  initialJobs,
  initialRequests,
}: {
  initialJobs: Job[]
  initialRequests: PendingRequest[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [movingJobId, setMovingJobId] = useState<string | null>(null)
  const [requests, setRequests] = useState<PendingRequest[]>(initialRequests)
  const [receipt, setReceipt] = useState<NonNullable<AcceptState['receipt']> | null>(null)
  const [isReceiptClosing, setIsReceiptClosing] = useState(false)

  const handleAccepted = useCallback((nextReceipt: NonNullable<AcceptState['receipt']>) => {
    setReceipt(nextReceipt)
  }, [])

  function handleReceiptDone() {
    setIsReceiptClosing(true)
    setReceipt(null)
    router.refresh()
  }

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('admin-board-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setJobs((prev) =>
              prev.map((j) => (j.id === payload.new.id ? { ...j, ...payload.new } : j))
            )
          } else if (payload.eventType === 'INSERT') {
            setJobs((prev) => [...prev, payload.new as Job])
          } else if (payload.eventType === 'DELETE') {
            setJobs((prev) => prev.filter((j) => j.id !== payload.old.id))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_requests' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Only surface newly-created requests that are still pending
            if (payload.new.status === 'PENDING') {
              setRequests((prev) => [...prev, payload.new as PendingRequest])
            }
          } else if (payload.eventType === 'UPDATE') {
            // Once a request is accepted/rejected it leaves the active queue
            if (payload.new.status !== 'PENDING') {
              setRequests((prev) => prev.filter((r) => r.id !== payload.new.id))
            } else {
              setRequests((prev) =>
                prev.map((r) => (r.id === payload.new.id ? { ...r, ...payload.new } : r))
              )
            }
          } else if (payload.eventType === 'DELETE') {
            setRequests((prev) => prev.filter((r) => r.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        // If the Realtime connection drops (network hiccup, sleep/wake),
        // do a full server refresh so the board isn't silently stale.
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          router.refresh()
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  async function handleMove(jobId: string, nextStatus: string) {
    setMovingJobId(jobId)
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j)))
    try {
      await updateJobStatus(jobId, nextStatus)
    } finally {
      setMovingJobId(null)
    }
  }

  return (
    <Box key={pathname} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 2.5 }, overflowX: 'hidden', overflowY: { xs: 'visible', md: 'hidden' }, height: { xs: 'auto', md: '100%' }, minHeight: 0, alignItems: 'stretch', pb: 1 }}>
      {movingJobId && <Loader fullScreen label="Updating job" />}
      {isReceiptClosing && <Loader fullScreen label="Updating board" />}
      {COLUMNS.map((column, index) => {
        const columnJobs = jobs.filter((job) => job.status === column)
        const columnRequests = column === 'RECEIVED' ? requests : []
        const totalCount = columnJobs.length + columnRequests.length

        // Match the tracking page column palette
        const columnStyles: Record<string, { bgColor: string; borderColor: string; accent: string }> = {
          RECEIVED:  { bgColor: '#FEF8DE', borderColor: '#F6E6B4', accent: '#B47A27' },
          PRINTING:  { bgColor: '#E3EEFE', borderColor: '#C7DCFB', accent: '#2B6CB0' },
          READY:     { bgColor: '#EAE4F8', borderColor: '#D4C9F0', accent: '#5E548E' },
          COMPLETED: { bgColor: '#E4F5EE', borderColor: '#C2E5D4', accent: '#276749' },
        }
        const { bgColor, borderColor } = columnStyles[column]

        return (
          <Box
            key={column}
            component="section"
            sx={{
              minWidth: { xs: 0, md: 270 },
              width: { xs: '100%', md: 'auto' },
              flex: { xs: '0 0 auto', md: 1 },
              bgcolor: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '24px',
              p: 2.25,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              height: { xs: 'auto', md: '100%' },
              minHeight: { xs: 240, md: 0 },
              animation: 'boardColumnReveal 400ms ease-out both',
              animationDelay: `${index * 70}ms`,
              '@keyframes boardColumnReveal': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {/* Column header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 0.5 }}>
              <Box
                component="span"
                sx={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: '#1E2B45',
                }}
              >
                {COLUMN_LABELS[column]}
              </Box>
              {totalCount > 0 && (
                <Box
                  component="span"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.8)',
                    px: 1,
                    py: 0.2,
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#4A5568',
                    fontFamily: 'var(--font-geist-sans)',
                  }}
                >
                  {totalCount}
                </Box>
              )}
            </Box>

            {/* Cards */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                flex: 1,
                overflowY: 'auto',
                pr: 0.5,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: '4px' },
              }}
            >
              {columnRequests.map((request, index) => (
                <Box
                  key={request.id}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: '14px',
                    p: 1.75,
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    animation: 'kanbanCardReveal 350ms ease-out both',
                    animationDelay: `${index * 45}ms`,
                    '@keyframes kanbanCardReveal': {
                      from: { opacity: 0, transform: 'translateY(8px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                    transition: 'all 0.18s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  {/* Order code + no price for requests */}
                  <Box
                    component="p"
                    sx={{
                      m: 0,
                      mb: 0.75,
                      fontFamily: 'var(--font-geist-sans)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      letterSpacing: '0.03em',
                      color: '#14233D',
                      textAlign: 'center',
                    }}
                  >
                    {request.order_code}
                  </Box>
                  <Box component="p" sx={{ m: 0, mb: 0.4, fontSize: '0.78rem', color: '#566170', fontFamily: 'var(--font-geist-sans)', textAlign: 'center' }}>
                    {request.quantity} {request.quantity === 1 ? 'copy' : 'copies'} | {request.color_mode === 'color' ? 'Color' : 'B&W'} | Finishing: {request.notes?.replace(/^Finishing:\s*/, '') || 'None'}
                  </Box>
                  <Box component="p" sx={{ m: 0, mb: 1.25, fontSize: '0.75rem', fontFamily: 'var(--font-geist-sans)', color: '#2563EB', fontWeight: 500, textAlign: 'center' }}>
                    Attached Files: {(request.files ?? []).length} {(request.files ?? []).length === 1 ? 'file' : 'files'}
                  </Box>
                  <RequestDetailsDialog request={request} onAccepted={handleAccepted} />
                </Box>
              ))}

              {columnJobs.map((job, index) => (
                <Box
                  key={job.id}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: '14px',
                    p: 1.75,
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    animation: 'kanbanCardReveal 350ms ease-out both',
                    animationDelay: `${(columnRequests.length + index) * 45}ms`,
                    '@keyframes kanbanCardReveal': {
                      from: { opacity: 0, transform: 'translateY(8px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                    transition: 'all 0.18s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  {/* Order code */}
                  <Box
                    component="p"
                    sx={{
                      m: 0,
                      mb: 0.75,
                      fontFamily: 'var(--font-geist-sans)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      letterSpacing: '0.03em',
                      color: '#14233D',
                      textAlign: 'center',
                    }}
                  >
                    {job.order_code}
                  </Box>
                  {/* Details */}
                  <Box component="p" sx={{ m: 0, mb: 0.4, fontSize: '0.78rem', color: '#566170', fontFamily: 'var(--font-geist-sans)', textAlign: 'center' }}>
                    {job.quantity} {job.quantity === 1 ? 'copy' : 'copies'} | {job.color_mode === 'color' ? 'Color' : 'B&W'} | Finishing: {job.notes?.replace(/^Finishing:\s*/, '') || 'None'}
                  </Box>
                  {/* Files */}
                  <Box component="p" sx={{ m: 0, mb: 1.25, fontSize: '0.75rem', fontFamily: 'var(--font-geist-sans)', color: '#2563EB', fontWeight: 500, textAlign: 'center' }}>
                    Attached Files: {(job.files ?? []).length} {(job.files ?? []).length === 1 ? 'file' : 'files'}
                  </Box>
                  <JobDetailsDialog job={job} />
                  {NEXT_STATUS[job.status] && (
                    <Button
                      fullWidth
                      size="small"
                      disabled={movingJobId !== null}
                      onClick={() => handleMove(job.id, NEXT_STATUS[job.status]!)}
                      sx={{
                        mt: 1,
                        fontFamily: 'var(--font-geist-sans)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textTransform: 'none',
                        borderRadius: '8px',
                        bgcolor: '#14233D',
                        color: '#fff',
                        boxShadow: '0 3px 8px rgba(20,35,61,0.2)',
                        '&:hover': {
                          bgcolor: '#2563EB',
                          boxShadow: '0 5px 12px rgba(37,99,235,0.3)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      Move to {NEXT_STATUS[job.status]}
                    </Button>
                  )}
                </Box>
              ))}

              {totalCount === 0 && (
                <Box
                  sx={{
                    p: 3,
                    my: 'auto',
                    border: '2px dashed rgba(0,0,0,0.08)',
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
      <ReceiptPreviewDialog receipt={receipt} onClose={handleReceiptDone} isClosing={isReceiptClosing} />
    </Box>
  )
}
