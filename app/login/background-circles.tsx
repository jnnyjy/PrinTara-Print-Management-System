import { Box } from '@mui/material'

export default function BackgroundCircles() {
  return (
    <>
      <Box aria-hidden="true" sx={{ position: 'absolute', top: -120, left: -90, width: 330, height: 330, borderRadius: '50%', bgcolor: '#FFE99A', opacity: 0.82, filter: 'blur(1px)', animation: 'circleDrift 14s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <Box aria-hidden="true" sx={{ position: 'absolute', top: -130, right: -80, width: 360, height: 360, borderRadius: '50%', bgcolor: '#CFE2F5', opacity: 0.86, filter: 'blur(1px)', animation: 'circleDrift 17s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 0 }} />
      <Box aria-hidden="true" sx={{ position: 'absolute', right: -100, bottom: -120, width: 330, height: 330, borderRadius: '50%', bgcolor: '#F8DDE1', opacity: 0.8, filter: 'blur(1px)', animation: 'circleDrift 16s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <Box aria-hidden="true" sx={{ position: 'absolute', left: -100, bottom: -150, width: 370, height: 370, borderRadius: '50%', bgcolor: '#E2DCF0', opacity: 0.8, filter: 'blur(1px)', animation: 'circleDrift 19s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 0 }} />
      <Box aria-hidden="true" sx={{ position: 'absolute', left: '42%', bottom: -210, width: 330, height: 330, borderRadius: '50%', bgcolor: '#D9EFE8', opacity: 0.78, filter: 'blur(1px)', animation: 'circleDrift 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
    </>
  )
}
