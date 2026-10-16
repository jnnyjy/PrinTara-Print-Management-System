'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

type LoaderProps = {
  fullScreen?: boolean
  size?: number
  label?: string
}

export default function Loader({ fullScreen = false, size = 96, label = 'Loading' }: LoaderProps) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  const loader = (
    <div
      className={fullScreen ? 'loading-screen' : 'loading-inline'}
      data-loading-overlay={fullScreen ? 'true' : undefined}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <svg className="pl" width={size} height={size} viewBox="0 0 240 240" aria-hidden="true">
        <circle className="pl__ring pl__ring--a" cx="120" cy="120" r="105" fill="none" strokeWidth="20" strokeDasharray="0 660" strokeDashoffset="-330" strokeLinecap="round" />
        <circle className="pl__ring pl__ring--b" cx="120" cy="120" r="35" fill="none" strokeWidth="20" strokeDasharray="0 220" strokeDashoffset="-110" strokeLinecap="round" />
        <circle className="pl__ring pl__ring--c" cx="85" cy="120" r="70" fill="none" strokeWidth="20" strokeDasharray="0 440" strokeLinecap="round" />
        <circle className="pl__ring pl__ring--d" cx="155" cy="120" r="70" fill="none" strokeWidth="20" strokeDasharray="0 440" strokeLinecap="round" />
      </svg>
    </div>
  )

  if (!fullScreen) return loader
  if (!mounted) return null
  return createPortal(loader, document.body)
}