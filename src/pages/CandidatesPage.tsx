import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'

const CandidatesPage: React.FC = () => {
  const { 
    currentUser, 
    candidates, 
    addCandidate, 
    updateCandidateStatus, 
    deleteCandidate,
    searchCandidates,
    saveCandidateToDatabase
  } = useStore()
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [filteredCandidates, setFilteredCandidates] = useState(candidates)
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [decisionResult, setDecisionResult] = useState<'مقبول' | 'مرفوض' | ''>('')
  const [decisionNotes, setDecisionNotes] = useState('')
  const [workShift, setWorkShift] = useState<'نهار' | 'ليل' | ''>('')
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    nationalId: '',
    birthDate: '',
    governorate: '',
    qualification: '',
    maritalStatus: 'أعزب' as const,
    securityCompany: '',
    position: '',
    offerDate: '',
    offerResult: 'في انتظار' as const
  })

  useEffect(() => {
    let filtered = candidates

    // تطبيق البحث
    if (searchQuery) {
      filtered = searchCandidates(searchQuery)
    }

    // تطبيق الفلتر حسب الشركة
    if (filterCompany) {
      filtered = filtered.filter(candidate => 
        candidate.securityCompany.toLowerCase().includes(filterCompany.toLowerCase())
      )
    }

    setFilteredCandidates(filtered)
  }, [searchQuery, filterCompany, candidates])

  const handleAddCandidate = () => {
    if (!newCandidate.name || !newCandidate.nationalId || !newCandidate.birthDate || 
        !newCandidate.governorate || !newCandidate.qualification) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    addCandidate({...newCandidate, createdBy: currentUser?.name || 'Unknown'})
    setNewCandidate({
      name: '',
      nationalId: '',
      birthDate: '',
      governorate: '',
      qualification: '',
      maritalStatus: 'أعزب',
      securityCompany: '',
      position: '',
      offerDate: '',
      offerResult: 'في انتظار'
    })
    setShowAddForm(false)
    alert('تم إضافة المرشح بنجاح')
  }

  const handleStatusUpdate = (id: string, status: string, result: string) => {
    const candidate = candidates.find(c => c.id === id)
    if (candidate) {
      setSelectedCandidate(candidate)
      setDecisionResult(result as 'مقبول' | 'مرفوض')
      setDecisionNotes('')
      setWorkShift('')
      setShowDecisionModal(true)
    }
  }

  const handleSubmitDecision = async () => {
    if (!selectedCandidate || !decisionResult) return

    try {
      updateCandidateStatus(selectedCandidate.id, 
        decisionResult === 'مقبول' ? 'تم التوظيف' : 'مرفوض', 
        decisionResult as any)
      
      if (decisionResult === 'مقبول' || decisionResult === 'مرفوض') {
        await saveCandidateToDatabase(
          selectedCandidate, 
          decisionResult as any,
          decisionNotes || undefined,
          workShift as 'نهار' | 'ليل' || undefined
        )
      }
      
      alert('تم تحديث حالة المرشح وحفظه في قاعدة البيانات بنجاح')
      setShowDecisionModal(false)
      setSelectedCandidate(null)
      setDecisionResult('')
      setDecisionNotes('')
      setWorkShift('')
    } catch (error) {
      console.error('خطأ في حفظ القرار:', error)
      alert('حدث خطأ في حفظ القرار')
    }
  }


  const handleDeleteCandidate = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المرشح؟')) {
      deleteCandidate(id)
      alert('تم حذف المرشح بنجاح')
    }
  }

  const canAddCandidate = currentUser?.userType === 'security_employee' || currentUser?.userType === 'admin'
  const canUpdateStatus = currentUser?.userType === 'interview_manager' || currentUser?.userType === 'admin'
  const canDelete = currentUser?.userType === 'admin'

  // إضافة رسالة توضيحية للمستخدمين غير المصرح لهم
  console.log('نوع المستخدم الحالي:', currentUser?.userType)
  console.log('يمكن الحذف:', canDelete)

  // الحصول على قائمة الشركات الفريدة
  const uniqueCompanies = Array.from(new Set(candidates.map(c => c.securityCompany))).filter(Boolean)

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
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
            المرشحين ({filteredCandidates.length})
            {!canDelete && (
              <span style={{ 
                fontSize: '12px', 
                color: '#7f8c8d', 
                marginLeft: '10px',
                fontWeight: 'normal'
              }}>
                (صلاحيات محدودة - الأدمن فقط يمكنه الحذف)
              </span>
            )}
          </h2>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="البحث في المرشحين..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                width: '250px'
              }}
            />

            {/* فلتر الشركة */}
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            >
              <option value="">جميع الشركات</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
            
            {canAddCandidate && (
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
                إضافة مرشح جديد
              </button>
            )}
          </div>
        </div>

        {/* نموذج إضافة مرشح */}
        {showAddForm && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px solid #3498db'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>
              إضافة مرشح جديد
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  الرقم القومي *
                </label>
                <input
                  type="text"
                  value={newCandidate.nationalId}
                  onChange={(e) => setNewCandidate({...newCandidate, nationalId: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                  placeholder="أدخل الرقم القومي"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  تاريخ الميلاد *
                </label>
                <input
                  type="date"
                  value={newCandidate.birthDate}
                  onChange={(e) => setNewCandidate({...newCandidate, birthDate: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  المحافظة *
                </label>
                <input
                  type="text"
                  value={newCandidate.governorate}
                  onChange={(e) => setNewCandidate({...newCandidate, governorate: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                  placeholder="أدخل المحافظة"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  المؤهل *
                </label>
                <input
                  type="text"
                  value={newCandidate.qualification}
                  onChange={(e) => setNewCandidate({...newCandidate, qualification: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                  placeholder="أدخل المؤهل"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  الحالة الاجتماعية
                </label>
                <select
                  value={newCandidate.maritalStatus}
                  onChange={(e) => setNewCandidate({...newCandidate, maritalStatus: e.target.value as any})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <option value="أعزب">أعزب</option>
                  <option value="متزوج">متزوج</option>
                  <option value="مطلق">مطلق</option>
                  <option value="أرمل">أرمل</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  شركة الأمن
                </label>
                <input
                  type="text"
                  value={newCandidate.securityCompany}
                  onChange={(e) => setNewCandidate({...newCandidate, securityCompany: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                  placeholder="أدخل اسم شركة الأمن"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  الوظيفة (اختياري)
                </label>
                <input
                  type="text"
                  value={newCandidate.position}
                  onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                  placeholder="أدخل المسمى الوظيفي"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  تاريخ العرض
                </label>
                <input
                  type="date"
                  value={newCandidate.offerDate}
                  onChange={(e) => setNewCandidate({...newCandidate, offerDate: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAddCandidate}
                style={{
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                إضافة المرشح
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

        {/* جدول المرشحين */}
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
                  تاريخ الميلاد
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  المحافظة
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  المؤهل
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  الحالة الاجتماعية
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  اسم الشركة
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  الوظيفة
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  نتيجة العرض
                </th>
                {canUpdateStatus && (
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                    الإجراءات
                  </th>
                )}
                {canDelete && (
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                    حذف
                  </th>
                )}
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
                    {candidate.birthDate}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.governorate}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.qualification}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.maritalStatus}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#3498db' }}>
                    {candidate.securityCompany}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.position || '-'}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
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
                  </td>
                  {canUpdateStatus && (
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleStatusUpdate(candidate.id, 'تم التوظيف', 'مقبول')}
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
                          قبول
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(candidate.id, 'مرفوض', 'مرفوض')}
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
                          رفض
                        </button>
                      </div>
                    </td>
                  )}
                  {canDelete && (
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteCandidate(candidate.id)}
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

        {filteredCandidates.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#7f8c8d'
          }}>
            <p>لا توجد مرشحين متطابقين مع البحث</p>
          </div>
        )}

        {/* رسالة توضيحية للمستخدمين غير المصرح لهم */}
        {!canDelete && filteredCandidates.length > 0 && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '15px',
            marginTop: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#856404', margin: 0 }}>
              <strong>ملاحظة:</strong> أزرار الحذف متاحة فقط للمديرين (الأدمن). 
              نوع المستخدم الحالي: <strong>{currentUser?.userType}</strong>
            </p>
          </div>
        )}

        {/* نافذة إدخال الملاحظات والوردية */}
        {showDecisionModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
                {decisionResult === 'مقبول' ? 'قبول المرشح' : 'رفض المرشح'}: {selectedCandidate?.name}
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  الملاحظات (اختياري)
                </label>
                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="اكتب ملاحظات حول القرار..."
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {decisionResult === 'مقبول' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    الوردية (اختياري)
                  </label>
                  <select
                    value={workShift}
                    onChange={(e) => setWorkShift(e.target.value as 'نهار' | 'ليل')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px'
                    }}
                  >
                    <option value="">اختر الوردية</option>
                    <option value="نهار">نهار</option>
                    <option value="ليل">ليل</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDecisionModal(false)}
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
                <button
                  onClick={handleSubmitDecision}
                  style={{
                    backgroundColor: decisionResult === 'مقبول' ? '#2ecc71' : '#e74c3c',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedLayout>
  )
}

export default CandidatesPage