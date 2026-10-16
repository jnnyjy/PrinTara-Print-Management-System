'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Loader from './loading-indicator'

type LoadingLinkProps = {
  href: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  'aria-label'?: string
}

export default function LoadingLink({ href, className, style, children, 'aria-label': ariaLabel }: LoadingLinkProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    setIsNavigating(true)
    window.setTimeout(() => router.push(href), 150)
  }

  return (
    <>
      {isNavigating && <Loader fullScreen label="Opening page" />}
      <Link href={href} className={className} style={style} aria-label={ariaLabel} onClick={handleClick}>
        {children}
      </Link>
    </>
  )
}