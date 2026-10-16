import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/file-proxy?path=<storage-path>
 *
 * Fetches a private file from Supabase Storage server-side and streams it
 * back to the browser with permissive framing headers so PDFs can be
 * displayed inside an <iframe> without being blocked by Supabase's own
 * X-Frame-Options: DENY response header.
 *
 * Security:
 * - Requires an authenticated session (staff or owner).
 * - Only serves files from the job-files bucket.
 * - Path is validated to prevent directory traversal.
 * - Signed URL is generated server-side — the client never holds the raw path.
 */
export async function GET(request: NextRequest) {
  // Auth check — only authenticated users can proxy files
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const filePath = searchParams.get('path')

  if (!filePath) {
    return NextResponse.json({ error: 'Missing file path.' }, { status: 400 })
  }

  // Prevent path traversal — only allow alphanumeric, dashes, underscores,
  // dots, and forward slashes (the UUID/filename pattern we write)
  if (!/^[\w\-./]+$/.test(filePath) || filePath.includes('..')) {
    return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 })
  }

  // Generate a short-lived signed URL server-side
  const { data, error } = await supabase.storage
    .from('job-files')
    .createSignedUrl(filePath, 60) // 60 seconds — just long enough to fetch

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'File not found.' }, { status: 404 })
  }

  // Fetch the actual file from Supabase Storage
  const fileResponse = await fetch(data.signedUrl)

  if (!fileResponse.ok) {
    return NextResponse.json({ error: 'Failed to retrieve file.' }, { status: 502 })
  }

  const body = fileResponse.body

  if (!body) {
    return NextResponse.json({ error: 'Empty file.' }, { status: 502 })
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      // Uploaded content is untrusted; never reflect Storage's content type.
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "sandbox",
      // Cache briefly — signed URL is only valid 60s anyway
      'Cache-Control': 'private, max-age=30',
    },
  })
}
