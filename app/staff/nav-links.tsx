'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Box, Button } from '@mui/material'
import Loader from '@/app/loading-indicator'

export default function NavLinks() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    if (!isNavigating) return
    const timer = window.setTimeout(() => setIsNavigating(false), 600)
    return () => window.clearTimeout(timer)
  }, [isNavigating, pathname])

  // Staff can only see Orders
  const links = [
    { href: '/staff', label: 'Orders' },
  ]

  return (
    <>
      {(isPending || isNavigating) && <Loader fullScreen label="Loading tab" />}
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {links.map(({ href, label }) => {
        const isActive = pathname === href
        return (
          <Button
            key={href}
            href={href}
            component={Link}
            onClick={(event) => {
              if (isActive) return
              event.preventDefault()
              setIsNavigating(true)
              startTransition(() => router.push(href))
            }}
            sx={{
              fontFamily: 'var(--font-geist-sans)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              borderRadius: 0,
              px: 1.5,
              py: 0.75,
              color: isActive ? '#14233D' : '#566170',
              bgcolor: 'transparent',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 8,
                right: 8,
                bottom: 0,
                height: 3,
                borderRadius: 3,
                background: '#FFC82C',
                boxShadow: '0 1px 5px rgba(255,200,44,0.45)',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scaleX(0.88)' : 'scaleX(0)',
                transition: 'transform 180ms ease, opacity 180ms ease',
              },
              '&:hover::after': { opacity: 1, transform: 'scaleX(1)' },
              '&:hover': {
                bgcolor: 'transparent',
                color: '#14233D',
              },
            }}
          >
            {label}
          </Button>
        )
      })}
      </Box>
    </>
  )
}