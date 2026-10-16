'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import { rejectJobRequest, type AcceptState } from './actions'
import Loader from '@/app/loading-indicator'

const initialState: AcceptState = { success: false, message: '' }

export default function RejectRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(rejectJobRequest, initialState)

  useEffect(() => {
    if (state.success) router.refresh()
  }, [router, state.success])

  return (
    <>
      {isPending && <Loader fullScreen label="Rejecting" />}
      <form action={formAction}>
      <input type="hidden" name="requestId" value={requestId} />
      <Button
        type="submit"
        color="error"
        size="small"
        disabled={isPending}
        sx={{
          fontFamily: 'var(--font-geist-sans)',
          fontWeight: 700,
          fontSize: '0.82rem',
          textTransform: 'none',
          borderRadius: '8px',
          bgcolor: '#DC2626',
          color: '#fff',
          boxShadow: '0 3px 8px rgba(220,38,38,0.3)',
          '&:hover': { bgcolor: '#B91C1C', boxShadow: '0 5px 12px rgba(220,38,38,0.4)' },
          '&:disabled': { bgcolor: 'rgba(220,38,38,0.4)', color: '#fff' },
        }}
      >
        Reject
      </Button>
      </form>
    </>
  )
}
