import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

// Non-CSP headers are safe in all environments
const baseHeaders = [
  // Prevent browsers from MIME-sniffing the response content-type
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Limit referrer info sent to external sites
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Restrict access to sensitive browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // Force HTTPS for 1 year (only takes effect when served over HTTPS)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
]

// CSP is production-only.
// In development: React needs unsafe-eval, and the Kiro preview panel embeds
// the app in an iframe from a different origin — both of which a strict CSP
// would block. CSP is a deployment-time hardening measure, not a dev tool.
const productionCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // data: and blob: needed for canvas-generated order code cards
  "img-src 'self' data: blob: https://*.supabase.co",
  // Supabase REST API, Auth, Storage, and Realtime WebSocket
  // Using *.supabase.co covers all subdomains (db, storage, realtime, auth)
  // regardless of project ref, and is resilient to build-time env var timing.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  // Supabase storage for uploaded files and the Pintara animation video
  "media-src 'self' https://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = isDev ? baseHeaders : [
  ...baseHeaders,
  {
    key: 'Content-Security-Policy',
    value: productionCSP,
  },
]

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
