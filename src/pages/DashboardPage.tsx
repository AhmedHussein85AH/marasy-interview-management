import React from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'

const DashboardPage: React.FC = () => {
  const { currentUser, candidates, interviews, stats, getUnreadNotifications } = useStore()

  const getWelcomeMessage = () => {
    if (!currentUser) return 'مرحباً'
    
    switch (currentUser.userType) {
      case 'security_employee':
        return `مرحباً ${currentUser.name.split(' - ')[0]}`
      case 'interview_manager':
        return `مرحباً ${currentUser.name.split(' - ')[0]}`
      case 'admin':
        return `مرحباً ${currentUser.name.split(' - ')[0]}`
      default:
        return 'مرحباً'
    }
  }

  const getUserRole = () => {
    if (!currentUser) return ''
    
    switch (currentUser.userType) {
      case 'security_employee':
        return 'موظف شركة الأمن'
      case 'interview_manager':
        return 'مسئول المقابلات'
      case 'admin':
        return 'مدير النظام'
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
    return candidates.filter(c => c.offerResult === 'مقبول').length
  }

  const unreadNotifications = getUnreadNotifications()

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
      <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 60px)' }}>
        {/* ترحيب */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>
            {getWelcomeMessage()}
          </h1>
          <p style={{ color: '#7f8c8d', margin: 0, fontSize: '16px' }}>
            {getUserRole()} - {currentUser?.department}
            {unreadNotifications.length > 0 && (
              <span style={{
                color: '#e74c3c',
                marginLeft: '10px',
                fontWeight: 'bold'
              }}>
                ({unreadNotifications.length} إشعار جديد)
              </span>
            )}
          </p>
        </div>

        {/* الإحصائيات */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* إجمالي المرشحين */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#3498db',
              marginBottom: '10px'
            }}>
              {candidates.length}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}>
              إجمالي المرشحين
            </div>
          </div>

          {/* المرشحين الجدد */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#2ecc71',
              marginBottom: '10px'
            }}>
              {getNewCandidates()}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}>
              مرشحين جدد
            </div>
          </div>

          {/* المقابلات المجدولة */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#f39c12',
              marginBottom: '10px'
            }}>
              {getPendingInterviews()}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}>
              مقابلات مجدولة
            </div>
          </div>

          {/* المقابلات المكتملة */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#9b59b6',
              marginBottom: '10px'
            }}>
              {getCompletedInterviews()}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}>
              مقابلات مكتملة
            </div>
          </div>

          {/* المرشحين المقبولين */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#27ae60',
              marginBottom: '10px'
            }}>
              {getHiredCandidates()}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}>
              مرشحين مقبولين
            </div>
          </div>
        </div>

        {/* النشاط الأخير */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            النشاط الأخير
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {candidates.slice(-5).map(candidate => (
              <div key={candidate.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                    {candidate.name}
                  </div>
                  <div style={{ color: '#7f8c8d', fontSize: '14px' }}>
                    {candidate.governorate} - {candidate.qualification}
                  </div>
                </div>
                <div>
                  <span style={{
                    backgroundColor: candidate.offerResult === 'مقبول' ? '#2ecc71' : 
                                   candidate.offerResult === 'مرفوض' ? '#e74c3c' : 
                                   candidate.offerResult === 'مستبعد' ? '#f39c12' : '#3498db',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px'
                  }}>
                    {candidate.offerResult}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* معلومات المستخدم */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
            معلومات المستخدم
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div>
              <strong>الاسم:</strong> {currentUser?.name}
            </div>
            <div>
              <strong>البريد الإلكتروني:</strong> {currentUser?.email}
            </div>
            <div>
              <strong>القسم:</strong> {currentUser?.department}
            </div>
            <div>
              <strong>نوع المستخدم:</strong> {getUserRole()}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

export default DashboardPage
