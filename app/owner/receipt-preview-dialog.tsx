'use client'

import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import type { AcceptState } from './actions'

type Receipt = NonNullable<AcceptState['receipt']>

export default function ReceiptPreviewDialog({
  receipt,
  onClose,
  isClosing = false,
}: {
  receipt: Receipt | null
  onClose: () => void
  isClosing?: boolean
}) {
  if (!receipt) return null

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm 200mm;
            margin: 0;
          }
          
          body * {
            visibility: hidden;
          }
          
          .cashier-receipt,
          .cashier-receipt * {
            visibility: visible;
          }
          
          .cashier-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            margin: 0;
            padding: 10mm;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
      
      <Dialog 
        open 
        fullWidth 
        maxWidth="sm" 
        onClose={onClose}
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
              Receipt preview
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
              Payment Receipt
            </Typography>
          </Box>
          <IconButton 
            aria-label="Close receipt" 
            onClick={onClose}
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
            bgcolor: '#F8F9FA', 
            p: { xs: 2, sm: 3 }, 
            display: 'flex', 
            justifyContent: 'center',
            borderRadius: '14px',
          }}>
            <Box 
              className="cashier-receipt" 
              sx={{ 
                bgcolor: 'white', 
                color: '#14233D', 
                width: '100%', 
                maxWidth: 380, 
                p: 3, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Typography 
                align="center" 
                sx={{ 
                  fontWeight: 900, 
                  letterSpacing: '0.12em',
                  fontFamily: 'var(--font-geist-sans)',
                  fontSize: '1.3rem',
                  color: '#14233D',
                }}
              >
                PRINTARA
              </Typography>
              <Typography 
                align="center" 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mb: 2.5,
                  fontFamily: 'var(--font-geist-sans)',
                  fontSize: '0.75rem',
                  color: '#566170',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                PAYMENT RECEIPT
              </Typography>
              <Box sx={{ 
                borderTop: '2px solid rgba(0,0,0,0.1)', 
                borderBottom: '2px solid rgba(0,0,0,0.1)', 
                py: 2,
                mb: 2.5,
              }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography 
                    sx={{ 
                      fontFamily: 'var(--font-geist-sans)',
                      fontSize: '0.8rem',
                      color: '#566170',
                      fontWeight: 600,
                      mb: 0.25,
                    }}
                  >
                    Order
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontFamily: 'var(--font-geist-sans)',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#14233D',
                    }}
                  >
                    {receipt.orderCode}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography 
                    sx={{ 
                      fontFamily: 'var(--font-geist-sans)',
                      fontSize: '0.8rem',
                      color: '#566170',
                      fontWeight: 600,
                      mb: 0.25,
                    }}
                  >
                    Price
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontFamily: 'var(--font-geist-sans)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#14233D',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    ₱{receipt.price.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography 
                    sx={{ 
                      fontFamily: 'var(--font-geist-sans)',
                      fontSize: '0.8rem',
                      color: '#566170',
                      fontWeight: 600,
                      mb: 0.25,
                    }}
                  >
                    Received
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontFamily: 'var(--font-geist-sans)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#14233D',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    ₱{receipt.amountReceived.toFixed(2)}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    bgcolor: '#FFEB99', 
                    p: 1.5, 
                    borderRadius: '8px',
                    mt: 2,
                  }}
                >
                  <Typography 
                    sx={{ 
                      fontFamily: 'var(--font-geist-sans)',
                      fontSize: '0.8rem',
                      color: '#14233D',
                      fontWeight: 700,
                      mb: 0.25,
                    }}
                  >
                    Change
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontFamily: 'var(--font-geist-sans)',
                      fontSize: '1.3rem',
                      fontWeight: 900,
                      color: '#14233D',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    ₱{receipt.change.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <Typography 
                align="center" 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  fontFamily: 'var(--font-geist-sans)',
                  fontSize: '0.75rem',
                  color: '#566170',
                  fontStyle: 'italic',
                }}
              >
                Thank you for your order.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
          <Button 
            onClick={() => window.print()} 
            variant="outlined"
            startIcon={<PrintRoundedIcon />}
            sx={{
              fontFamily: 'var(--font-geist-sans)',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: '8px',
              borderColor: 'rgba(0,0,0,0.2)',
              color: '#14233D',
              '&:hover': { 
                borderColor: '#14233D',
                bgcolor: 'rgba(20,35,61,0.04)',
              },
            }}
          >
            Print Receipt
          </Button>
          <Button 
            onClick={onClose}
            disabled={isClosing}
            variant="contained"
            startIcon={isClosing ? <CircularProgress size={14} sx={{ color: 'rgba(255,255,255,0.7)' }} /> : undefined}
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
              '&.Mui-disabled': {
                bgcolor: '#2563EB',
                color: 'rgba(255,255,255,0.8)',
              },
            }}
          >
            {isClosing ? 'Updating...' : 'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
