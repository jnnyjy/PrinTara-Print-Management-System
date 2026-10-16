'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Typography,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import AcceptRequestDialog from './accept-request-dialog'
import type { AcceptState } from './actions'
import RejectRequestButton from './reject-request-button'
import Loader from '@/app/loading-indicator'

export type RequestFile = {
  id: string
  file_name: string
  file_path: string | null
  signedUrl: string | null
}

export type PendingRequest = {
  id: string
  order_code: string
  status: string
  quantity: number
  paper_size: string
  color_mode: string
  notes: string | null
  files?: RequestFile[]
}

function isImageFile(fileName: string) {
  return /\.(jpe?g|png|gif|webp)$/i.test(fileName)
}

function isPdfFile(fileName: string) {
  return /\.pdf$/i.test(fileName)
}

function FileIcon({ fileName }: { fileName: string }) {
  if (isImageFile(fileName)) return <ImageRoundedIcon sx={{ fontSize: '2rem', color: '#2563EB' }} />
  if (isPdfFile(fileName)) return <PictureAsPdfRoundedIcon sx={{ fontSize: '2rem', color: '#E53E3E' }} />
  return <InsertDriveFileRoundedIcon sx={{ fontSize: '2rem', color: '#566170' }} />
}

function DetailChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Box
      sx={{
        bgcolor: color,
        borderRadius: '14px',
        px: 2,
        py: 1.25,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
      }}
    >
      <Box
        component="span"
        sx={{
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '0.68rem',
          fontWeight: 600,
          color: '#566170',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        {label}
      </Box>
      <Box
        component="span"
        sx={{
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#14233D',
        }}
      >
        {value}
      </Box>
    </Box>
  )
}

