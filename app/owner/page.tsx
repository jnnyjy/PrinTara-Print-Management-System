import { createAdminClient } from '@/lib/supabase/admin'
import { Box } from '@mui/material'
import KanbanBoard from './kanban-board'

export const dynamic = 'force-dynamic'

export default async function AdminBoardPage() {
  const supabase = createAdminClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: true })

  const { data: requests } = await supabase
    .from('job_requests')
    .select('*')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })

  const { data: acceptedRequests } = await supabase
    .from('job_requests')
    .select('id, resulting_job_id')
    .not('resulting_job_id', 'is', null)

  const jobRequestIds = (acceptedRequests ?? []).map((request) => request.id)
  const { data: jobFiles } = await supabase
    .from('job_request_files')
    .select('id, job_request_id, file_name, file_path')
    .in('job_request_id', jobRequestIds.length > 0 ? jobRequestIds : ['00000000-0000-0000-0000-000000000000'])

  const acceptedJobFiles = await Promise.all((jobFiles ?? []).map(async (file) => {
    const { data } = await supabase.storage.from('job-files').createSignedUrl(file.file_path, 3600)
    const request = acceptedRequests?.find((item) => item.id === file.job_request_id)
    return {
      id: file.id,
      job_id: request?.resulting_job_id ?? '',
      file_name: file.file_name,
      file_path: file.file_path,
      signedUrl: data?.signedUrl ?? null,
    }
  }))

  const requestIds = (requests ?? []).map((request) => request.id)
  const { data: requestFiles } = await supabase
    .from('job_request_files')
    .select('id, job_request_id, file_name, file_path')
    .in('job_request_id', requestIds.length > 0 ? requestIds : ['00000000-0000-0000-0000-000000000000'])

  const filesWithUrls = await Promise.all((requestFiles ?? []).map(async (file) => {
    const { data } = await supabase.storage.from('job-files').createSignedUrl(file.file_path, 3600)
    return { id: file.id, job_request_id: file.job_request_id, file_name: file.file_name, file_path: file.file_path, signedUrl: data?.signedUrl ?? null }
  }))

  const requestsWithFiles = (requests ?? []).map((request) => ({
    ...request,
    files: filesWithUrls.filter((file) => file.job_request_id === request.id),
  }))

  const jobsWithFiles = (jobs ?? []).map((job) => ({
    ...job,
    files: acceptedJobFiles.filter((file) => file.job_id === job.id),
  }))

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 2, md: 3 },
        pt: 1.5,
        pb: 3,
        maxWidth: 'lg',
        mx: 'auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <KanbanBoard initialJobs={jobsWithFiles} initialRequests={requestsWithFiles} />
      </Box>
    </Box>
  )
}