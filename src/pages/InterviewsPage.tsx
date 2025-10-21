import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'

const InterviewsPage: React.FC = () => {
  const { 
    currentUser, 
    interviews, 
    candidates,
    addInterview, 
    updateInterview, 
    deleteInterview 
  } = useStore()
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newInterview, setNewInterview] = useState({
    candidateId: '',
    candidateName: '',
    position: '',
    date: '',
    time: '',
    status: 'مجدولة' as const,
    notes: ''
  })

  const handleAddInterview = () => {
    if (!newInterview.candidateId || !newInterview.position || !newInterview.date || !newInterview.time) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    addInterview(newInterview)
    setNewInterview({
      candidateId: '',
      candidateName: '',
      position: '',
      date: '',
      time: '',
      status: 'مجدولة',
      notes: ''
    })
    setShowAddForm(false)
    alert('تم جدولة المقابلة بنجاح')
  }

  const handleUpdateInterview = (id: string, status: string) => {
    updateInterview(id, { status: status as any })
    alert('تم تحديث حالة المقابلة بنجاح')
  }

  const handleDeleteInterview = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المقابلة؟')) {
      deleteInterview(id)
      alert('تم حذف المقابلة بنجاح')
    }
  }

  const canAddInterview = currentUser?.userType === 'interview_manager' || currentUser?.userType === 'admin'
  const canDelete = currentUser?.userType === 'admin'

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
            المقابلات ({interviews.length})
          </h2>
          
          {canAddInterview && (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              جدولة مقابلة جديدة
            </button>
          )}
        </div>

        {/* نموذج جدولة مقابلة جديدة */}
        {showAddForm && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px solid #3498db'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>
              جدولة مقابلة جديدة
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  اسم المرشح *
                </label>
                <select
                  value={newInterview.candidateId}
                  onChange={(e) => {
                    const selectedCandidate = candidates.find(c => c.id === e.target.value)
                    setNewInterview({
                      ...newInterview,
                      candidateId: e.target.value,
                      candidateName: selectedCandidate?.name || ''
                    })
                  }}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <option value="">اختر المرشح</option>
                  {candidates.map(candidate => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} - {candidate.governorate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  المنصب *
                </label>
                <input
                  type="text"
                  value={newInterview.position}
                  onChange={(e) => setNewInterview({...newInterview, position: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                  placeholder="أدخل المنصب"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  التاريخ *
                </label>
                <input
                  type="date"
                  value={newInterview.date}
                  onChange={(e) => setNewInterview({...newInterview, date: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  الوقت *
                </label>
                <input
                  type="time"
                  value={newInterview.time}
                  onChange={(e) => setNewInterview({...newInterview, time: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  الحالة
                </label>
                <select
                  value={newInterview.status}
                  onChange={(e) => setNewInterview({...newInterview, status: e.target.value as any})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <option value="مجدولة">مجدولة</option>
                  <option value="مكتملة">مكتملة</option>
                  <option value="ملغاة">ملغاة</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  ملاحظات
                </label>
                <textarea
                  value={newInterview.notes}
                  onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', height: '80px' }}
                  placeholder="أدخل ملاحظات إضافية"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAddInterview}
                style={{
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                جدولة المقابلة
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* جدول المقابلات */}
        <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  اسم المرشح
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  المنصب
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  التاريخ
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  الوقت
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  الحالة
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  الإجراءات
                </th>
                {canDelete && (
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                    حذف
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {interviews.map(interview => (
                <tr key={interview.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}>
                    {interview.candidateName}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {interview.position}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {interview.date}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {interview.time}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: interview.status === 'مكتملة' ? '#2ecc71' : 
                                     interview.status === 'ملغاة' ? '#e74c3c' : '#3498db',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      fontSize: '12px'
                    }}>
                      {interview.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleUpdateInterview(interview.id, 'مكتملة')}
                        style={{
                          backgroundColor: '#2ecc71',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        مكتملة
                      </button>
                      <button
                        onClick={() => handleUpdateInterview(interview.id, 'ملغاة')}
                        style={{
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        إلغاء
                      </button>
                    </div>
                  </td>
                  {canDelete && (
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteInterview(interview.id)}
                        style={{
                          color: '#e74c3c',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '5px 10px'
                        }}
                      >
                        حذف
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {interviews.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#7f8c8d'
          }}>
            <p>لا توجد مقابلات مجدولة</p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}

export default InterviewsPage
