import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { Monitor, Smartphone, Globe, Clock, Shield, AlertTriangle } from 'lucide-react'
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
    if (deviceType?.includes('موبايل')) return <Smartphone className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
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
      <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 60px)' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield className="h-6 w-6" />
            {t('security.title', 'مراقبة الأمان والأنشطة')}
          </h2>

          {/* تبويبات */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
            <button
              onClick={() => setActiveTab('logins')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'logins' ? '#3498db' : 'transparent',
                color: activeTab === 'logins' ? 'white' : '#7f8c8d',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: activeTab === 'logins' ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              سجلات الدخول
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'activities' ? '#3498db' : 'transparent',
                color: activeTab === 'activities' ? 'white' : '#7f8c8d',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: activeTab === 'activities' ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              سجلات الأنشطة
            </button>
          </div>

          {activeTab === 'logins' ? (
            <>
              {/* إحصائيات الدخول */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            <div style={{ padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2980b9' }}>
                {loginLogs.length}
              </div>
              <div style={{ color: '#7f8c8d', fontSize: '14px' }}>{t('security.totalLogins', 'إجمالي تسجيلات الدخول')}</div>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                {activeSessions.length}
              </div>
              <div style={{ color: '#7f8c8d', fontSize: '14px' }}>{t('security.activeSessions', 'جلسات نشطة')}</div>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>
                {new Set(loginLogs.map(log => log.userEmail)).size}
              </div>
              <div style={{ color: '#7f8c8d', fontSize: '14px' }}>{t('security.activeUsers', 'مستخدمين نشطين')}</div>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {new Set(loginLogs.filter(log => log.country && log.country !== 'غير معروف').map(log => log.country)).size}
              </div>
              <div style={{ color: '#7f8c8d', fontSize: '14px' }}>{t('security.differentCountries', 'دول مختلفة')}</div>
            </div>
          </div>

          {/* فلاتر */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder={t('security.searchByEmail', 'البحث بالبريد الإلكتروني...')}
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                flex: '1',
                minWidth: '200px'
              }}
            />
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
              title={t('security.status', 'الحالة')}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            >
              <option value="all">{t('security.allSessions', 'جميع الجلسات')}</option>
              <option value="active">{t('security.activeOnly', 'نشطة فقط')}</option>
              <option value="inactive">{t('security.inactiveOnly', 'منتهية فقط')}</option>
            </select>
          </div>

          {/* قائمة سجلات الدخول */}
          <div style={{
            maxHeight: '600px',
            overflowY: 'auto',
            border: '1px solid #ddd',
            borderRadius: '5px',
            direction: 'rtl'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>{t('security.user', 'المستخدم')}</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>{t('security.device', 'الجهاز')}</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>{t('security.location', 'الموقع')}</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>{t('security.loginTime', 'وقت الدخول')}</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>{t('security.duration', 'المدة')}</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>{t('security.status', 'الحالة')}</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>{t('security.details', 'تفاصيل')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid #eee',
                      backgroundColor: log.isActive ? '#e8f5e9' : 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {log.userName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{log.userEmail}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {getDeviceIcon(log.deviceType)}
                        <span>{log.deviceType || t('security.unknown', 'غير معروف')}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        {log.browser} - {log.os}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Globe className="h-4 w-4" />
                        <span>{log.city || t('security.unknown', 'غير معروف')}, {log.country || t('security.unknown', 'غير معروف')}</span>
                      </div>
                      {log.latitude && log.longitude && (
                        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                          {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(log.loginTime)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getDuration(log.loginTime, log.logoutTime)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: log.isActive ? '#d4edda' : '#f8d7da',
                        color: log.isActive ? '#155724' : '#721c24'
                      }}>
                        {log.isActive ? t('security.active', 'نشط') : t('security.ended', 'منتهي')}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {t('security.viewDetails', 'عرض التفاصيل')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* تفاصيل السجل المحدد */}
          {selectedLog && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px solid #3498db'
            }}>
              {(() => {
                const log = loginLogs.find(l => l.id === selectedLog)
                if (!log) return null
                return (
                  <div>
                    <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>{t('security.sessionDetails', 'تفاصيل الجلسة')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                      <div>
                        <strong>{t('security.user')}:</strong> {log.userName} ({log.userEmail})
                      </div>
                      <div>
                        <strong>{t('security.ipAddress')}:</strong> {log.ipAddress || t('security.unknown')}
                      </div>
                      <div>
                        <strong>{t('security.device')}:</strong> {log.deviceType || t('security.unknown')}
                      </div>
                      <div>
                        <strong>{t('security.browser')}:</strong> {log.browser || t('security.unknown')}
                      </div>
                      <div>
                        <strong>{t('security.os')}:</strong> {log.os || t('security.unknown')}
                      </div>
                      <div>
                        <strong>{t('security.country')}:</strong> {log.country || t('security.unknown')}
                      </div>
                      <div>
                        <strong>{t('security.city')}:</strong> {log.city || t('security.unknown')}
                      </div>
                      <div>
                        <strong>{t('security.loginTime')}:</strong> {formatDate(log.loginTime)}
                      </div>
                      {log.logoutTime && (
                        <div>
                          <strong>{t('security.logoutTime')}:</strong> {formatDate(log.logoutTime)}
                        </div>
                      )}
                      <div>
                        <strong>{t('security.duration')}:</strong> {getDuration(log.loginTime, log.logoutTime)}
                      </div>
                      <div>
                        <strong>{t('security.sessionId')}:</strong> <code style={{ fontSize: '12px' }}>{log.sessionId}</code>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <strong>{t('security.userAgent')}:</strong>
                        <div style={{
                          padding: '10px',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          marginTop: '5px'
                        }}>
                          {log.userAgent || t('security.unknown')}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {filteredLogs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
              <AlertTriangle className="h-12 w-12" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p>{t('security.noLogs', 'لا توجد سجلات دخول')}</p>
            </div>
          )}
          </>
          ) : (
            <>
              {/* فلاتر سجلات الأنشطة */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="البحث باسم المستخدم أو الإجراء..."
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    flex: '1',
                    minWidth: '200px'
                  }}
                />
              </div>

              {/* جدول سجلات الأنشطة */}
              <div style={{
                maxHeight: '600px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '5px',
                direction: 'rtl'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>المستخدم</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>الإجراء</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>الهدف</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>الاسم / التفاصيل</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>الوقت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{log.userName}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                            backgroundColor: 
                              log.actionType === 'إضافة' ? '#d4edda' :
                              log.actionType === 'تعديل' ? '#fff3cd' :
                              log.actionType === 'قبول' ? '#d1ecf1' :
                              log.actionType === 'رفض' || log.actionType === 'حذف' || log.actionType === 'استبعاد' ? '#f8d7da' : '#e2e3e5',
                            color:
                              log.actionType === 'إضافة' ? '#155724' :
                              log.actionType === 'تعديل' ? '#856404' :
                              log.actionType === 'قبول' ? '#0c5460' :
                              log.actionType === 'رفض' || log.actionType === 'حذف' || log.actionType === 'استبعاد' ? '#721c24' : '#383d41'
                          }}>
                            {log.actionType}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#7f8c8d' }}>{log.targetType}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 'bold' }}>{log.targetName}</div>
                          <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>{log.details}</div>
                        </td>
                        <td style={{ padding: '12px', color: '#7f8c8d', fontSize: '14px' }}>
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAuditLogs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                  <AlertTriangle className="h-12 w-12" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p>لا توجد سجلات أنشطة حالياً</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedLayout>
  )
}

export default SecurityPage

