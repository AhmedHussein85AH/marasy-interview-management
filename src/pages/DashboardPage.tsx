import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { Monitor, Smartphone, Globe, Clock, Shield, AlertTriangle, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SecurityPage: React.FC = () => {
  const { t } = useTranslation()
  const { currentUser, loginLogs, loadLoginLogs, getActiveSessions, auditLogs, loadAuditLogs } = useStore()
  const [activeTab, setActiveTab] = useState<'logins' | 'activities'>('logins')
  const [selectedLog, setSelectedLog] = useState<string | null>(null)
  const [filterEmail, setFilterEmail] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [auditFilter, setAuditFilter] = useState('')

  useEffect(() => {
    if (currentUser?.userType === 'admin') {
      loadLoginLogs()
      loadAuditLogs()
    }
  }, [currentUser, loadLoginLogs, loadAuditLogs])

  const activeSessions = getActiveSessions()
  const filteredLogs = loginLogs.filter(log => {
    if (filterEmail && !log.userEmail.toLowerCase().includes(filterEmail.toLowerCase())) return false
    if (filterActive === 'active' && !log.isActive) return false
    if (filterActive === 'inactive' && log.isActive) return false
    return true
  })

  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditFilter) {
      const q = auditFilter.toLowerCase()
      return log.userName.toLowerCase().includes(q) || 
             log.actionType.toLowerCase().includes(q) || 
             log.targetName.toLowerCase().includes(q)
    }
    return true
  })

  const getDeviceIcon = (deviceType?: string) => {
    if (deviceType?.includes('موبايل')) return <Smartphone size={14} />
    return <Monitor size={14} />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDuration = (loginTime: string, logoutTime?: string) => {
    const login = new Date(loginTime)
    const logout = logoutTime ? new Date(logoutTime) : new Date()
    const diff = Math.floor((logout.getTime() - login.getTime()) / 1000 / 60)
    
    if (diff < 60) return t('security.minute', '{{count}} دقيقة', { count: diff })
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return t('security.hourMinute', '{{hours}} ساعة {{minutes}} دقيقة', { hours, minutes })
  }

  return (
    <ProtectedLayout requiredPermissions={['admin']}>
      <div className="page-wrapper" style={{ direction: 'rtl' }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={22} /> {t('security.title', 'مراقبة الأمان والأنشطة')}
            </h1>
            <p className="page-subtitle">{t('security.subtitle', 'تتبع تسجيلات الدخول وأنشطة المستخدمين')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            className={`btn ${activeTab === 'logins' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('logins')}
          >
            سجلات الدخول
          </button>
          <button
            className={`btn ${activeTab === 'activities' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('activities')}
          >
            سجلات الأنشطة
          </button>
        </div>

        {activeTab === 'logins' ? (
          <>
            {/* Stats */}
            <div className="stats-mini" style={{ marginBottom: '20px' }}>
              <div className="stats-mini-card">
                <div className="value" style={{ color: '#2980b9' }}>{loginLogs.length}</div>
                <div className="label">{t('security.totalLogins', 'إجمالي تسجيلات الدخول')}</div>
              </div>
              <div className="stats-mini-card">
                <div className="value" style={{ color: '#27ae60' }}>{activeSessions.length}</div>
                <div className="label">{t('security.activeSessions', 'جلسات نشطة')}</div>
              </div>
              <div className="stats-mini-card">
                <div className="value" style={{ color: '#f39c12' }}>{new Set(loginLogs.map(log => log.userEmail)).size}</div>
                <div className="label">{t('security.activeUsers', 'مستخدمين نشطين')}</div>
              </div>
              <div className="stats-mini-card">
                <div className="value" style={{ color: '#e74c3c' }}>{new Set(loginLogs.filter(log => log.country && log.country !== 'غير معروف').map(log => log.country)).size}</div>
                <div className="label">{t('security.differentCountries', 'دول مختلفة')}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="filter-bar" style={{ marginBottom: '16px' }}>
              <div className="search-box">
                <Search size={14} />
                <input className="form-input" style={{ width: '220px' }} type="text" placeholder={t('security.searchByEmail', 'البحث بالبريد الإلكتروني...')} value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} />
              </div>
              <select className="form-input" style={{ width: '180px' }} value={filterActive} onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}>
                <option value="all">{t('security.allSessions', 'جميع الجلسات')}</option>
                <option value="active">{t('security.activeOnly', 'نشطة فقط')}</option>
                <option value="inactive">{t('security.inactiveOnly', 'منتهية فقط')}</option>
              </select>
            </div>

            {/* Login logs table */}
            <div className="section-card">
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('security.user', 'المستخدم')}</th>
                      <th>{t('security.device', 'الجهاز')}</th>
                      <th>{t('security.location', 'الموقع')}</th>
                      <th>{t('security.loginTime', 'وقت الدخول')}</th>
                      <th>{t('security.duration', 'المدة')}</th>
                      <th>{t('security.status', 'الحالة')}</th>
                      <th>{t('security.details', 'تفاصيل')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id}
                        style={{ backgroundColor: log.isActive ? 'hsl(120 40% 95%)' : 'transparent', cursor: 'pointer' }}
                        onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                      >
                        <td>
                          <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{log.userName}</div>
                          <div className="muted" style={{ fontSize: '12px' }}>{log.userEmail}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {getDeviceIcon(log.deviceType)}
                            <span>{log.deviceType || t('security.unknown', 'غير معروف')}</span>
                          </div>
                          <div className="muted" style={{ fontSize: '12px' }}>{log.browser} - {log.os}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Globe size={14} />
                            <span>{log.city || t('security.unknown', 'غير معروف')}, {log.country || t('security.unknown', 'غير معروف')}</span>
                          </div>
                          {log.latitude && log.longitude && (
                            <div className="muted" style={{ fontSize: '12px' }}>{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={14} />
                            <span>{formatDate(log.loginTime)}</span>
                          </div>
                        </td>
                        <td>{getDuration(log.loginTime, log.logoutTime)}</td>
                        <td>
                          <span className={log.isActive ? 'badge badge-success' : 'badge badge-muted'}>
                            {log.isActive ? t('security.active', 'نشط') : t('security.ended', 'منتهي')}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm">
                            {t('security.viewDetails', 'عرض التفاصيل')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredLogs.length === 0 && (
                <div className="empty-state">
                  <AlertTriangle size={32} style={{ opacity: 0.5 }} />
                  <p>{t('security.noLogs', 'لا توجد سجلات دخول')}</p>
                </div>
              )}
            </div>

            {/* Session details */}
            {selectedLog && (
              <div className="section-card" style={{ marginTop: '16px', border: '2px solid hsl(210 90% 55%)' }}>
                <div className="section-card-header">
                  <h3>{t('security.sessionDetails', 'تفاصيل الجلسة')}</h3>
                </div>
                <div className="section-card-body">
                  {(() => {
                    const log = loginLogs.find(l => l.id === selectedLog)
                    if (!log) return null
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                        <div><strong>{t('security.user')}:</strong> {log.userName} ({log.userEmail})</div>
                        <div><strong>{t('security.ipAddress')}:</strong> {log.ipAddress || t('security.unknown')}</div>
                        <div><strong>{t('security.device')}:</strong> {log.deviceType || t('security.unknown')}</div>
                        <div><strong>{t('security.browser')}:</strong> {log.browser || t('security.unknown')}</div>
                        <div><strong>{t('security.os')}:</strong> {log.os || t('security.unknown')}</div>
                        <div><strong>{t('security.country')}:</strong> {log.country || t('security.unknown')}</div>
                        <div><strong>{t('security.city')}:</strong> {log.city || t('security.unknown')}</div>
                        <div><strong>{t('security.loginTime')}:</strong> {formatDate(log.loginTime)}</div>
                        {log.logoutTime && <div><strong>{t('security.logoutTime')}:</strong> {formatDate(log.logoutTime)}</div>}
                        <div><strong>{t('security.duration')}:</strong> {getDuration(log.loginTime, log.logoutTime)}</div>
                        <div><strong>{t('security.sessionId')}:</strong> <code style={{ fontSize: '12px' }}>{log.sessionId}</code></div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <strong>{t('security.userAgent')}:</strong>
                          <div style={{ padding: '10px', background: 'hsl(var(--muted))', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '5px' }}>
                            {log.userAgent || t('security.unknown')}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Audit log filter */}
            <div className="filter-bar" style={{ marginBottom: '16px' }}>
              <div className="search-box">
                <Search size={14} />
                <input className="form-input" style={{ width: '300px' }} type="text" placeholder="البحث باسم المستخدم أو الإجراء..." value={auditFilter} onChange={(e) => setAuditFilter(e.target.value)} />
              </div>
            </div>

            {/* Audit log table */}
            <div className="section-card">
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>المستخدم</th>
                      <th>الإجراء</th>
                      <th>الهدف</th>
                      <th>الاسم / التفاصيل</th>
                      <th>الوقت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 600 }}>{log.userName}</td>
                        <td>
                          <span className={
                            log.actionType === 'إضافة' ? 'badge badge-success' :
                            log.actionType === 'تعديل' ? 'badge badge-warning' :
                            log.actionType === 'قبول' ? 'badge badge-info' :
                            log.actionType === 'رفض' || log.actionType === 'حذف' || log.actionType === 'استبعاد' ? 'badge badge-danger' : 'badge badge-muted'
                          }>
                            {log.actionType}
                          </span>
                        </td>
                        <td className="muted">{log.targetType}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{log.targetName}</div>
                          <div className="muted" style={{ fontSize: '12px', marginTop: '2px' }}>{log.details}</div>
                        </td>
                        <td className="muted" style={{ fontSize: '13px' }}>{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAuditLogs.length === 0 && (
                <div className="empty-state">
                  <AlertTriangle size={32} style={{ opacity: 0.5 }} />
                  <p>لا توجد سجلات أنشطة حالياً</p>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </ProtectedLayout>
  )
}

export default SecurityPage