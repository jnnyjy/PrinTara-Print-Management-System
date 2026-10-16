import { Box } from '@mui/material'

/**
 * Decorative background blobs shared across the homepage and submit page.
 * Purely presentational — lives in the layout so it never re-mounts on navigation.
 */
export default function BackgroundBlobs() {
  return (
    <>
      {/* Blob: top-left (yellow/gold) */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: { xs: '-14vw', md: '-10vw' },
          left: { xs: '-14vw', md: '-7vw' },
          width: { xs: '34vw', md: '19vw' },
          height: { xs: '34vw', md: '19vw' },
          borderRadius: '50%',
          bgcolor: '#FFC82C',
          opacity: 0.4,
          filter: 'blur(2px)',
          animation: 'floatSlow 12s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Blob: top-right (blue) */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: { xs: '-10vw', md: '-9vw' },
          right: { xs: '-4vw', md: '4vw' },
          width: { xs: '28vw', md: '20vw' },
          height: { xs: '28vw', md: '20vw' },
          borderRadius: '50%',
          bgcolor: '#A8CBE8',
          opacity: 0.6,
          filter: 'blur(2px)',
          animation: 'floatMedium 14s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Blob: bottom-right (pink/salmon) */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          bottom: { xs: '2vw', md: '4vw' },
          right: { xs: '-12vw', md: '-5vw' },
          width: { xs: '26vw', md: '15vw' },
          height: { xs: '26vw', md: '15vw' },
          borderRadius: '50%',
          bgcolor: '#F3C9CE',
          opacity: 0.65,
          filter: 'blur(2px)',
          animation: 'floatFast 10s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Blob: bottom-left (lavender/purple) */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          bottom: { xs: '-14vw', md: '-10vw' },
          left: { xs: '-10vw', md: '-5vw' },
          width: { xs: '36vw', md: '22vw' },
          height: { xs: '36vw', md: '22vw' },
          borderRadius: '50%',
          bgcolor: '#C9C3E8',
          opacity: 0.55,
          filter: 'blur(2px)',
          animation: 'floatSlow 16s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Blob: bottom-center-right (mint/green) */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          bottom: { xs: '-10vw', md: '-8vw' },
          left: { xs: '50vw', md: '38vw' },
          width: { xs: '26vw', md: '16vw' },
          height: { xs: '26vw', md: '16vw' },
          borderRadius: '50%',
          bgcolor: '#B8DDD4',
          opacity: 0.5,
          filter: 'blur(2px)',
          animation: 'floatMedium 13s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
