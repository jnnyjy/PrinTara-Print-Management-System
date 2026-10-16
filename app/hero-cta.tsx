'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button, Stack } from '@mui/material'
import Loader from '@/app/loading-indicator'

export default function HeroCTA() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  function navigateTo(path: string) {
    setIsNavigating(true)
    window.setTimeout(() => {
      startTransition(() => router.push(path))
    }, 150)
  }

  return (
    <>
      {(isPending || isNavigating) && <Loader fullScreen label="Opening page" />}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
      <Button
        component={Link}
        href="/submit"
        onClick={(event) => {
          event.preventDefault()
          navigateTo('/submit')
        }}
        variant="contained"
        sx={{
          flex: 1,
          width: { xs: '100%', sm: 'auto' },
          bgcolor: '#2F6FEB',
          color: '#fff',
          py: 1,
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          boxShadow: 'none',
          transition: 'transform 180ms ease, background-color 180ms ease',
          '&:hover': { bgcolor: '#2558C4', boxShadow: 'none', transform: 'translateY(-2px)' },
          '&:focus-visible': { outline: '2px solid #14233D', outlineOffset: 2 },
        }}
      >
        Submit to Print
      </Button>
      <Button
        component={Link}
        href="/track"
        onClick={(event) => {
          event.preventDefault()
          navigateTo('/track')
        }}
        variant="contained"
        sx={{
          flex: 1,
          width: { xs: '100%', sm: 'auto' },
          bgcolor: '#3a3a3a',
          color: '#fff',
          py: 1,
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          boxShadow: 'none',
          transition: 'transform 180ms ease, background-color 180ms ease',
          '&:hover': { bgcolor: '#282828', boxShadow: 'none', transform: 'translateY(-2px)' },
          '&:focus-visible': { outline: '2px solid #14233D', outlineOffset: 2 },
        }}
      >
        Track my Print
      </Button>
      </Stack>
    </>
  )
}