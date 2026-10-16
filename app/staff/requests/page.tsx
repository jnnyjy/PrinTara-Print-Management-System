import { createAdminClient } from '@/lib/supabase/admin'
import AcceptRequestDialog from '../accept-request-dialog'
import RejectRequestButton from '../reject-request-button'
import AutoRefresh from './auto-refresher'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Link as MuiLink,
} from '@mui/material'

export const dynamic = 'force-dynamic'

export default async function RequestsPage() {
  const supabase = createAdminClient()

  // Fetch pending requests
  const { data: requests, error: requestsError } = await supabase
    .from('job_requests')
    .select('*')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })

  // Fetch all files for those requests
  const requestIds = requests?.map((r) => r.id) ?? []
  const { data: files } = await supabase
    .from('job_request_files')
    .select('*')
    .in('job_request_id', requestIds.length > 0 ? requestIds : ['00000000-0000-0000-0000-000000000000'])

  // Generate signed URLs for every file (valid for 1 hour)
  const filesWithUrls = await Promise.all(
    (files ?? []).map(async (file) => {
      const { data: signedData } = await supabase.storage
        .from('job-files')
        .createSignedUrl(file.file_path, 3600)

      return { ...file, signedUrl: signedData?.signedUrl }
    })
  )

  return (
    <Container sx={{ py: 6 }}>
      <AutoRefresh intervalMs={60000} />
      <Typography variant="h4" sx={{ mb: 4 }}>Request Queue</Typography>

      {requestsError && (
        <Typography color="error">Error loading requests: {requestsError.message}</Typography>
      )}

      {requests && requests.length === 0 && (
        <Typography color="text.secondary">No pending requests right now.</Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {requests?.map((request) => {
          const requestFiles = filesWithUrls.filter((f) => f.job_request_id === request.id)

          return (
            <Card key={request.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">Print request</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.order_code}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                    <Chip label="IN QUEUE" color="warning" size="small" />
                    <RejectRequestButton requestId={request.id} />
                    <AcceptRequestDialog requestId={request.id} />
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Quantity:</strong> {request.quantity}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Paper:</strong> {request.paper_size} • <strong>Color:</strong>{' '}
                    {request.color_mode === 'color' ? 'Full Color' : 'Black & White'}
                  </Typography>
                  {request.notes && (
                    <Typography variant="body2">
                      <strong>Notes:</strong> {request.notes}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Files:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
                    {requestFiles.map((file) => (
                      <MuiLink
                        key={file.id}
                        href={file.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.file_name}
                      </MuiLink>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Container>
  )
}