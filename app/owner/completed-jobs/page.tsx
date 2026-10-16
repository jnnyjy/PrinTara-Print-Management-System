import { Alert, Box } from '@mui/material'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoleFromEmail } from '@/lib/auth'
import CompletedJobsList from './completed-jobs-list'
import type { BoardJob } from '../job-details-dialog'

export default async function CompletedJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = getRoleFromEmail(user.email)

  // Only owners can access completed jobs
  if (role !== 'owner') {
    redirect('/owner')
  }

  // Fetch all completed jobs (including archived) that have a paid payment.
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, order_code, status, quantity, paper_size, color_mode, price, notes, completed_at')
    .eq('status', 'COMPLETED')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  if (error || !jobs) {
    return (
      <Box sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
        <Alert severity="error">
          Could not load completed jobs. Make sure the database migrations have been applied.
        </Alert>
      </Box>
    )
  }

  // Fetch accepted job_requests so we can look up which files belong to each job.
  const { data: acceptedRequests } = await supabase
    .from('job_requests')
    .select('id, resulting_job_id')
    .not('resulting_job_id', 'is', null)

  const jobRequestIds = (acceptedRequests ?? []).map((r) => r.id)

  const { data: jobFiles } = await supabase
    .from('job_request_files')
    .select('id, job_request_id, file_name, file_path')
    .in(
      'job_request_id',
      jobRequestIds.length > 0 ? jobRequestIds : ['00000000-0000-0000-0000-000000000000']
    )

  // Generate signed URLs for every file.
  const filesWithUrls = await Promise.all(
    (jobFiles ?? []).map(async (file) => {
      const { data } = await supabase.storage
        .from('job-files')
        .createSignedUrl(file.file_path, 3600)
      const request = (acceptedRequests ?? []).find((r) => r.id === file.job_request_id)
      return {
        id: file.id,
        job_id: request?.resulting_job_id ?? '',
        file_name: file.file_name,
        file_path: file.file_path,
        signedUrl: data?.signedUrl ?? null,
      }
    })
  )

  // Fetch paid payment amounts for each job.
  const jobIds = jobs.map((j) => j.id)
  const { data: payments } = await supabase
    .from('payments')
    .select('job_id, amount')
    .eq('status', 'PAID')
    .in('job_id', jobIds.length > 0 ? jobIds : ['00000000-0000-0000-0000-000000000000'])

  const amountByJobId = Object.fromEntries(
    (payments ?? []).map((p) => [p.job_id, p.amount])
  )

  // Only keep jobs that have a paid payment.
  const paidJobs = jobs
    .filter((j) => amountByJobId[j.id] != null)
    .map((j) => ({
      ...(j as BoardJob),
      completed_at: j.completed_at as string,
      amount: amountByJobId[j.id] as number,
      files: filesWithUrls.filter((f) => f.job_id === j.id),
    }))

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        maxWidth: 'lg',
        mx: 'auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <CompletedJobsList jobs={paidJobs} />
    </Box>
  )
}
