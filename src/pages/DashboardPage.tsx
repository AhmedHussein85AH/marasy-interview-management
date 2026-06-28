import React from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { Users, UserCheck, CalendarClock, CalendarCheck2, TrendingUp, Database, UserX, Plus, Upload } from 'lucide-react'

import { useTranslation } from 'react-i18next'

const DashboardPage: React.FC = () => {
  const { currentUser, candidates, savedCandidates, interviews, auditLogs, loadAuditLogs, getUnreadNotifications } = useStore()
  const { t } = useTranslation()

  React.useEffect(() => {
    if (auditLogs.length === 0) {
      loadAuditLogs()
    }
  }, [loadAuditLogs, auditLogs.length])

  const mergedCandidates = React.useMemo(() => {
    const map = new Map<string, any>()
    savedCandidates.forEach(sc => map.set(sc.nationalId, { ...sc, offerResult: sc.finalResult }))
    candidates.forEach(c => map.set(c.nationalId, c))
    return Array.from(map.values())
  }, [candidates, savedCandidates])

  const getWelcomeMessage = () => {
    const welcome = t('dashboard.welcome')
    if (!currentUser) return welcome
    return `${welcome} ${currentUser.name.split(' - ')[0]}`
  }

  const getUserRole = () => {
    if (!currentUser) return ''
    
    switch (currentUser.userType) {
      case 'security_employee':
        return t('dashboard.roles.security_employee')
      case 'interview_manager':
        return t('dashboard.roles.interview_manager')
      case 'admin':
        return t('dashboard.roles.admin')
      default:
        return ''
    }
  }

  const getNewCandidates = () => {
    return candidates.filter(c => c.status === 'جديد').length
  }

  const getPendingInterviews = () => {
    return interviews.filter(i => i.status === 'مجدولة').length
  }

  const getCompletedInterviews = () => {
    return interviews.filter(i => i.status === 'مكتملة').length
  }

  const getHiredCandidates = () => {
    return mergedCandidates.filter(c => c.offerResult === 'مقبول').length
  }

  const getResignedCandidates = () => {
    return savedCandidates.filter(c => c.finalResult === 'استقالة').length
  }

  const unreadNotifications = getUnreadNotifications()

  const stats = [
    { label: t('dashboard.stats.totalCandidates'),     value: mergedCandidates.length,     icon: Users,           color: 'blue' },
    { label: t('dashboard.stats.newCandidates'),       value: getNewCandidates(),          icon: UserCheck,       color: 'green' },
    { label: t('dashboard.stats.pendingInterviews'),   value: getPendingInterviews(),      icon: CalendarClock,   color: 'orange' },
    { label: t('dashboard.stats.completedInterviews'), value: getCompletedInterviews(),    icon: CalendarCheck2,  color: 'purple' },
    { label: t('dashboard.stats.hiredCandidates'),     value: getHiredCandidates(),        icon: TrendingUp,      color: 'green' },
    { label: t('dashboard.stats.savedCandidates', 'في قاعدة البيانات'), value: savedCandidates.length, icon: Database, color: 'cyan' },
  ]

  const getStatusBadge = (result: string) => {
    const map: Record<string, string> = {
      'مقبول':     'badge badge-success',
      'مرفوض':     'badge badge-danger',
      'مستبعد':    'badge badge-warning',
      'في انتظار': 'badge badge-info',
    }
    return map[result] || 'badge badge-muted'
  }

  const getStatusTranslation = (result: string) => {
    const map: Record<string, string> = {
      'مقبول':     t('status.accepted'),
      'مرفوض':     t('status.rejected'),
      'مستبعد':    t('status.excluded'),
      'في انتظار': t('status.pending'),
      'جديد':      t('status.new')
    }
    return map[result] || result
  }

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
      <div className="page-wrapper" style={{ direction: 'inherit' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 className="page-title">{getWelcomeMessage()}</h1>
          <p className="page-subtitle">
            {getUserRole()}
            {currentUser?.department ? ` · ${currentUser.department}` : ''}
            {unreadNotifications.length > 0 && (
              <span style={{ color: 'hsl(4 86% 55%)', fontWeight: 600, marginInlineStart: '8px' }}>
                · {unreadNotifications.length} {t('dashboard.newNotification')}
              </span>
            )}
          </p>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-icon">
                  <Icon size={20} />
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="section-card" style={{ marginBottom: '16px' }}>
          <div className="section-card-header">
            <h3>{t('dashboard.quickActions', 'إجراءات سريعة')}</h3>
          </div>
          <div className="section-card-body" style={{ padding: '12px 16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              onClick={() => window.location.href = '/candidates'}>
              <Plus size={14} /> {t('dashboard.addCandidate', 'إضافة مرشح')}
            </button>
            <button className="btn btn-success btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              onClick={() => window.location.href = '/bulk-upload'}>
              <Upload size={14} /> {t('dashboard.uploadExcel', 'رفع ملف Excel')}
            </button>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Recent activity */}
          <div className="section-card">
            <div className="section-card-header">
              <h3>{t('dashboard.recentActivity.title')}</h3>
              <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{t('dashboard.recentActivity.subtitle')}</span>
            </div>
            <div className="section-card-body" style={{ padding: '8px 0' }}>
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="activity-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px', height: '34px',
                      background: 'hsl(var(--muted))',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, color: 'hsl(var(--primary))',
                      flexShrink: 0
                    }}>
                      {log.actionType.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                        {log.userName} - {log.actionType}
                      </div>
                      <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                        {log.targetName} ({log.targetType})
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'hsl(215 16% 52%)', fontSize: '13px' }}>
                  {t('dashboard.recentActivity.noActivity')}
                </div>
              )}
            </div>
          </div>

          {/* User info */}
          <div className="section-card">
            <div className="section-card-header">
              <h3>{t('dashboard.accountInfo.title')}</h3>
            </div>
            <div className="section-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: t('dashboard.accountInfo.name'),             value: currentUser?.name },
                  { label: t('dashboard.accountInfo.email'), value: currentUser?.email },
                  { label: t('dashboard.accountInfo.department'),             value: currentUser?.department },
                  { label: t('dashboard.accountInfo.role'),          value: getUserRole() },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedLayout>
  )
}

export default DashboardPage
