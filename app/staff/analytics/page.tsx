import { Alert, Box } from '@mui/material'
import TodayIcon from '@mui/icons-material/Today'
import DateRangeIcon from '@mui/icons-material/DateRange'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PaidIcon from '@mui/icons-material/Paid'
import PeriodSelect from './period-select'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoleFromEmail } from '@/lib/auth'

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = getRoleFromEmail(user.email)

  // Only owners can access analytics
  if (role !== 'owner') {
    redirect('/staff')
  }

  type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

  type AnalyticsData = {
    period: Period
    timezone: string
    summary: {
      today: number
      week: number
      month: number
      year: number
      total: number
      completed_jobs: number
    }
    series: { label: string; earnings: number }[]
  }

  const PERIODS: { value: Period; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ]

  function isPeriod(value: string | undefined): value is Period {
    return PERIODS.some((period) => period.value === value)
  }

  function money(value: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0)
  }

  function number(value: unknown) {
    return Number(value ?? 0)
  }

  const params = await searchParams
  const period = isPeriod(params.period) ? params.period : 'daily'
  const { data, error } = await supabase.rpc('get_print_shop_analytics', { p_period: period })
  const analytics = data as AnalyticsData | null

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 2, md: 3 },
        pt: { xs: 2, md: 2 },
        pb: { xs: 2, md: 2 },
        maxWidth: 'lg',
        mx: 'auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {error || !analytics ? (
        <Alert severity="error">Analytics could not be loaded. Run `supabase-analytics-migration.sql` in Supabase SQL Editor first.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 1.5 }}>
          {/* Top Row: 5 Summary Cards */}
          <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, mb: 0, overflowX: 'auto', pb: 0, flexShrink: 0 }}>
            {[
              { label: 'Today', value: money(number(analytics.summary.today)), bgColor: '#E3F2FD', textColor: '#1565C0', icon: TodayIcon },
              { label: 'This week', value: money(number(analytics.summary.week)), bgColor: '#E8F5E9', textColor: '#2E7D32', icon: DateRangeIcon },
              { label: 'This month', value: money(number(analytics.summary.month)), bgColor: '#F3E5F5', textColor: '#6A1B9A', icon: CalendarMonthIcon },
              { label: 'This year', value: money(number(analytics.summary.year)), bgColor: '#FFF3E0', textColor: '#E65100', icon: CalendarTodayIcon },
              { label: 'Total Earnings', value: money(number(analytics.summary.total)), bgColor: '#E0F7FA', textColor: '#00838F', icon: PaidIcon },
            ].map(({ label, value, bgColor, textColor, icon: Icon }, index) => (
              <Box
                key={label}
                sx={{
                  flex: '1 1 0',
                  minWidth: { xs: 120, md: 'auto' },
                  bgcolor: bgColor,
                  borderRadius: '16px',
                  p: { xs: 1.25, md: 1.5 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontFamily: 'var(--font-geist-sans)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: textColor,
                    letterSpacing: '0.01em',
                  }}
                >
                  {label}
                </Box>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: textColor,
                    border: '2px solid rgba(255,255,255,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(20,35,61,0.12)',
                  }}
                >
                  <Icon aria-label={label} sx={{ fontSize: 16, color: '#FFFFFF' }} />
                </Box>
                <Box
                  component="p"
                  sx={{
                    m: 0,
                    fontFamily: 'var(--font-geist-sans)',
                    fontSize: { xs: '1.1rem', md: '1.2rem' },
                    fontWeight: 700,
                    color: textColor,
                    letterSpacing: '-0.01em',
                    lineHeight: 1,
                    opacity: 0,
                    animation: 'summaryValueReveal 350ms ease-out forwards',
                    animationDelay: `${index * 70 + 120}ms`,
                    '@keyframes summaryValueReveal': {
                      from: { opacity: 0, transform: 'translateY(5px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  {value}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Main Chart Card */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '24px',
              p: { xs: 2.5, md: 3 },
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 6px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              height: { xs: 'auto', md: '560px' },
              pb: 3,
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#00838F',
                    border: '2px solid rgba(255,255,255,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 3px 8px rgba(0,131,143,0.2)',
                  }}
                >
                  <PaidIcon aria-label="Total Earnings" sx={{ fontSize: 22, color: '#FFFFFF' }} />
                </Box>
                <Box>
                  <Box
                    component="h2"
                    sx={{
                      m: 0,
                      fontFamily: 'var(--font-geist-sans)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#1A365D',
                      mb: 0.25,
                    }}
                  >
                    Total Earnings
                  </Box>
                  <Box
                    component="p"
                    sx={{
                      m: 0,
                      fontFamily: 'var(--font-geist-sans)',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: '#4A6080',
                    }}
                  >
                    Your earnings overview for the selected period.
                  </Box>
                </Box>
              </Box>

              {/* Period Dropdown — single select */}
              <PeriodSelect period={period} basePath="/staff/analytics" />
            </Box>

            {/* Chart Container - pushed to bottom */}
            <Box
              sx={{
                mt: 'auto',
                height: '380px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                position: 'relative',
              }}
            >
              {/* Bars Container */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-around',
                  height: '320px',
                  gap: 1.5,
                }}
              >
                {analytics.series.map((point, index) => {
                  const amount = number(point.earnings)
                  const max = Math.max(...analytics.series.map((item) => number(item.earnings)), 1)
                  const chartHeight = 320 // Fixed chart height for bars
                  const barHeight = max === 0 ? 0 : Math.max((amount / max) * chartHeight, amount > 0 ? 24 : 0)
                  
                  // Pastel colors for each bar
                  const colors = ['#90CAF9', '#FFF59D', '#81C784', '#CE93D8', '#F48FB1', '#80DEEA', '#EF9A9A']
                  const barColor = colors[index % colors.length]
                  
                  return (
                    <Box
                      key={point.label}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        maxWidth: '66px',
                      }}
                    >
                      {/* Value Label - positioned above bar or at baseline if no bar */}
                      <Box
                        component="span"
                        sx={{
                          fontFamily: 'var(--font-geist-sans)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#1A365D',
                          mb: '6px',
                          opacity: 0,
                          animation: 'chartValueReveal 350ms ease-out forwards',
                          animationDelay: `${index * 55 + 280}ms`,
                          '@keyframes chartValueReveal': {
                            from: { opacity: 0, transform: 'translateY(5px)' },
                            to: { opacity: 1, transform: 'translateY(0)' },
                          },
                        }}
                      >
                        {money(amount)}
                      </Box>
                      
                      {/* Bar - only show if height > 0 */}
                      {barHeight > 0 && (
                        <Box
                          sx={{
                            width: '100%',
                            height: `${barHeight}px`,
                            bgcolor: barColor,
                            borderRadius: '12px 12px 0 0',
                            transformOrigin: 'bottom',
                            animation: 'chartBarRise 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
                            animationDelay: `${index * 55}ms`,
                            '@keyframes chartBarRise': {
                              from: { transform: 'scaleY(0)' },
                              to: { transform: 'scaleY(1)' },
                            },
                            transition: 'filter 0.2s ease, transform 0.2s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              filter: 'brightness(1.1)',
                              transform: 'translateY(-4px)',
                            },
                          }}
                          title={`${point.label}: ${money(amount)}`}
                        />
                      )}
                    </Box>
                  )
                })}
              </Box>
              
              {/* Baseline */}
              <Box
                sx={{
                  height: '1px',
                  bgcolor: 'rgba(0,0,0,0.1)',
                  mt: 0,
                }}
              />
              
              {/* Date Labels Below Baseline */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  gap: 1.5,
                  pt: '14px',
                }}
              >
                {analytics.series.map((point) => (
                  <Box
                    key={point.label}
                    sx={{
                      flex: 1,
                      maxWidth: '66px',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontFamily: 'var(--font-geist-sans)',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: '#4A6080',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {point.label}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
