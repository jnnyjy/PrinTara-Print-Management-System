'use client'

import { useActionState, useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormHelperText,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { submitJobRequest, type SubmitFormState } from './actions'
import Loader from '@/app/loading-indicator'

const initialState: SubmitFormState = {
  success: false,
  message: '',
}

export default function SubmitPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(submitJobRequest, initialState)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [printSpecifications, setPrintSpecifications] = useState<string[]>([])
  const [customSpecification, setCustomSpecification] = useState('')
  const [finishingServices, setFinishingServices] = useState<string[]>([])
  const [customFinishingService, setCustomFinishingService] = useState('')
  const [printSpecificationsOpen, setPrintSpecificationsOpen] = useState(false)
  const [finishingServicesOpen, setFinishingServicesOpen] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [isReturningHome, setIsReturningHome] = useState(false)
  const [colorMode, setColorMode] = useState('')

  const specificationOptions = [
    'A4', 'A5', 'A3', 'Letter', 'Legal', '4×6', '5×7', '8×10',
    'Poster', 'Flyer', 'Brochure', 'Business Card', 'Invitation', 'Sticker',
    'Label', 'Tarpaulin', 'Photo', 'Custom Size', 'Other',
  ]
  const finishingOptions = [
    'Lamination', 'Binding', 'Cutting', 'Folding', 'Stapling',
    'Hole Punching', 'Trimming', 'Other',
  ]

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? [])
    setSelectedFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function downloadOrderCodeImage() {
    if (!state.orderCode) return

    const canvas = document.createElement('canvas')
    canvas.width = 900
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Helper: rounded rectangle path (compatible with all browsers)
    function roundedRect(x: number, y: number, w: number, h: number, r: number) {
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.arcTo(x + w, y, x + w, y + r, r)
      ctx.lineTo(x + w, y + h - r)
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
      ctx.lineTo(x + r, y + h)
      ctx.arcTo(x, y + h, x, y + h - r, r)
      ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.closePath()
    }

    // Background — soft yellow
    ctx.fillStyle = '#FFF8D6'
    roundedRect(0, 0, canvas.width, canvas.height, 40)
    ctx.fill()

    // Dashed border
    ctx.strokeStyle = '#D4A017'
    ctx.lineWidth = 4
    ctx.setLineDash([18, 10])
    roundedRect(14, 14, canvas.width - 28, canvas.height - 28, 30)
    ctx.stroke()
    ctx.setLineDash([])

    // Label
    ctx.fillStyle = '#1E2B45'
    ctx.font = '600 32px "Segoe UI", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Your tracking number is:', canvas.width / 2, 150)

    // Order code — large bold
    ctx.fillStyle = '#1E2B45'
    ctx.font = '800 96px "Segoe UI", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(state.orderCode, canvas.width / 2, 290)

    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `${state.orderCode}-tracking-number.png`
    link.click()
  }

  if (state.success) {
    return (
      <Box
        sx={{
          bgcolor: '#FFEB99',
          borderRadius: { xs: '18px', md: '22px' },
          p: { xs: 4, md: 5 },
          width: '100%',
          maxWidth: 500,
          flexShrink: 0,
          boxShadow: '0 8px 40px rgba(255, 235, 153, 0.28), 0 2px 12px rgba(0,0,0,0.06)',
          mt: { md: 6 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'submitSuccessReveal 450ms ease-out both',
          '@keyframes submitSuccessReveal': {
            from: { opacity: 0, transform: 'translateY(12px) scale(0.98)' },
            to: { opacity: 1, transform: 'translateY(0) scale(1)' },
          },
        }}
      >
        {isReturningHome && <Loader fullScreen label="Returning home" />}
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <CheckCircleOutlinedIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 900, color: '#14233D', mb: 2, fontFamily: 'var(--font-geist-sans)' }}>
          Order Submitted!
        </Typography>

        <Typography sx={{ color: '#2a2a2a', fontSize: '1rem', mb: 4, fontFamily: 'var(--font-newsreader)', fontStyle: 'italic' }}>
          {state.message}
        </Typography>

        {state.orderCode && (
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.7)', p: 3, borderRadius: '16px', width: '100%', mb: 4, border: '1px dashed #B47A27' }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#14233D', fontWeight: 600 }}>
              Your tracking number is:
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: 'var(--font-geist-mono)', fontWeight: 800, color: '#14233D', letterSpacing: '0.05em' }}>
              {state.orderCode}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: '100%' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadRoundedIcon />}
            onClick={downloadOrderCodeImage}
            sx={{
              flex: 1,
              width: { xs: '100%', sm: 'auto' },
              bgcolor: '#1E90FF',
              color: '#fff',
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1873CC', boxShadow: 'none' },
            }}
          >
            Download
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setIsReturningHome(true)
              startTransition(() => router.push('/'))
            }}
            sx={{
              flex: 1,
              bgcolor: '#DC2626',
              color: '#fff',
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        bgcolor: '#FFEB99',
        borderRadius: { xs: '18px', md: '22px' },
        p: { xs: 3.5, md: 4 },
        width: '100%',
        maxWidth: 500,
        minHeight: 600,
        flexShrink: 0,
        boxShadow: '0 8px 40px rgba(255, 235, 153, 0.28), 0 2px 12px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.3s ease',
        mt: { md: 6 },
        display: 'flex',
        flexDirection: 'column',
        animation: 'submitFormReveal 450ms ease-out both',
        '@keyframes submitFormReveal': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          boxShadow: '0 12px 48px rgba(255, 235, 153, 0.38), 0 4px 16px rgba(0,0,0,0.08)',
        },
      }}
    >
      {isPending && <Loader fullScreen label="Submitting" />}
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 900,
          color: '#14233D',
          mb: 1,
          fontSize: { xs: '1.4rem', md: '1.6rem' },
          fontFamily: 'var(--font-geist-sans)',
          textAlign: 'center',
        }}
      >
        Submit a Print Job
      </Typography>

      <Typography
        sx={{
          color: '#2a2a2a',
          fontSize: '0.85rem',
          lineHeight: 1.5,
          mb: 3,
          textAlign: 'center',
        }}
      >
        Tell us what you need printed and attach your files. Custom sizes, materials, and printing requests are welcome. We&apos;ll review your request and confirm the available options and price.
      </Typography>

      {state.message && !state.success && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
          {state.message}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          setShowValidation(true)

          // Check if all required fields are filled
          if (printSpecifications.length === 0 || selectedFiles.length === 0) {
            return
          }

          const formData = new FormData(e.currentTarget)
          // Explicitly append controlled values not serialized by the native form
          if (colorMode) formData.set('colorMode', colorMode)
          selectedFiles.forEach((file) => formData.append('files', file))

          startTransition(() => {
            formAction(formData)
          })
        }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '& input, & .MuiSelect-select, & .MuiOutlinedInput-input': {
            outline: 'none !important',
          },
          '& input:focus, & .MuiSelect-select:focus, & .MuiOutlinedInput-input:focus': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
        }}
      >
        <Box>
          <InputLabel
            htmlFor="quantity"
            sx={{
              fontWeight: 700,
              color: '#14233D',
              mb: 1,
              fontSize: '0.85rem',
              lineHeight: 1,
              fontFamily: 'var(--font-geist-sans)',
            }}
          >
            Quantity (number of copies)*
          </InputLabel>
          <TextField
            id="quantity"
            name="quantity"
            type="number"
            defaultValue={1}
            required
            fullWidth
            size="medium"
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff',
                borderRadius: '10px',
                height: 44,
                '& fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
                '&:hover fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
                '&.Mui-focused fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
              },
            }}
          />
        </Box>

        <FormControl fullWidth required error={showValidation && printSpecifications.length === 0}>
          <InputLabel
            htmlFor="print-specifications"
            sx={{
              fontWeight: 700,
              color: showValidation && printSpecifications.length === 0 ? '#d32f2f' : '#14233D',
              mb: 1,
              fontSize: '0.85rem',
              lineHeight: 1,
              fontFamily: 'var(--font-geist-sans)',
              position: 'relative',
              transform: 'none',
            }}
          >
            Print Specifications
          </InputLabel>
          <Select
            id="print-specifications"
            multiple
            value={printSpecifications}
            open={printSpecificationsOpen}
            onOpen={() => setPrintSpecificationsOpen(true)}
            onClose={() => setPrintSpecificationsOpen(false)}
            onChange={(event) => {
              const selected = event.target.value as string[]
              setPrintSpecifications(selected.filter((option) => option !== '__done__'))
              if (selected.includes('__done__')) setPrintSpecificationsOpen(false)
            }}
            renderValue={(selected) => (selected as string[]).join(' + ')}
            displayEmpty
            sx={{
              bgcolor: '#fff',
              borderRadius: '10px',
              height: 44,
              '& fieldset': {
                border: showValidation && printSpecifications.length === 0
                  ? '2px solid #d32f2f'
                  : '1.5px solid rgba(0,0,0,0.08)'
              },
              '&:hover fieldset': {
                border: showValidation && printSpecifications.length === 0
                  ? '2px solid #d32f2f'
                  : '1.5px solid rgba(0,0,0,0.08)'
              },
              '&.Mui-focused fieldset': {
                border: showValidation && printSpecifications.length === 0
                  ? '2px solid #d32f2f'
                  : '1.5px solid rgba(0,0,0,0.08)'
              },
            }}
          >
            {specificationOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={printSpecifications.includes(option)} />
                {option}
              </MenuItem>
            ))}
            <MenuItem
              value="__done__"
              sx={{
                position: 'sticky',
                bottom: 0,
                zIndex: 1,
                justifyContent: 'center',
                gap: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
                fontWeight: 700,
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Done
            </MenuItem>
          </Select>
          {showValidation && printSpecifications.length === 0 && (
            <FormHelperText error>Please select at least one print specification</FormHelperText>
          )}
          {printSpecifications.map((specification) => (
            <input key={specification} type="hidden" name="printSpecifications" value={specification} />
          ))}
        </FormControl>

        {printSpecifications.includes('Other') || printSpecifications.includes('Custom Size') ? (
          <TextField
            label="Custom specification"
            value={customSpecification}
            onChange={(event) => setCustomSpecification(event.target.value)}
            placeholder="Example: 12 × 18 in, matte sticker paper"
            name="customSpecification"
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff',
                borderRadius: '10px',
                '& fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
                '&:hover fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
                '&.Mui-focused fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
              },
            }}
          />
        ) : null}

        <FormControl fullWidth required>
          <InputLabel
            htmlFor="colorMode"
            sx={{
              fontWeight: 700,
              color: '#14233D',
              mb: 1,
              fontSize: '0.85rem',
              lineHeight: 1,
              fontFamily: 'var(--font-geist-sans)',
              position: 'relative',
              transform: 'none',
            }}
          >
            Color / Print Mode
          </InputLabel>
          <Select
            id="colorMode"
            name="colorMode"
            defaultValue=""
            required
            sx={{
              bgcolor: '#fff',
              borderRadius: '10px',
              height: 44,
              '& fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
              '&:hover fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
              '&.Mui-focused fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
            }}
          >
            <MenuItem value="" disabled>Select a print mode</MenuItem>
            <MenuItem value="color">Full Color</MenuItem>
            <MenuItem value="bw">Black &amp; White</MenuItem>
          </Select>
          {colorMode && <input type="hidden" name="colorMode" value={colorMode} />}
        </FormControl>

        <FormControl fullWidth>
          <InputLabel
            htmlFor="finishing-services"
            sx={{
              fontWeight: 700,
              color: '#14233D',
              mb: 1,
              fontSize: '0.85rem',
              lineHeight: 1,
              fontFamily: 'var(--font-geist-sans)',
              position: 'relative',
              transform: 'none',
            }}
          >
            Finishing and Additional Services
          </InputLabel>
          <Select
            id="finishing-services"
            multiple
            value={finishingServices}
            open={finishingServicesOpen}
            onOpen={() => setFinishingServicesOpen(true)}
            onClose={() => setFinishingServicesOpen(false)}
            onChange={(event) => {
              const selected = event.target.value as string[]
              setFinishingServices(selected.filter((option) => option !== '__done__'))
              if (selected.includes('__done__')) setFinishingServicesOpen(false)
            }}
            renderValue={(selected) => (selected as string[]).join(' + ')}
            displayEmpty
            sx={{
              bgcolor: '#fff',
              borderRadius: '10px',
              height: 44,
              '& fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
              '&:hover fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
              '&.Mui-focused fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
            }}
          >
            {finishingOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={finishingServices.includes(option)} />
                {option}
              </MenuItem>
            ))}
            <MenuItem
              value="__done__"
              sx={{
                position: 'sticky',
                bottom: 0,
                zIndex: 1,
                justifyContent: 'center',
                gap: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
                fontWeight: 700,
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Done
            </MenuItem>
          </Select>
          {finishingServices.map((service) => (
            <input key={service} type="hidden" name="finishingServices" value={service} />
          ))}
        </FormControl>

        {finishingServices.includes('Other') ? (
          <TextField
            label="Other finishing service"
            name="customFinishingService"
            value={customFinishingService}
            onChange={(event) => setCustomFinishingService(event.target.value)}
            placeholder="Describe another finishing service"
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff',
                borderRadius: '10px',
                '& fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
                '&:hover fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
                '&.Mui-focused fieldset': { border: '1.5px solid rgba(0,0,0,0.08)' },
              },
            }}
          />
        ) : null}

        <Box>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              justifyContent: 'flex-start',
              height: 44,
              px: '14px',
              bgcolor: '#fff',
              borderRadius: '10px',
              border: showValidation && selectedFiles.length === 0
                ? '2px solid #d32f2f'
                : '1.5px solid rgba(0,0,0,0.08)',
              color: '#2a2a2a',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: '#fff',
                borderColor: 'rgba(0,0,0,0.15)',
              },
            }}
          >
            Attach Files (PDF, JPG, PNG — MAX 20 MB EACH)
            <input
              type="file"
              hidden
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </Button>
          {showValidation && selectedFiles.length === 0 && (
            <FormHelperText error sx={{ ml: 1.75 }}>Please attach at least one file</FormHelperText>
          )}
          {selectedFiles.length > 0 && (
            <List dense sx={{ bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2, mt: 1, p: 1 }}>
              {selectedFiles.map((file, index) => (
                <ListItem
                  key={`${file.name}-${index}`}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeFile(index)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(0)} KB`} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isPending}
            sx={{
              flex: 1,
              bgcolor: '#1E90FF',
              color: '#fff',
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1873CC', boxShadow: 'none' },
              '&:disabled': { bgcolor: '#93B4F5', color: '#fff' },
            }}
          >
            Submit Order
          </Button>

        </Box>
      </Box>
    </Box>
  )
}
