'use client'

import { useRouter } from 'next/navigation'

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export default function PeriodSelect({ period, basePath }: { period: Period; basePath: string }) {
  const router = useRouter()

  return (
    <select
      value={period}
      onChange={(e) => router.push(`${basePath}?period=${e.target.value}`)}
      style={{
        fontFamily: 'inherit',
        fontWeight: 700,
        fontSize: '0.875rem',
        color: '#1E2A4A',
        backgroundColor: '#FFFFFF',
        border: '1.5px solid rgba(0,0,0,0.1)',
        borderRadius: '12px',
        padding: '6px 36px 6px 14px',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235B6B8C' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {PERIODS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
