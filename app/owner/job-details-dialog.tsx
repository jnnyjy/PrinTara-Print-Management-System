'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'

type JobFile = {
  id: string
  file_name: string
  file_path: string | null
  signedUrl: string | null
}

export type BoardJob = {
  id: string
  order_code: string
  status: string
  quantity: number
  paper_size: string | null
  color_mode: string | null
  price: number | null
  notes?: string | null
  files?: JobFile[]
}

function isImageFile(fileName: string) {
  return /\.(jpe?g|png|gif|webp)$/i.test(fileName)
}

function isPdfFile(fileName: string) {
  return /\.pdf$/i.test(fileName)
}

function FileIcon({ fileName }: { fileName: string }) {
  if (isImageFile(fileName)) return <ImageRoundedIcon />
  if (isPdfFile(fileName)) return <PictureAsPdfRoundedIcon />
  return <InsertDriveFileRoundedIcon />
}

export default function JobDetailsDialog({ job }: { job: BoardJob }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const files = job.files ?? []
  const activeFile = previewIndex === null ? null : files[previewIndex]

  function closeDetails() {
    setDetailsOpen(false)
    setPreviewIndex(null)
  }

  return (
    <>
      <Button
        size="small"
        fullWidth
        onClick={() => setDetailsOpen(true)}
        sx={{
          fontFamily: 'var(--font-geist-sans)',
          fontWeight: 700,
          fontSize: '0.78rem',
          textTransform: 'none',
          borderRadius: '8px',
          bgcolor: '#2563EB',
          color: '#fff',
          boxShadow: '0 3px 8px rgba(37,99,235,0.25)',
          '&:hover': {
            bgcolor: '#1D4ED8',
            boxShadow: '0 5px 12px rgba(37,99,235,0.35)',
          },
        }}
      >
        View Details
      </Button>

      <Dialog 
        open={detailsOpen} 
        onClose={closeDetails} 
        fullWidth 
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '18px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 2,
          pt: 3,
          px: 3,
        }}>
          <Box>
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#566170',
                fontFamily: 'var(--font-geist-sans)',
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
              }}
            >
              Order details
            </Typography>
            <Typography 
              variant="h6"
              sx={{
                fontFamily: 'var(--font-geist-sans)',
                fontWeight: 800,
                color: '#14233D',
                fontSize: '1.4rem',
                mt: 0.5,
              }}
            >
              {job.order_code}
            </Typography>
          </Box>
          <IconButton 
            aria-label="Close details" 
            onClick={closeDetails}
            sx={{
              bgcolor: 'rgba(0,0,0,0.04)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          dividers 
          sx={{
            px: 3,
            py: 3,
            borderTop: '1px solid rgba(0,0,0,0.08)',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2.5, 
            mb: 3 
          }}>
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#566170',
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Status
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 600,
                  color: '#14233D',
                  fontSize: '0.95rem',
                  mt: 0.5,
                }}
              >
                {job.status}
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#566170',
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Quantity
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 600,
                  color: '#14233D',
                  fontSize: '0.95rem',
                  mt: 0.5,
                }}
              >
                {job.quantity}
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#566170',
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Paper / format
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 600,
                  color: '#14233D',
                  fontSize: '0.95rem',
                  mt: 0.5,
                }}
              >
                {job.paper_size || 'Not specified'}
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#566170',
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Color mode
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 600,
                  color: '#14233D',
                  fontSize: '0.95rem',
                  mt: 0.5,
                }}
              >
                {job.color_mode === 'color' ? 'Full Color' : job.color_mode === 'bw' ? 'Black & White' : 'Not specified'}
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#566170',
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Finishing
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 600,
                  color: '#14233D',
                  fontSize: '0.95rem',
                  mt: 0.5,
                }}
              >
                {job.notes?.replace(/^Finishing:\s*/, '') || 'None selected'}
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#566170',
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Price
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 600,
                  color: '#14233D',
                  fontSize: '0.95rem',
                  mt: 0.5,
                }}
              >
                {job.price == null ? 'Not set' : `₱${job.price}`}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 2.5, borderColor: 'rgba(0,0,0,0.08)' }} />
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 800, 
              mb: 2,
              fontFamily: 'var(--font-geist-sans)',
              color: '#14233D',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            Attached Files 
            <Chip 
              label={`${files.length} ${files.length === 1 ? 'file' : 'files'}`} 
              size="small" 
              sx={{ 
                fontFamily: 'var(--font-geist-sans)',
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: 'rgba(37,99,235,0.1)',
                color: '#2563EB',
              }} 
            />
          </Typography>
          {files.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.5 }}>
              {files.map((file, index) => (
                <Button 
                  key={file.id} 
                  variant="outlined" 
                  onClick={() => setPreviewIndex(index)} 
                  disabled={!file.signedUrl} 
                  sx={{ 
                    minHeight: 108, 
                    p: 1.5, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 0.75, 
                    textTransform: 'none', 
                    overflow: 'hidden',
                    borderRadius: '12px',
                    borderColor: 'rgba(0,0,0,0.12)',
                    bgcolor: '#FFFFFF',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#2563EB',
                      bgcolor: 'rgba(37,99,235,0.02)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }
                  }}
                >
                  {file.signedUrl && isImageFile(file.file_name) ? (
                    <Box 
                      component="img" 
                      src={file.signedUrl} 
                      alt="" 
                      sx={{ 
                        width: 70, 
                        height: 48, 
                        objectFit: 'cover', 
                        borderRadius: '8px' 
                      }} 
                    />
                  ) : (
                    <FileIcon fileName={file.file_name} />
                  )}
                  <Chip 
                    label={isPdfFile(file.file_name) ? 'PDF' : isImageFile(file.file_name) ? 'IMAGE' : 'FILE'} 
                    size="small"
                    sx={{
                      fontFamily: 'var(--font-geist-sans)',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    noWrap 
                    sx={{ 
                      maxWidth: '100%',
                      fontFamily: 'var(--font-geist-sans)',
                      fontSize: '0.75rem',
                    }}
                  >
                    {file.file_name}
                  </Typography>
                </Button>
              ))}
            </Box>
          ) : (
            <Typography 
              sx={{ 
                color: '#566170',
                fontFamily: 'var(--font-geist-sans)',
                fontSize: '0.9rem',
              }}
            >
              No attached files.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={closeDetails}
            variant="contained"
            sx={{
              fontFamily: 'var(--font-geist-sans)',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: '8px',
              bgcolor: '#2563EB',
              color: '#fff',
              boxShadow: '0 3px 8px rgba(37,99,235,0.3)',
              '&:hover': { 
                bgcolor: '#1D4ED8', 
                boxShadow: '0 5px 12px rgba(37,99,235,0.4)' 
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={activeFile !== null} onClose={() => setPreviewIndex(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography noWrap sx={{ mr: 2 }}>{activeFile?.file_name}</Typography>
          <IconButton aria-label="Close file preview" onClick={() => setPreviewIndex(null)}><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: { xs: 240, sm: 420 }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#20242A' }}>
          {activeFile?.signedUrl && isImageFile(activeFile.file_name)
            ? <Box component="img" src={activeFile.signedUrl} alt={activeFile.file_name} sx={{ maxWidth: '100%', maxHeight: { xs: '60vh', sm: 520 }, objectFit: 'contain' }} />
            : activeFile?.file_path && isPdfFile(activeFile.file_name)
            ? (
              <Box
                component="iframe"
                src={`/api/file-proxy?path=${encodeURIComponent(activeFile.file_path)}`}
                title={activeFile.file_name}
                sx={{ width: '100%', height: { xs: '60vh', sm: 520 }, border: 0, bgcolor: 'white' }}
              />
            )
            : <Typography color="white">Preview unavailable.</Typography>}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button onClick={() => setPreviewIndex(null)}>Back to details</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button disabled={previewIndex === null || previewIndex <= 0} onClick={() => setPreviewIndex((index) => (index === null ? null : index - 1))}>Prev</Button>
            <Button disabled={previewIndex === null || previewIndex >= files.length - 1} onClick={() => setPreviewIndex((index) => (index === null ? null : index + 1))}>Next</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  )
}