export default function RequestDetailsDialog({
  request,
  onAccepted,
}: {
  request: PendingRequest
  onAccepted?: (receipt: NonNullable<AcceptState['receipt']>) => void
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const files = request.files ?? []
  const activeFile = previewIndex === null ? null : files[previewIndex]

  async function downloadAllFiles() {
    const downloadableFiles = files.filter((file) => file.signedUrl)
    if (downloadableFiles.length === 0) return
    setDownloadingAll(true)
    try {
      for (const file of downloadableFiles) {
        const response = await fetch(file.signedUrl!)
        if (!response.ok) continue
        const blobUrl = URL.createObjectURL(await response.blob())
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = file.file_name
        link.click()
        URL.revokeObjectURL(blobUrl)
      }
    } finally {
      setDownloadingAll(false)
    }
  }

  function closeDetails() {
    setDetailsOpen(false)
    setPreviewIndex(null)
  }

  function handleAccepted(receipt: NonNullable<AcceptState['receipt']>) {
    closeDetails()
    onAccepted?.(receipt)
  }

  return (
    <>
      {downloadingAll && <Loader fullScreen label="Downloading files" />}
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
          '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 5px 12px rgba(37,99,235,0.35)' },
        }}
      >
        View Details
      </Button>

      {/* Main details dialog */}
      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        fullWidth
        maxWidth="sm"
        sx={{ '& .MuiDialog-paper': { borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}
      >
        <Box>
          {/* Header */}
          <Box
            sx={{
              px: 3,
              pt: 3,
              pb: 2,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <Box>
              <Box
                component="span"
                sx={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: '#14233D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                Order Details
              </Box>
              <Box
                component="h2"
                sx={{
                  m: 0,
                  fontFamily: 'var(--font-geist-sans)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#14233D',
                  letterSpacing: '0.02em',
                }}
              >
                {request.order_code}
              </Box>
            </Box>
            <IconButton
              onClick={closeDetails}
              size="small"
              sx={{
                bgcolor: 'rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Details grid */}
          <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 3,
              }}
            >
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
                  {request.status}
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
                  {request.quantity}
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
                  {request.paper_size || 'Not specified'}
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
                  {request.color_mode === 'color' ? 'Full Color' : 'Black & White'}
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
                  {request.notes?.replace(/^Finishing:\s*/, '') || 'None selected'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Divider */}
          <Box sx={{ mx: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }} />

          {/* Attached Files */}
          <Box sx={{ px: 3, pt: 2, pb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="span"
                  sx={{
                    fontFamily: 'var(--font-geist-sans)',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: '#14233D',
                  }}
                >
                  Attached Files
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontFamily: 'var(--font-geist-sans)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(0,0,0,0.07)',
                    color: '#566170',
                    px: 1,
                    py: 0.2,
                    borderRadius: '99px',
                  }}
                >
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </Box>
              </Box>
              <Button
                size="small"
                startIcon={<DownloadRoundedIcon sx={{ fontSize: '0.9rem !important' }} />}
                disabled={downloadingAll || !files.some((f) => f.signedUrl)}
                onClick={downloadAllFiles}
                sx={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  color: '#14233D',
                  bgcolor: 'transparent',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                }}
              >
                Download All
              </Button>
            </Box>

            {files.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.25 }}>
                {files.map((file, index) => (
                  <Box
                    key={file.id}
                    onClick={() => file.signedUrl && setPreviewIndex(index)}
                    sx={{
                      border: '1.5px solid rgba(0,0,0,0.08)',
                      borderRadius: '14px',
                      p: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.75,
                      cursor: file.signedUrl ? 'pointer' : 'default',
                      opacity: file.signedUrl ? 1 : 0.5,
                      transition: 'all 0.18s ease',
                      '&:hover': file.signedUrl
                        ? { borderColor: '#2563EB', bgcolor: '#EFF6FF', transform: 'translateY(-2px)' }
                        : {},
                    }}
                  >
                    {file.signedUrl && isImageFile(file.file_name) ? (
                      <Box
                        component="img"
                        src={file.signedUrl}
                        alt=""
                        sx={{ width: '100%', height: 64, objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: 64,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(0,0,0,0.03)',
                          borderRadius: '8px',
                        }}
                      >
                        <FileIcon fileName={file.file_name} />
                      </Box>
                    )}
                    <Box
                      component="span"
                      sx={{
                        fontFamily: 'var(--font-geist-sans)',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: '#566170',
                        bgcolor: isPdfFile(file.file_name) ? '#FEE2E2' : isImageFile(file.file_name) ? '#DBEAFE' : '#F3F4F6',
                        px: 1,
                        py: 0.15,
                        borderRadius: '99px',
                      }}
                    >
                      {isPdfFile(file.file_name) ? 'PDF' : isImageFile(file.file_name) ? 'IMAGE' : 'FILE'}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        fontFamily: 'var(--font-geist-sans)',
                        fontSize: '0.7rem',
                        color: '#566170',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        width: '100%',
                      }}
                    >
                      {file.file_name}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  py: 3,
                  textAlign: 'center',
                  border: '2px dashed rgba(0,0,0,0.08)',
                  borderRadius: '14px',
                }}
              >
                <Box component="span" sx={{ fontFamily: 'var(--font-geist-sans)', fontSize: '0.85rem', color: '#8A92A0' }}>
                  No attached files
                </Box>
              </Box>
            )}
          </Box>

          {/* Footer actions */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              bgcolor: 'rgba(0,0,0,0.015)',
            }}
          >
            <RejectRequestButton requestId={request.id} />
            <AcceptRequestDialog requestId={request.id} onAccepted={handleAccepted} />
          </Box>
        </Box>
      </Dialog>

      {/* File preview dialog */}
      <Dialog
        open={activeFile !== null}
        onClose={() => setPreviewIndex(null)}
        fullWidth
        maxWidth="md"
        sx={{ '& .MuiDialog-paper': { borderRadius: '20px', overflow: 'hidden' } }}
      >
        <Box>
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Box
            component="span"
            sx={{
              fontFamily: 'var(--font-geist-sans)',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#14233D',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mr: 2,
            }}
          >
            {activeFile?.file_name}
          </Box>
          <IconButton
            onClick={() => setPreviewIndex(null)}
            size="small"
            sx={{ bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            minHeight: { xs: 240, sm: 420 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#1A1D23',
            px: 2,
            py: 2,
          }}
        >
          {activeFile?.signedUrl && isImageFile(activeFile.file_name) ? (
            <Box component="img" src={activeFile.signedUrl} alt={activeFile.file_name} sx={{ maxWidth: '100%', maxHeight: { xs: '60vh', sm: 520 }, objectFit: 'contain', borderRadius: '8px' }} />
          ) : activeFile?.file_path && isPdfFile(activeFile.file_name) ? (
            <Box
              component="iframe"
              src={`/api/file-proxy?path=${encodeURIComponent(activeFile.file_path)}`}
              title={activeFile.file_name}
              sx={{ width: '100%', height: { xs: '60vh', sm: 520 }, border: 0, bgcolor: 'white', borderRadius: '8px' }}
            />
          ) : (
            <Box component="span" sx={{ fontFamily: 'var(--font-geist-sans)', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
              Preview unavailable
            </Box>
          )}
        </Box>

        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Button
            onClick={() => setPreviewIndex(null)}
            sx={{
              fontFamily: 'var(--font-geist-sans)',
              fontWeight: 600,
              fontSize: '0.82rem',
              textTransform: 'none',
              color: '#566170',
              borderRadius: '8px',
            }}
          >
            ← Back to details
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { label: '← Prev', disabled: previewIndex === null || previewIndex <= 0, onClick: () => setPreviewIndex((i) => (i === null ? null : i - 1)) },
              { label: 'Next →', disabled: previewIndex === null || previewIndex >= files.length - 1, onClick: () => setPreviewIndex((i) => (i === null ? null : i + 1)) },
            ].map(({ label, disabled, onClick }) => (
              <Button
                key={label}
                disabled={disabled}
                onClick={onClick}
                sx={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  color: '#14233D',
                  bgcolor: 'transparent',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  '&:disabled': { opacity: 0.4 },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        </Box>
        </Box>
      </Dialog>
    </>
  )
}

