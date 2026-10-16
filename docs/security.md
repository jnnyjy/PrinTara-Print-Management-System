# Security notes

## Implemented controls

- Protected `/staff` and `/owner` routes use authenticated server-side Supabase sessions.
- Sensitive server actions verify the current user and permitted role.
- The service/secret key is referenced only by server-side modules.
- Public writes are routed through a validated server action rather than unrestricted direct table inserts.
- Uploaded files are checked for size, extension, declared MIME type, and magic bytes.
- The `job-files` Storage bucket is intended to remain private.
- File access uses short-lived signed URLs and a server-side proxy.
- Preview responses use `nosniff`, a fixed content type, sandbox CSP, and iframe sandboxing.
- Production security headers include CSP, HSTS, Referrer-Policy, Permissions-Policy, and `X-Content-Type-Options`.
- SQL migrations revoke broad anonymous writes and restrict privileged maintenance operations.

## Threat boundaries

The browser is treated as untrusted. Client-side role visibility and form validation improve UX but are not authorization boundaries. Server actions, route handlers, Supabase policies, and database functions must enforce access.

## Remaining risks

- The current role helper derives roles from email prefixes. Use database-backed roles or trusted JWT claims for production.
- Rate limiting, malware scanning, and live penetration testing require deployment-specific infrastructure.
- Supabase dashboard settings, deployed environment variables, and the actual production RLS state must be verified separately.
- Do not include `.env`, customer files, production exports, or real credentials in the repository.
