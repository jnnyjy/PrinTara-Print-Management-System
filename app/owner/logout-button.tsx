'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@mui/material'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Loader from '@/app/loading-indicator'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {loading && <Loader fullScreen label="Logging out" />}
      <Button
        onClick={handleLogout}
        disabled={loading}
      sx={{
        fontFamily: 'var(--font-geist-sans)',
        fontWeight: 600,
        fontSize: '0.875rem',
        textTransform: 'none',
        borderRadius: '8px',
        px: 2,
        py: 0.75,
        color: '#566170',
        border: '1px solid rgba(0,0,0,0.12)',
        bgcolor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        '&:hover': {
          bgcolor: '#FFFFFF',
          color: '#14233D',
          borderColor: 'rgba(0,0,0,0.2)',
        },
      }}
    >
        Log Out
      </Button>
    </>
  )
}