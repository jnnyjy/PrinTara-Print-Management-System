'use client'

import { useState, useEffect, useActionState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Typography,
} from '@mui/material'
import { acceptJobRequest, type AcceptState } from './actions'
import Loader from '@/app/loading-indicator'

type Props = {
  requestId: string
  onAccepted?: (receipt: NonNullable<AcceptState['receipt']>) => void
}

const initialState: AcceptState = { success: false, message: '' }

export default function AcceptRequestDialog({ requestId, onAccepted }: Props) {
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState('')
  const [amountReceived, setAmountReceived] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [state, formAction, isPending] = useActionState(async (previousState: AcceptState, formData: FormData) => {
    try {
      return await acceptJobRequest(previousState, formData)
    } finally {
      setIsSubmitting(false)
    }
  }, initialState)

  const priceValue = Number(price)
  const amountReceivedValue = Number(amountReceived)
  const change = Number.isFinite(priceValue) && Number.isFinite(amountReceivedValue)
    ? Math.max(0, amountReceivedValue - priceValue)
    : 0

  useEffect(() => {
    if (state.success && state.receipt) {
      onAccepted?.(state.receipt)
    }
  }, [onAccepted, state.receipt, state.success])

  if (state.receipt) return null

  return (
    <>
      {(isPending || isSubmitting) && <Loader fullScreen label="Processing" />}
      <Button
        variant="contained"
        size="small"
        onClick={() => setOpen(true)}
        sx={{
          fontFamily: 'var(--font-geist-sans)',
          fontWeight: 700,
          fontSize: '0.82rem',
          textTransform: 'none',
          borderRadius: '8px',
          bgcolor: '#2563EB',
          color: '#fff',
          boxShadow: '0 3px 8px rgba(37,99,235,0.3)',
          '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 5px 12px rgba(37,99,235,0.4)' },
        }}
      >
        Accept
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth={state.receipt ? 'sm' : 'xs'}>
        <DialogTitle>{state.receipt ? 'Receipt preview' : 'Cashier checkout'}</DialogTitle>
        <Box component="form" action={formAction} onSubmit={() => setIsSubmitting(true)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {state.message && !state.success && (
              <Alert severity="error">{state.message}</Alert>
            )}

            <input type="hidden" name="requestId" value={requestId} />
            <TextField
              name="price"
              label="Price (₱)"
              type="text"
              inputMode="decimal"
              required
              fullWidth
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <TextField
              name="amountReceived"
              label="Payment received (₱)"
              type="text"
              inputMode="decimal"
              required
              fullWidth
              value={amountReceived}
              onChange={(event) => setAmountReceived(event.target.value)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5 }}>
              <Typography color="text.secondary">Change</Typography>
              <Typography sx={{ fontWeight: 800 }}>₱{change.toFixed(2)}</Typography>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isPending}>
              Accept & Print Receipt
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  )
}