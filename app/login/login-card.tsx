'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import { getHomePageForRole, getRoleFromEmail } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import printaraLogo from '@/app/Logo/PrintaraLogo.png'
import Loader from '@/app/loading-indicator'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFFFF',
    borderRadius: '999px',
    height: 54,
    transition: 'box-shadow 180ms ease, border-color 180ms ease',
    '& fieldset': { border: '2px solid #FFE99A' },
    '&:hover fieldset': { borderColor: '#FFE99A' },
    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 2 },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(37,99,235,0.14)' },
  },
  '& .MuiInputBase-input': { px: 1.25, fontSize: '0.92rem' },
}

export default function LoginCard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.signOut().finally(() => setSessionReady(true))
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const role = getRoleFromEmail(data.user?.email)
    router.push(getHomePageForRole(role))
    router.refresh()
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: { xs: '24px', md: '32px' },
        p: { xs: 2.5, sm: 4.5 },
        width: '100%',
        minHeight: { md: 600 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        animation: 'loginFormReveal 550ms ease-out both',
        '@keyframes loginFormReveal': {
          from: { opacity: 0, transform: 'translateX(-14px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      {loading && <Loader fullScreen label="Logging in" />}
      <Image
        src={printaraLogo}
        alt="PrinTara"
        width={190}
        height={0}
        priority
        style={{ width: '190px', height: 'auto', objectFit: 'contain', objectPosition: 'left center', marginBottom: '24px' }}
      />

      <Typography component="h1" sx={{ color: '#14213D', fontSize: { xs: '1.7rem', sm: '2rem' }, fontWeight: 900, lineHeight: 1.15 }}>
        Welcome back
      </Typography>
      <Typography sx={{ color: '#4A4A3A', fontSize: '0.9rem', mt: 0.7, mb: 2.5 }}>
        Log in to the admin dashboard.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
        <Box>
          <InputLabel htmlFor="login-email" sx={{ color: '#14213D', fontSize: '0.8rem', fontWeight: 800, mb: 0.7 }}>Email address</InputLabel>
          <TextField
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@email.com"
            required
            fullWidth
            sx={fieldSx}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailOutlineRoundedIcon sx={{ color: '#758197', fontSize: 20 }} /></InputAdornment> } }}
          />
        </Box>

        <Box>
          <InputLabel htmlFor="login-password" sx={{ color: '#14213D', fontSize: '0.8rem', fontWeight: 800, mb: 0.7 }}>Password</InputLabel>
          <TextField
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            fullWidth
            sx={fieldSx}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#758197', fontSize: 20 }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton type="button" edge="end" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} sx={{ color: '#758197' }}>{showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</IconButton></InputAdornment>,
              },
            }}
          />
        </Box>

        {error && <Alert severity="error" role="alert" sx={{ borderRadius: '12px', py: 0.25 }}>{error}</Alert>}

        <Button
          type="submit"
          fullWidth
          disabled={loading || !sessionReady}
          sx={{ mt: 0.5, height: 56, borderRadius: '999px', bgcolor: '#2563EB', color: '#FFFFFF', fontSize: '1rem', fontWeight: 800, textTransform: 'none', boxShadow: '0 10px 20px rgba(37,99,235,0.24)', '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 12px 24px rgba(37,99,235,0.3)' }, '&:focus-visible': { outline: '3px solid #2563EB', outlineOffset: 2 }, '&:disabled': { bgcolor: '#93B4F5', color: '#FFFFFF' } }}
        >
          Login
        </Button>
      </Box>
    </Box>
  )
}
