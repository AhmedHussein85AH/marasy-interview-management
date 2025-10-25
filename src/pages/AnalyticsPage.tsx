import React from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'

const AnalyticsPage: React.FC = () => {
  const { candidates, interviews } = useStore()

  // حساب الإحصائيات
  const totalCandidates = candidates.length
  const newCandidates = candidates.filter(c => c.status === 'جديد').length
  const hiredCandidates = candidates.filter(c => c.offerResult === 'مقبول').length
  const rejectedCandidates = candidates.filter(c => c.offerResult === 'مرفوض').length
  const excludedCandidates = candidates.filter(c => c.offerResult === 'مستبعد').length
  const pendingCandidates = candidates.filter(c => c.offerResult === 'في انتظار').length

  const totalInterviews = interviews.length
  const scheduledInterviews = interviews.filter(i => i.status === 'مجدولة').length
  const completedInterviews = interviews.filter(i => i.status === 'مكتملة').length
  const cancelledInterviews = interviews.filter(i => i.status === 'ملغاة').length

  // حساب معدل النجاح
  const successRate = totalCandidates > 0 ? ((hiredCandidates / totalCandidates) * 100).toFixed(1) : '0'

  // حساب معدل الرفض
  const rejectionRate = totalCandidates > 0 ? ((rejectedCandidates / totalCandidates) * 100).toFixed(1) : '0'

  // توزيع المحافظات
  const governorateStats = candidates.reduce((acc, candidate) => {
    acc[candidate.governorate] = (acc[candidate.governorate] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // توزيع المؤهلات
  const qualificationStats = candidates.reduce((acc, candidate) => {
    acc[candidate.qualification] = (acc[candidate.qualification] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
      <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 60px)' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>
          التقارير والإحصائيات
        </h1>

        {/* إحصائيات عامة */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
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
              {totalCandidates}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}>
              إجمالي المرشحين
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
              color: '#2ecc71',
              marginBottom: '10px'
            }}>
              {hiredCandidates}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}>
              مرشحين مقبولين
            </div>
          </div>

          {/* المرشحين المرفوضين */}
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
              color: '#e74c3c',
              marginBottom: '10px'
            }}>
              {rejectedCandidates}
            </div>
            <div style={{ color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}>
              مرشحين مرفوضين
            </div>
          </div>

          {/* معدل النجاح */}
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
              {successRate}%
            </div>
            <div style={{ color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}>
              معدل النجاح
            </div>
          </div>
        </div>

        {/* إحصائيات المقابلات */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            إحصائيات المقابلات
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                {totalInterviews}
              </div>
              <div style={{ color: '#7f8c8d' }}>إجمالي المقابلات</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>
                {scheduledInterviews}
              </div>
              <div style={{ color: '#7f8c8d' }}>مقابلات مجدولة</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>
                {completedInterviews}
              </div>
              <div style={{ color: '#7f8c8d' }}>مقابلات مكتملة</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {cancelledInterviews}
              </div>
              <div style={{ color: '#7f8c8d' }}>مقابلات ملغاة</div>
            </div>
          </div>
        </div>

        {/* توزيع المحافظات */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            توزيع المرشحين حسب المحافظة
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(governorateStats).map(([governorate, count]) => (
              <div key={governorate} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px'
              }}>
                <span style={{ fontWeight: 'bold' }}>{governorate}</span>
                <span style={{
                  backgroundColor: '#3498db',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '14px'
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* توزيع المؤهلات */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            توزيع المرشحين حسب المؤهل
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(qualificationStats).map(([qualification, count]) => (
              <div key={qualification} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px'
              }}>
                <span style={{ fontWeight: 'bold' }}>{qualification}</span>
                <span style={{
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '14px'
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ملخص النتائج */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            ملخص النتائج
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>
                {hiredCandidates}
              </div>
              <div style={{ color: '#7f8c8d' }}>مقبول</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {rejectedCandidates}
              </div>
              <div style={{ color: '#7f8c8d' }}>مرفوض</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>
                {excludedCandidates}
              </div>
              <div style={{ color: '#7f8c8d' }}>مستبعد</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                {pendingCandidates}
              </div>
              <div style={{ color: '#7f8c8d' }}>في انتظار</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

export default AnalyticsPage
