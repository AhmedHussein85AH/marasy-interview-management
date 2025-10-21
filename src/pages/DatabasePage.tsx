import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'

const DatabasePage: React.FC = () => {
  const { 
    currentUser, 
    savedCandidates, 
    getSavedCandidatesByResult, 
    searchSavedCandidates,
    getUnreadNotifications,
    markNotificationAsRead
  } = useStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterResult, setFilterResult] = useState<'all' | 'مقبول' | 'مرفوض' | 'مستبعد'>('all')
  const [filteredCandidates, setFilteredCandidates] = useState(savedCandidates)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    let filtered = savedCandidates

    // تطبيق البحث
    if (searchQuery) {
      filtered = searchSavedCandidates(searchQuery)
    }

    // تطبيق الفلتر حسب النتيجة
    if (filterResult !== 'all') {
      filtered = filtered.filter(candidate => candidate.finalResult === filterResult)
    }

    setFilteredCandidates(filtered)
  }, [searchQuery, filterResult, savedCandidates])

  const getResultColor = (result: string) => {
    switch (result) {
      case 'مقبول': return '#2ecc71'
      case 'مرفوض': return '#e74c3c'
      case 'مستبعد': return '#f39c12'
      default: return '#95a5a6'
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'مقبول': return '✅'
      case 'مرفوض': return '❌'
      case 'مستبعد': return '⚠️'
      default: return '📋'
    }
  }

  const unreadNotifications = getUnreadNotifications()

  const canViewDatabase = currentUser?.userType === 'interview_manager' || currentUser?.userType === 'admin'

  return (
    <ProtectedLayout requiredPermissions={['interview_manager', 'admin']}>
      <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 60px)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>
            قاعدة البيانات المحفوظة ({filteredCandidates.length})
          </h2>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* زر الإشعارات */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                backgroundColor: unreadNotifications.length > 0 ? '#e74c3c' : '#3498db',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              الإشعارات {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
            </button>

            {/* البحث */}
            <input
              type="text"
              placeholder="البحث في قاعدة البيانات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                width: '250px'
              }}
            />

            {/* فلتر النتائج */}
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value as any)}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            >
              <option value="all">جميع النتائج</option>
              <option value="مقبول">مقبول</option>
              <option value="مرفوض">مرفوض</option>
              <option value="مستبعد">مستبعد</option>
            </select>
          </div>
        </div>

        {/* الإشعارات */}
        {showNotifications && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
              الإشعارات ({unreadNotifications.length} غير مقروء)
            </h3>
            
            {unreadNotifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {unreadNotifications.map(notification => (
                  <div key={notification.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    border: '1px solid #ffeaa7'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#856404' }}>
                        {notification.title}
                      </div>
                      <div style={{ color: '#856404', fontSize: '14px' }}>
                        {notification.message}
                      </div>
                      <div style={{ color: '#856404', fontSize: '12px', marginTop: '5px' }}>
                        {notification.candidateName} - {new Date(notification.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      تم القراءة
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#7f8c8d', textAlign: 'center' }}>
                لا توجد إشعارات جديدة
              </p>
            )}
          </div>
        )}

        {/* إحصائيات سريعة */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2ecc71',
              marginBottom: '10px'
            }}>
              {getSavedCandidatesByResult('مقبول').length}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '14px', fontWeight: 'bold' }}>
              مقبول
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#e74c3c',
              marginBottom: '10px'
            }}>
              {getSavedCandidatesByResult('مرفوض').length}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '14px', fontWeight: 'bold' }}>
              مرفوض
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#f39c12',
              marginBottom: '10px'
            }}>
              {getSavedCandidatesByResult('مستبعد').length}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '14px', fontWeight: 'bold' }}>
              مستبعد
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#3498db',
              marginBottom: '10px'
            }}>
              {savedCandidates.length}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '14px', fontWeight: 'bold' }}>
              إجمالي
            </div>
          </div>
        </div>

        {/* جدول قاعدة البيانات */}
        <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  الاسم
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  الرقم القومي
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  المحافظة
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  المؤهل
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  النتيجة النهائية
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  تاريخ القرار
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  قرار من
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  حالة سابقة
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map(candidate => (
                <tr key={candidate.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}>
                    {candidate.name}
                    {candidate.isRejectedBefore && (
                      <span style={{
                        color: '#e74c3c',
                        marginLeft: '5px',
                        fontSize: '16px'
                      }} title={`مرفوض من قبل في ${candidate.previousRejectionDate}`}>
                        ⚠️
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.nationalId}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.governorate}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.qualification}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: getResultColor(candidate.finalResult),
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {getResultIcon(candidate.finalResult)} {candidate.finalResult}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {new Date(candidate.decisionDate).toLocaleDateString('en-GB')}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.decisionBy}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.isRejectedBefore ? (
                      <span style={{
                        color: '#e74c3c',
                        fontSize: '12px'
                      }}>
                        مرفوض سابقاً
                      </span>
                    ) : (
                      <span style={{
                        color: '#2ecc71',
                        fontSize: '12px'
                      }}>
                        جديد
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCandidates.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#7f8c8d'
          }}>
            <p>لا توجد بيانات محفوظة متطابقة مع البحث</p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}

export default DatabasePage
