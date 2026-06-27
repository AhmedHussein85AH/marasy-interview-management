import React from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { Users, TrendingUp, TrendingDown, Clock, Download, Printer, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useTheme } from '../context/ThemeContext'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useTranslation } from 'react-i18next'

// ── colours ──────────────────────────────────────────────
const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6']

const BAR_PALETTE = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
  '#f97316', '#6366f1', '#84cc16', '#e11d48',
]

// ── custom tooltip ────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--tooltip-bg, white)', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      {label && <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--tooltip-text, #1e293b)' }}>{label}</div>}
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || p.fill, fontWeight: 600 }}>
          {p.name ? `${p.name}: ` : ''}{p.value}
        </div>
      ))}
    </div>
  )
}

// ── custom pie label ──────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.04) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ── export CSV ────────────────────────────────────────────
const exportCSV = (rows: string[][], filename: string) => {
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

// ─────────────────────────────────────────────────────────
const AnalyticsPage: React.FC = () => {
  const { candidates, savedCandidates } = useStore()
  
  const mergedCandidates = React.useMemo(() => {
    const map = new Map<string, any>()
    
    savedCandidates.forEach(sc => {
      map.set(sc.nationalId, {
        name: sc.name,
        nationalId: sc.nationalId,
        governorate: sc.governorate,
        qualification: sc.qualification,
        securityCompany: sc.securityCompany,
        position: sc.position,
        offerResult: sc.finalResult,
        offerDate: sc.offerDate,
        addDate: sc.createdAt
      })
    })

    candidates.forEach(c => {
      map.set(c.nationalId, {
        name: c.name,
        nationalId: c.nationalId,
        governorate: c.governorate,
        qualification: c.qualification,
        securityCompany: c.securityCompany,
        position: c.position,
        offerResult: c.offerResult,
        offerDate: c.offerDate,
        addDate: c.createdAt
      })
    })

    return Array.from(map.values())
  }, [candidates, savedCandidates])
  const { theme } = useTheme()
  const { t } = useTranslation()

  // dynamic colors based on theme
  const tickColor    = theme === 'dark' ? '#94a3b8' : '#475569'
  const axisColor    = theme === 'dark' ? '#64748b' : '#94a3b8'
  const gridColor    = theme === 'dark' ? '#1e293b' : '#f1f5f9'
  const cursorColor  = theme === 'dark' ? '#1e293b' : '#f8fafc'
  const legendColor  = theme === 'dark' ? '#94a3b8' : '#475569'

  const total      = mergedCandidates.length
  const hired      = mergedCandidates.filter(c => c.offerResult === 'مقبول').length
  const rejected   = mergedCandidates.filter(c => c.offerResult === 'مرفوض').length
  const excluded   = mergedCandidates.filter(c => c.offerResult === 'مستبعد').length
  const pending    = mergedCandidates.filter(c => c.offerResult === 'في انتظار').length
  const resigned   = mergedCandidates.filter(c => c.offerResult === 'استقالة').length
  const successPct = total > 0 ? ((hired / total) * 100).toFixed(1) : '0'

  // pie data
  const pieData = [
    { name: t('status.accepted', 'مقبول'),      value: hired    },
    { name: t('status.rejected', 'مرفوض'),      value: rejected },
    { name: t('status.excluded', 'مستبعد'),     value: excluded },
    { name: t('status.pending', 'في انتظار'), value: pending  },
    { name: t('status.resigned', 'استقالة'), value: resigned  },
  ].filter(d => d.value > 0)

  // bar – governorates top 10
  const govMap = mergedCandidates.reduce((acc, c) => {
    if (c.governorate) acc[c.governorate] = (acc[c.governorate] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const govData = Object.entries(govMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))

  // bar – qualifications
  const qualMap = mergedCandidates.reduce((acc, c) => {
    if (c.qualification) acc[c.qualification] = (acc[c.qualification] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const qualData = Object.entries(qualMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }))

  // bar – companies
  const compMap = mergedCandidates.reduce((acc, c) => {
    if (c.securityCompany) acc[c.securityCompany] = (acc[c.securityCompany] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const compData = Object.entries(compMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }))

  // export handler
  const handleExport = () => {
    const rows: string[][] = [
      [
        t('candidates.columns.name'), 
        t('candidates.columns.nationalId'), 
        t('candidates.columns.governorate'), 
        t('candidates.columns.qualification'), 
        t('candidates.columns.company'), 
        t('candidates.columns.position'), 
        t('database.columns.finalResult'), 
        t('candidates.columns.addDate')
      ],
      ...mergedCandidates.map(c => [
        c.name, c.nationalId, c.governorate, c.qualification,
        c.securityCompany, c.position || '', c.offerResult, c.offerDate,
      ]),
    ]
    exportCSV(rows, `Analytics_Export_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleExportExcel = () => {
    const data = mergedCandidates.map(c => ({
      [t('candidates.columns.name')]:        c.name,
      [t('candidates.columns.nationalId')]:  c.nationalId,
      [t('candidates.columns.governorate')]: c.governorate,
      [t('candidates.columns.qualification')]:c.qualification,
      [t('candidates.columns.company')]:     c.securityCompany,
      [t('candidates.columns.position')]:    c.position || '',
      [t('database.columns.finalResult')]:   c.offerResult,
      [t('candidates.columns.addDate')]:     c.offerDate,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Candidates')
    XLSX.writeFile(wb, `Analytics_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handlePrintPDF = () => window.print()

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
      <div className="page-wrapper" style={{ direction: 'inherit' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h1 className="page-title">{t('analytics.title')}</h1>
            <p className="page-subtitle">{t('analytics.subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleExportExcel} className="btn btn-success btn-sm">
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button onClick={handleExport} className="btn btn-ghost btn-sm">
              <Download size={14} /> CSV
            </button>
            <button onClick={handlePrintPDF} className="btn btn-ghost btn-sm print-hidden">
              <Printer size={14} /> PDF
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: t('analytics.stats.total'), value: total,        icon: Users,        color: 'blue'   },
            { label: t('analytics.stats.hired'),          value: hired,        icon: TrendingUp,   color: 'green'  },
            { label: t('analytics.stats.rejected'),          value: rejected,     icon: TrendingDown, color: 'red'    },
            { label: t('analytics.stats.acceptanceRate'),      value: `${successPct}%`, icon: TrendingUp, color: 'purple' },
            { label: t('analytics.stats.pending'),       value: pending,      icon: Clock,        color: 'orange' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-icon"><Icon size={20} /></div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            )
          })}
        </div>

        {/* ── Row 1: Pie + Companies bar ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px', marginBottom: '16px' }}>

          {/* Pie chart */}
          <div className="section-card">
            <div className="section-card-header"><h3>{t('analytics.charts.results')}</h3></div>
            <div className="section-card-body" style={{ padding: '8px 16px 20px' }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span style={{ fontSize: '12px', color: legendColor }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(215 16% 52%)', fontSize: '13px' }}>
                  لا توجد بيانات
                </div>
              )}
            </div>
          </div>

          {/* Companies bar */}
          <div className="section-card">
            <div className="section-card-header"><h3>{t('analytics.charts.byCompany')}</h3></div>
            <div className="section-card-body" style={{ padding: '8px 8px 16px' }}>
              {compData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={compData} layout="vertical" margin={{ top: 4, right: 30, left: 20, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={240}
                      axisLine={false}
                      tickLine={false}
                      tick={({ x, y, payload }) => (
                        <text x={x - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={11} fill={tickColor}>
                          {payload.value.length > 22 ? payload.value.slice(0, 22) + '…' : payload.value}
                        </text>
                      )}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorColor }} />
                    <Bar dataKey="value" name="عدد المرشحين" radius={[0, 5, 5, 0]} barSize={18}>
                      {compData.map((_, i) => <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(215 16% 52%)', fontSize: '13px' }}>لا توجد بيانات</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 2: Governorates bar + Qualifications bar ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Governorates */}
          <div className="section-card">
            <div className="section-card-header"><h3>{t('analytics.charts.governorates')}</h3></div>
            <div className="section-card-body" style={{ padding: '8px 8px 16px' }}>
              {govData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={govData} margin={{ top: 8, right: 16, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorColor }} />
                    <Bar dataKey="value" name="عدد المرشحين" radius={[5, 5, 0, 0]} barSize={24}>
                      {govData.map((_, i) => <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(215 16% 52%)', fontSize: '13px' }}>لا توجد بيانات</div>
              )}
            </div>
          </div>

          {/* Qualifications */}
          <div className="section-card">
            <div className="section-card-header"><h3>{t('analytics.charts.qualifications')}</h3></div>
            <div className="section-card-body" style={{ padding: '8px 8px 16px' }}>
              {qualData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={qualData.slice(0, 10)} layout="vertical" margin={{ top: 4, right: 30, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: tickColor }} width={120} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorColor }} />
                    <Bar dataKey="value" name="عدد المرشحين" radius={[0, 5, 5, 0]} barSize={20}>
                      {qualData.slice(0, 10).map((_, i) => <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(215 16% 52%)', fontSize: '13px' }}>لا توجد بيانات</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ProtectedLayout>
  )
}

export default AnalyticsPage
