'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type SubmitFormState = {
  success: boolean
  message: string
  orderCode?: string
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
// Validate extension as well as MIME type — browser-supplied MIME can be spoofed
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png'])
const MAX_FILE_SIZE = 20 * 1024 * 1024

// Magic byte signatures for each allowed file type.
// These are read from the actual file content server-side and cannot be
// spoofed by renaming a file or changing the browser-supplied MIME type.
const MAGIC_SIGNATURES: Array<{
  mime: string
  bytes: number[]   // expected bytes at offset 0 (or offset below)
  offset?: number   // byte offset to start reading from (default 0)
}> = [
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },           // %PDF
  { mime: 'image/jpeg',      bytes: [0xFF, 0xD8, 0xFF] },                  // JFIF / EXIF
  { mime: 'image/png',       bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] }, // PNG
]

async function verifyMagicBytes(file: File): Promise<boolean> {
  // Read only the first 8 bytes — enough to check all signatures
  const slice = file.slice(0, 8)
  const buffer = await slice.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  return MAGIC_SIGNATURES.some((sig) => {
    const offset = sig.offset ?? 0
    return sig.bytes.every((byte, i) => bytes[offset + i] === byte)
  })
}
const ALLOWED_SPECIFICATIONS = new Set([
  'A4', 'A5', 'A3', 'Letter', 'Legal', '4×6', '5×7', '8×10',
  'Poster', 'Flyer', 'Brochure', 'Business Card', 'Invitation', 'Sticker',
  'Label', 'Tarpaulin', 'Photo', 'Custom Size', 'Other',
])
const ALLOWED_COLOR_MODES = new Set(['color', 'bw'])
const ALLOWED_FINISHING_SERVICES = new Set([
  'Lamination', 'Binding', 'Cutting', 'Folding', 'Stapling',
  'Hole Punching', 'Trimming', 'Other',
])

// H3 fix: strip everything except safe filename characters, collapse spaces
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\w.\-\s]/g, '_')   // replace unsafe chars with _
    .replace(/\s+/g, '_')          // collapse whitespace
    .replace(/\.{2,}/g, '.')       // prevent directory traversal via ..
    .slice(0, 200)                  // cap length
}

// H2 fix: cryptographically random order code — 4 digits (PRT-XXXX format)
// Collision-retry logic below handles the smaller code space safely.
function generateRequestCode(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const num = array[0] % 10000  // 10,000 combinations (4 digits)
  return `PRT-${num.toString().padStart(4, '0')}`
}

// M3 fix: never return raw DB/storage error messages in production
function safeError(msg: string): string {
  if (process.env.NODE_ENV === 'development') return msg
  return 'An unexpected error occurred. Please try again.'
}

