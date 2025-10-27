import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { supabase } from '../integrations/supabase/client'

const DatabasePage: React.FC = () => {
  const { 
    currentUser, 
    savedCandidates, 
    getSavedCandidatesByResult, 
    searchSavedCandidates,
    searchSavedCandidatesByCompany,
    deleteSavedCandidate,
    deleteMultipleSavedCandidates,
    removeDuplicateSavedCandidates,
    getUnreadNotifications,
    markNotificationAsRead,
    saveCandidateToDatabase,
    set
  } = useStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterResult, setFilterResult] = useState<'all' | 'مقبول' | 'مرفوض' | 'مستبعد'>('all')
  const [filterCompany, setFilterCompany] = useState('')
  const [filteredCandidates, setFilteredCandidates] = useState(savedCandidates)
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showExclusionModal, setShowExclusionModal] = useState(false)
  const [showResignationModal, setShowResignationModal] = useState(false)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('')
  const [exclusionReason, setExclusionReason] = useState('')
  const [resignationReason, setResignationReason] = useState('')

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

    // تطبيق الفلتر حسب الشركة
    if (filterCompany) {
      filtered = filtered.filter(candidate => 
        candidate.securityCompany.toLowerCase().includes(filterCompany.toLowerCase())
      )
    }

    setFilteredCandidates(filtered)
  }, [searchQuery, filterResult, filterCompany, savedCandidates])

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
  const canDelete = currentUser?.userType === 'admin'

  // إضافة رسالة توضيحية للمستخدمين غير المصرح لهم
  console.log('نوع المستخدم الحالي:', currentUser?.userType)
  console.log('يمكن الحذف:', canDelete)

  // الحصول على قائمة الشركات الفريدة
  const uniqueCompanies = Array.from(new Set(savedCandidates.map(c => c.securityCompany))).filter(Boolean)

  // وظائف التعامل مع الاختيار
  const handleSelectCandidate = (id: string) => {
    setSelectedCandidates(prev => 
      prev.includes(id) 
        ? prev.filter(candidateId => candidateId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([])
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id))
    }
  }

  // وظائف الحذف
  const handleDeleteSelected = async () => {
    if (selectedCandidates.length === 0) return
    
    try {
      await deleteMultipleSavedCandidates(selectedCandidates)
      setSelectedCandidates([])
      setShowDeleteConfirm(false)
      alert(`تم حذف ${selectedCandidates.length} مرشح بنجاح`)
    } catch (error) {
      console.error('خطأ في حذف المرشحين:', error)
      alert('حدث خطأ في حذف المرشحين')
    }
  }

  const handleDeleteSingle = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المرشح؟')) return
    
    try {
      await deleteSavedCandidate(id)
      alert('تم حذف المرشح بنجاح')
    } catch (error) {
      console.error('خطأ في حذف المرشح:', error)
      alert('حدث خطأ في حذف المرشح')
    }
  }

  // وظائف الاستبعاد والاستقالة
  const handleExclusionClick = (id: string) => {
    setSelectedCandidateId(id)
    setExclusionReason('')
    setShowExclusionModal(true)
  }

  const handleResignationClick = (id: string) => {
    setSelectedCandidateId(id)
    setResignationReason('')
    setShowResignationModal(true)
  }

  const handleExclusionSubmit = async () => {
    if (!exclusionReason.trim()) {
      alert('يرجى كتابة سبب الاستبعاد')
      return
    }

    const candidate = savedCandidates.find(c => c.id === selectedCandidateId)
    if (candidate) {
      try {
        // تحديث المرشح المحفوظ مباشرة في Supabase
        const { data, error } = await supabase
          .from('saved_candidates')
          .update({
            final_result: 'مستبعد',
            exclusion_reason: exclusionReason,
            decision_date: new Date().toISOString(),
            decision_by: currentUser?.name || 'مدير النظام'
          })
          .eq('id', candidate.id)
          .select()
          .single()

        if (error) {
          console.error('خطأ في تحديث المرشح:', error)
          throw error
        }

        // تحديث الحالة المحلية - تحويل البيانات من snake_case إلى camelCase
        set(state => ({
          savedCandidates: state.savedCandidates.map(saved =>
            saved.id === candidate.id ? {
              id: data.id,
              name: data.name,
              nationalId: data.national_id,
              birthDate: data.birth_date,
              governorate: data.governorate,
              qualification: data.qualification,
              maritalStatus: data.marital_status,
              securityCompany: data.security_company,
              offerDate: data.offer_date,
              finalResult: data.final_result,
              decisionDate: data.decision_date,
              decisionBy: data.decision_by,
              notes: data.notes,
              exclusionReason: data.exclusion_reason,
              resignationReason: data.resignation_reason,
              isRejectedBefore: data.is_rejected_before,
              previousRejectionDate: data.previous_rejection_date,
              createdAt: data.created_at
            } : saved
          )
        }))

        alert('تم استبعاد المرشح بنجاح')
        setShowExclusionModal(false)
        setExclusionReason('')
      } catch (error) {
        console.error('خطأ في استبعاد المرشح:', error)
        alert('حدث خطأ في استبعاد المرشح')
      }
    }
  }

  const handleResignationSubmit = async () => {
    if (!resignationReason.trim()) {
      alert('يرجى كتابة سبب الاستقالة')
      return
    }

    const candidate = savedCandidates.find(c => c.id === selectedCandidateId)
    if (candidate) {
      try {
        // تحديث المرشح المحفوظ مباشرة في Supabase
        const { data, error } = await supabase
          .from('saved_candidates')
          .update({
            final_result: 'استقالة',
            resignation_reason: resignationReason,
            decision_date: new Date().toISOString(),
            decision_by: currentUser?.name || 'مدير النظام'
          })
          .eq('id', candidate.id)
          .select()
          .single()

        if (error) {
          console.error('خطأ في تحديث المرشح:', error)
          throw error
        }

        // تحديث الحالة المحلية - تحويل البيانات من snake_case إلى camelCase
        set(state => ({
          savedCandidates: state.savedCandidates.map(saved =>
            saved.id === candidate.id ? {
              id: data.id,
              name: data.name,
              nationalId: data.national_id,
              birthDate: data.birth_date,
              governorate: data.governorate,
              qualification: data.qualification,
              maritalStatus: data.marital_status,
              securityCompany: data.security_company,
              offerDate: data.offer_date,
              finalResult: data.final_result,
              decisionDate: data.decision_date,
              decisionBy: data.decision_by,
              notes: data.notes,
              exclusionReason: data.exclusion_reason,
              resignationReason: data.resignation_reason,
              isRejectedBefore: data.is_rejected_before,
              previousRejectionDate: data.previous_rejection_date,
              createdAt: data.created_at
            } : saved
          )
        }))

        alert('تم تسجيل استقالة المرشح بنجاح')
        setShowResignationModal(false)
        setResignationReason('')
      } catch (error) {
        console.error('خطأ في تسجيل استقالة المرشح:', error)
        alert('حدث خطأ في تسجيل استقالة المرشح')
      }
    }
  }

  // وظيفة حذف البيانات المكررة
  const handleRemoveDuplicates = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع البيانات المكررة؟\nسيتم الاحتفاظ بأحدث سجل لكل مرشح.')) return
    
    try {
      const removedCount = await removeDuplicateSavedCandidates()
      if (removedCount > 0) {
        alert(`تم حذف ${removedCount} سجل مكرر بنجاح`)
      } else {
        alert('لا توجد بيانات مكررة للحذف')
      }
    } catch (error) {
      console.error('خطأ في حذف البيانات المكررة:', error)
      alert('حدث خطأ في حذف البيانات المكررة')
    }
  }

  // وظيفة تصدير البيانات إلى Excel
  const exportToExcel = () => {
    const headers = [
      'الاسم', 'الرقم القومي', 'المحافظة', 'المؤهل', 'اسم الشركة', 'الوظيفة',
      'النتيجة النهائية', 'تاريخ القرار', 'قرار من', 'الملاحظات', 'حالة سابقة', 'السبب'
    ]

    const data = filteredCandidates.map(candidate => [
      candidate.name,
      candidate.nationalId,
      candidate.governorate,
      candidate.qualification,
      candidate.securityCompany,
      candidate.position || '',
      candidate.finalResult,
      new Date(candidate.decisionDate).toLocaleDateString('en-GB'),
      candidate.decisionBy,
      candidate.notes || '',
      candidate.isRejectedBefore ? 'مرفوض سابقاً' : 'جديد',
      candidate.exclusionReason ? `استبعاد: ${candidate.exclusionReason}` : 
      candidate.resignationReason ? `استقالة: ${candidate.resignationReason}` : 'لا يوجد'
    ])

    // إنشاء CSV
    const csvContent = [headers, ...data]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // تحميل الملف
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `candidates_database_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
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

            {/* زر التصدير */}
            <button
              onClick={exportToExcel}
              style={{
                backgroundColor: '#27ae60',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              تصدير Excel
            </button>

            {/* زر حذف البيانات المكررة */}
            {canDelete && (
              <button
                onClick={handleRemoveDuplicates}
                style={{
                  backgroundColor: '#e67e22',
                  color: 'white',
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                حذف المكررات
              </button>
            )}

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
              title="فلتر النتائج"
            >
              <option value="all">جميع النتائج</option>
              <option value="مقبول">مقبول</option>
              <option value="مرفوض">مرفوض</option>
              <option value="مستبعد">مستبعد</option>
            </select>

            {/* فلتر الشركة */}
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
              title="فلتر الشركة"
            >
              <option value="">جميع الشركات</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>

            {/* أزرار الحذف */}
            {canDelete && selectedCandidates.length > 0 && (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  حذف المحدد ({selectedCandidates.length})
                </button>
                <button
                  onClick={() => setSelectedCandidates([])}
                  style={{
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  إلغاء التحديد
                </button>
              </>
            )}
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

        {/* نافذة تأكيد الحذف */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '400px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#e74c3c', marginBottom: '20px' }}>
                تأكيد الحذف
              </h3>
              <p style={{ marginBottom: '20px' }}>
                هل أنت متأكد من حذف {selectedCandidates.length} مرشح؟
                <br />
                <strong>هذا الإجراء لا يمكن التراجع عنه!</strong>
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={handleDeleteSelected}
                  style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  نعم، احذف
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
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
                {canDelete && (
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                    <input
                      type="checkbox"
                      checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                      onChange={handleSelectAll}
                      style={{ transform: 'scale(1.2)' }}
                      aria-label="تحديد الكل"
                      title="تحديد الكل"
                    />
                  </th>
                )}
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
                  اسم الشركة
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  الوظيفة
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  الوردية
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
                  الملاحظات
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  حالة سابقة
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                  السبب
                </th>
                {canDelete && (
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>
                    الإجراءات
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map(candidate => (
                <tr key={candidate.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  {canDelete && (
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleSelectCandidate(candidate.id)}
                        style={{ transform: 'scale(1.2)' }}
                        aria-label={`تحديد ${candidate.name}`}
                        title={`تحديد ${candidate.name}`}
                      />
                    </td>
                  )}
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
                  <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#3498db' }}>
                    {candidate.securityCompany}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.position || '-'}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.workShift || '-'}
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
                    {candidate.notes || '-'}
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
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {candidate.exclusionReason && (
                      <div style={{ fontSize: '12px', color: '#f39c12' }}>
                        <strong>استبعاد:</strong> {candidate.exclusionReason}
                      </div>
                    )}
                    {candidate.resignationReason && (
                      <div style={{ fontSize: '12px', color: '#9b59b6' }}>
                        <strong>استقالة:</strong> {candidate.resignationReason}
                      </div>
                    )}
                    {!candidate.exclusionReason && !candidate.resignationReason && (
                      <span style={{ color: '#95a5a6', fontSize: '12px' }}>
                        لا يوجد
                      </span>
                    )}
                  </td>
                  {canDelete && (
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleExclusionClick(candidate.id)}
                          style={{
                            backgroundColor: '#f39c12',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          استبعاد
                        </button>
                        <button
                          onClick={() => handleResignationClick(candidate.id)}
                          style={{
                            backgroundColor: '#9b59b6',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          استقالة
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(candidate.id)}
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
                          حذف
                        </button>
                      </div>
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
            <p>لا توجد بيانات محفوظة متطابقة مع البحث</p>
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
              <strong>ملاحظة:</strong> أزرار الحذف والاختيار متاحة فقط للمديرين (الأدمن). 
              نوع المستخدم الحالي: <strong>{currentUser?.userType}</strong>
            </p>
          </div>
        )}

        {/* نافذة استبعاد المرشح */}
        {showExclusionModal && (
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
              <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>استبعاد المرشح</h3>
              <p style={{ margin: '0 0 15px 0', color: '#7f8c8d' }}>
                يرجى كتابة سبب الاستبعاد:
              </p>
              <textarea
                value={exclusionReason}
                onChange={(e) => setExclusionReason(e.target.value)}
                placeholder="اكتب سبب الاستبعاد هنا..."
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  resize: 'vertical',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowExclusionModal(false)}
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
                  onClick={handleExclusionSubmit}
                  style={{
                    backgroundColor: '#f39c12',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  تأكيد الاستبعاد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* نافذة استقالة المرشح */}
        {showResignationModal && (
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
              <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>تسجيل استقالة المرشح</h3>
              <p style={{ margin: '0 0 15px 0', color: '#7f8c8d' }}>
                يرجى كتابة سبب الاستقالة:
              </p>
              <textarea
                value={resignationReason}
                onChange={(e) => setResignationReason(e.target.value)}
                placeholder="اكتب سبب الاستقالة هنا..."
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  resize: 'vertical',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowResignationModal(false)}
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
                  onClick={handleResignationSubmit}
                  style={{
                    backgroundColor: '#9b59b6',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  تأكيد الاستقالة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}

export default DatabasePage