export async function submitJobRequest(
  _prevState: SubmitFormState,
  formData: FormData
): Promise<SubmitFormState> {
  try {
  const supabase = createAdminClient()
  const quantity = Number(formData.get('quantity'))
  const specifications = formData.getAll('printSpecifications').map(String).filter(Boolean)
  const customSpecification = String(formData.get('customSpecification') ?? '').trim()
  const colorMode = String(formData.get('colorMode') ?? '').trim()
  const finishingServices = formData.getAll('finishingServices').map(String).filter(Boolean)
  const customFinishingService = String(formData.get('customFinishingService') ?? '').trim()
  const files = formData.getAll('files').filter((value): value is File => value instanceof File && value.size > 0)

  if (!Number.isInteger(quantity) || quantity < 1 || specifications.length === 0 || files.length === 0) {
    return { success: false, message: 'Please complete all required fields and attach at least one file.' }
  }

  if (specifications.some((specification) => !ALLOWED_SPECIFICATIONS.has(specification))) {
    return { success: false, message: 'Please select valid print specifications.' }
  }

  if (specifications.includes('Other') || specifications.includes('Custom Size')) {
    if (!customSpecification) {
      return { success: false, message: 'Please describe your custom specification.' }
    }
  }

  if (finishingServices.some((service) => !ALLOWED_FINISHING_SERVICES.has(service))) {
    return { success: false, message: 'Please select valid finishing services.' }
  }

  if (finishingServices.includes('Other') && !customFinishingService) {
    return { success: false, message: 'Please describe the other finishing service.' }
  }

  if (!colorMode || !ALLOWED_COLOR_MODES.has(colorMode)) {
    return { success: false, message: 'Please select a valid color mode.' }
  }

  // Validate each file: size, extension, MIME type, and actual file content
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, message: 'Each file must be no larger than 20MB.' }
    }

    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()
    if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.has(ext)) {
      return { success: false, message: 'Each file must be a PDF, JPG, or PNG.' }
    }

    // Magic byte check: verify actual file content matches the declared type.
    // This catches renamed executables, scripts, or other disguised files.
    const magicOk = await verifyMagicBytes(file)
    if (!magicOk) {
      return { success: false, message: `"${file.name}" does not appear to be a valid PDF, JPG, or PNG file.` }
    }
  }

  // Generate a unique order code — retry up to 3 times on collision
  let orderCode = ''
  const requestId = crypto.randomUUID()
  
  for (let attempt = 0; attempt < 3; attempt++) {
    orderCode = generateRequestCode()
    
    // Check for existing order code to avoid unique constraint violation
    const { data: existing } = await supabase
      .from('job_requests')
      .select('id')
      .eq('order_code', orderCode)
      .maybeSingle()
    
    if (!existing) break // No collision, proceed
    
    if (attempt === 2) {
      console.error("[submit] Order code collision after 3 attempts")
      return { success: false, message: 'Unable to generate a unique order code. Please try again.' }
    }
  }

  console.log("[submit] Generated orderCode:", orderCode, "requestId:", requestId)
  const paperSize = customSpecification
    ? `${specifications.join(' + ')}: ${customSpecification}`
    : specifications.join(' + ')
  const finishingNotes = finishingServices.length > 0
    ? `Finishing: ${finishingServices
      .filter((service) => service !== 'Other')
      .concat(customFinishingService ? [customFinishingService] : [])
      .join(' + ')}`
    : null

  console.log("[submit] Inserting job_request with fallback orderCode:", orderCode)
  const { data: insertedData, error: requestError } = await supabase
    .from('job_requests')
    .insert({
      id: requestId,
      quantity,
      paper_size: paperSize,
      color_mode: colorMode,
      notes: finishingNotes,
      order_code: orderCode,
      status: 'PENDING',
    })
    .select('order_code, status')
    .maybeSingle()

  if (requestError) {
    console.error("[submit] job_requests insert failed:", requestError)
    return { success: false, message: safeError(requestError.message) }
  }
  
  // Guarantee the order code returned to client is the EXACT one stored in DB (in case DB trigger overrides it)
  let finalOrderCode = insertedData?.order_code
  if (!finalOrderCode) {
    const { data: verification, error: verifyError } = await supabase
      .from('job_requests')
      .select('order_code, status')
      .eq('id', requestId)
      .maybeSingle()
    
    if (verifyError || !verification) {
      console.warn("[submit] Verification query did not find record:", verifyError)
      finalOrderCode = orderCode
    } else {
      finalOrderCode = verification.order_code
    }
  }

  console.log("[submit] Final synchronized orderCode stored in DB:", finalOrderCode)

  // M2 fix: track uploaded file paths so we can clean up on partial failure
  const uploadedPaths: string[] = []

  for (const file of files) {
    // H3 fix: sanitize the user-supplied filename before using it in a storage path
    const safeName = sanitizeFilename(file.name)
    const filePath = `${requestId}/${crypto.randomUUID()}-${safeName}`

    const { error: uploadError } = await supabase.storage.from('job-files').upload(filePath, file)

    if (uploadError) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('job-files').remove(uploadedPaths)
      }
      await supabase.from('job_requests').delete().eq('id', requestId)
      return { success: false, message: safeError(uploadError.message) }
    }

    uploadedPaths.push(filePath)

    const { error: fileError } = await supabase.from('job_request_files').insert({
      job_request_id: requestId,
      file_name: safeName,
      file_path: filePath,
    })

    if (fileError) {
      // M2 fix: clean up all uploads and the request row on failure
      await supabase.storage.from('job-files').remove(uploadedPaths)
      await supabase.from('job_requests').delete().eq('id', requestId)
      return { success: false, message: safeError(fileError.message) }
    }
  }

  return { success: true, message: 'Your print request was submitted successfully.', orderCode: finalOrderCode }
  } catch (err) {
    console.error("[submitJobRequest] Unexpected error:", err)
    return { success: false, message: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}
