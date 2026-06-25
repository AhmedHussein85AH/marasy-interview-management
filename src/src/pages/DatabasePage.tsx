import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { supabase } from '../integrations/supabase/client'
import { Bell, Download, Trash2, AlertTriangle, Search, UserMinus, LogOut as Resign } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { GOVERNORATES } from '../constants/lists'
import { useEditableLists } from '../hooks/useEditableLists'
import MultiSelect from '../components/MultiSelect'
import { usePermissions } from '../hooks/usePermissions'

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

  const { t, i18n } = useTranslation()
  const dir = i18n.language === 'en' ? 'ltr' : 'rtl'
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterResult, setFilterResult] = useState<string[]>([])
  const [filterCompany, setFilterCompany] = useState<string[]>([])
  const [filterPosition, setFilterPosition] = useState<string[]>([])
  const [filterGovernorate, setFilterGovernorate] = useState<string[]>([])
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
    if (searchQuery) filtered = searchSavedCandidates(searchQuery)
    if (filterCompany.length > 0) filtered = filtered.filter(c => filterCompany.includes(c.securityCompany))
    if (filterPosition.length > 0) filtered = filtered.filter(c => filterPosition.includes(c.position || ''))
    if (filterGovernorate.length > 0) filtered = filtered.filter(c => filterGovernorate.includes(c.governorate))
    if (filterResult.length > 0) filtered = filtered.filter(c => filterResult.includes(c.finalResult))
    setFilteredCandidates(filtered)
  }, [searchQuery, filterResult, filterCompany, filterPosition, filterGovernorate, savedCandidates])

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

  const canViewDatabase = currentUser?.userType === 'security_employee' || currentUser?.userType === 'interview_manager' || currentUser?.userType === 'admin'
  const canDelete = currentUser?.userType === 'admin'

  const uniqueCompanies = Array.from(new Set(savedCandidates.map(c => c.securityCompany))).filter(Boolean)
  const { allPositions } = useEditableLists()

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
              position: data.position,
              offerDate: data.offer_date,
              finalResult: data.final_result,
              decisionDate: data.decision_date,
              decisionBy: data.decision_by,
              notes: data.notes,
              workShift: data.work_shift,
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
              position: data.position,
              offerDate: data.offer_date,
              finalResult: data.final_result,
              decisionDate: data.decision_date,
              decisionBy: data.decision_by,
              notes: data.notes,
              workShift: data.work_shift,
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
      'الاسم', 'الرقم القومي', 'تاريخ الميلاد', 'المحافظة', 'المؤهل',
      'الحالة الاجتماعية', 'اسم الشركة', 'الوظيفة', 'الوردية', 'الموبايل',
      'النتيجة النهائية', 'تاريخ القرار', 'قرار من', 'الملاحظات',
      'حالة سابقة', 'السبب'
    ]

    const source = filteredCandidates.length < savedCandidates.length
      ? filteredCandidates
      : savedCandidates

    const data = source.map(candidate => [
      candidate.name,
      candidate.nationalId,
      candidate.birthDate || '',
      candidate.governorate,
      candidate.qualification,
      candidate.maritalStatus || '',
      candidate.securityCompany,
      candidate.position || '',
      candidate.workShift || '',
      (candidate as any).phone || '',
      candidate.finalResult,
      new Date(candidate.decisionDate).toLocaleDateString('en-GB'),
      candidate.decisionBy,
      candidate.notes || '',
      candidate.isRejectedBefore ? 'مرفوض سابقاً' : 'جديد',
      candidate.exclusionReason ? `استبعاد: ${candidate.exclusionReason}` :
      candidate.resignationReason ? `استقالة: ${candidate.resignationReason}` : '—'
    ])

    const csvContent = [headers, ...data]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `database_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }



  const RESULT_BADGE: Record<string, string> = {
    'مقبول':   'badge badge-success',
    'مرفوض':   'badge badge-danger',
    'مستبعد':  'badge badge-warning',
    'استقالة': 'badge badge-purple',
  }

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
      <div className="page-wrapper" style={{ direction: dir }}>

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('database.title')}</h1>
            <p className="page-subtitle">{filteredCandidates.length} {t('candidates.count', 'سجل')}</p>
          </div>
          <div className="page-header-actions">
            <button
              className={`btn btn-sm ${unreadNotifications.length > 0 ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ position: 'relative' }}
            >
              <Bell size={14} />
              {unreadNotifications.length > 0 && (
                <span className="notif-dot" style={{ position: 'absolute', top: '-6px', left: '-6px' }}>
                  {unreadNotifications.length}
                </span>
              )}
              {t('database.notifications')}
            </button>
            <button className="btn btn-success btn-sm" onClick={exportToExcel}>
              <Download size={14} /> {t('database.exportExcel')}
            </button>
            {canDelete && (
              <button className="btn btn-sm" style={{ background: '#e67e22', color: 'white' }} onClick={handleRemoveDuplicates}>
                {t('database.removeDuplicates')}
              </button>
            )}
            {canDelete && selectedCandidates.length > 0 && (
              <>
                <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={13} /> {t('database.deleteSelected')} ({selectedCandidates.length})
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedCandidates([])}>{t('database.unselect')}</button>
              </>
            )}
            <button className="btn btn-ghost btn-sm print-hidden" onClick={() => window.print()}>
              🖨️ {selectedCandidates.length > 0 ? `${t('general.print')} (${selectedCandidates.length})` : t('general.print')}
            </button>
          </div>
        </div>

        {/* ── Stats mini ── */}
        <div className="stats-mini">
          {[
            { label: t('status.accepted'),  value: getSavedCandidatesByResult('مقبول').length,  color: 'hsl(var(--success))' },
            { label: t('status.rejected'),  value: getSavedCandidatesByResult('مرفوض').length,  color: 'hsl(var(--danger))' },
            { label: t('status.excluded'),  value: getSavedCandidatesByResult('مستبعد').length, color: 'hsl(var(--warning))' },
            { label: i18n.language === 'en' ? 'Total' : 'الإجمالي', value: savedCandidates.length, color: 'hsl(var(--primary))' },
          ].map(s => (
            <div key={s.label} className="stats-mini-card">
              <div className="value" style={{ color: s.color }}>{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Notifications panel ── */}
        {showNotifications && (
          <div className="section-card slide-down" style={{ marginBottom: '16px' }}>
            <div className="section-card-header">
              <h3>الإشعارات ({unreadNotifications.length} غير مقروء)</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNotifications(false)}>✕</button>
            </div>
            <div className="section-card-body" style={{ padding: '12px 16px' }}>
              {unreadNotifications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {unreadNotifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'hsl(38 100% 94%)', borderRadius: '8px', border: '1px solid hsl(38 92% 80%)' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'hsl(38 60% 35%)', fontSize: '13px' }}>{n.title}</div>
                        <div style={{ color: 'hsl(38 60% 45%)', fontSize: '12px', marginTop: '2px' }}>{n.message}</div>
                      </div>
                      <button className="btn btn-success btn-sm" onClick={() => markNotificationAsRead(n.id)}>تم القراءة</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'hsl(var(--muted-foreground))', textAlign: 'center', margin: '8px 0', fontSize: '13px' }}>لا توجد إشعارات جديدة</p>
              )}
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="filter-bar print-hidden">
          <div className="search-box">
            <Search size={14} />
            <input className="form-input" style={{ width: '220px' }} type="text" placeholder="بحث في قاعدة البيانات..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <MultiSelect options={['مقبول','مرفوض','مستبعد','استقالة']} selectedValues={filterResult} onChange={setFilterResult} placeholder={t('database.columns.finalResult')} />
          <MultiSelect options={uniqueCompanies} selectedValues={filterCompany} onChange={setFilterCompany} placeholder={t('database.columns.company')} />
          <MultiSelect options={allPositions} selectedValues={filterPosition} onChange={setFilterPosition} placeholder={t('database.columns.position')} />
          <MultiSelect options={GOVERNORATES} selectedValues={filterGovernorate} onChange={setFilterGovernorate} placeholder={t('database.columns.governorate')} />
        </div>

        {/* ── Selection bar ── */}
        {selectedCandidates.length > 0 && (
          <div className="selection-bar">
            تم تحديد {selectedCandidates.length} سجل
            <button onClick={() => setSelectedCandidates([])} style={{ marginRight: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'inherit', fontFamily: 'inherit' }}>إلغاء التحديد</button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="section-card">
          <div style={{ overflowX: 'auto' }}>
            <table className={`data-table${selectedCandidates.length > 0 ? ' has-selection' : ''}`}>
              <thead>
                <tr>
                  {canDelete && (
                    <th style={{ width: '40px' }}>
                      <input type="checkbox" checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0} onChange={handleSelectAll} style={{ cursor: 'pointer' }} aria-label="تحديد الكل" />
                    </th>
                  )}
                  {[
                    t('database.columns.name'), t('database.columns.nationalId'),
                    t('database.columns.governorate'), t('database.columns.qualification'),
                    t('database.columns.company'), t('database.columns.position'),
                    t('database.columns.shift'), t('candidates.columns.mobile'),
                    t('database.columns.finalResult'),
                    t('database.columns.decisionDate'), t('database.columns.decisionBy'),
                    t('database.columns.notes'), t('database.columns.previousStatus'),
                    t('database.columns.reason')
                  ].map(h => <th key={h}>{h}</th>)}
                  {canDelete && <th>{t('database.columns.actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map(candidate => (
                  <tr key={candidate.id} className={selectedCandidates.includes(candidate.id) ? 'selected' : ''}>
                    {canDelete && (
                      <td>
                        <input type="checkbox" checked={selectedCandidates.includes(candidate.id)} onChange={() => handleSelectCandidate(candidate.id)} style={{ cursor: 'pointer' }} aria-label={`تحديد ${candidate.name}`} />
                      </td>
                    )}
                    <td>
                      <div className="name-cell">
                        <span style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                          {candidate.name}
                          {candidate.isRejectedBefore && (
                            <span title={`مرفوض من قبل في ${candidate.previousRejectionDate}`} style={{ marginRight: '4px', color: 'hsl(var(--warning))' }}>⚠</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="mono">{candidate.nationalId}</td>
                    <td>{candidate.governorate}</td>
                    <td>{candidate.qualification}</td>
                    <td className="primary">{candidate.securityCompany}</td>
                    <td className="muted">{candidate.position || '—'}</td>
                    <td>{candidate.workShift ? <span className="badge badge-info">{candidate.workShift}</span> : <span className="muted">—</span>}</td>
                    <td className="mono">{(candidate as any).phone || '—'}</td>
                    <td>
                      <span className={RESULT_BADGE[candidate.finalResult] || 'badge badge-muted'}>
                        {candidate.finalResult}
                      </span>
                    </td>
                    <td className="muted">{new Date(candidate.decisionDate).toLocaleDateString('en-GB')}</td>
                    <td className="muted">{candidate.decisionBy}</td>
                    <td className="muted" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{candidate.notes || '—'}</td>
                    <td>
                      {candidate.isRejectedBefore
                        ? <span className="badge badge-warning">مرفوض سابقاً</span>
                        : <span className="badge badge-muted">جديد</span>}
                    </td>
                    <td className="muted" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {candidate.exclusionReason ? `استبعاد: ${candidate.exclusionReason}` :
                       candidate.resignationReason ? `استقالة: ${candidate.resignationReason}` : '—'}
                    </td>
                    {canDelete && (
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-ghost btn-sm" title="استبعاد" style={{ color: 'hsl(var(--warning))' }} onClick={() => handleExclusionClick(candidate.id)}>
                            <UserMinus size={13} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="استقالة" style={{ color: 'hsl(var(--purple))' }} onClick={() => handleResignationClick(candidate.id)}>
                            <Resign size={13} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="حذف" style={{ color: 'hsl(var(--danger))' }} onClick={() => handleDeleteSingle(candidate.id)}>
                            <Trash2 size={13} />
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
            <div className="empty-state">
              <div className="empty-state-icon">🗄️</div>
              لا توجد سجلات مطابقة
            </div>
          )}
        </div>

        {/* ── Delete confirm modal ── */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-box scale-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
              <div className="modal-header" style={{ justifyContent: 'center' }}>
                <AlertTriangle size={32} color="hsl(var(--danger))" />
              </div>
              <div className="modal-body">
                <h3 style={{ color: 'hsl(var(--danger))', marginBottom: '10px' }}>تأكيد الحذف</h3>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>
                  هل أنت متأكد من حذف {selectedCandidates.length} سجل؟ هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
              <div className="modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-danger" onClick={handleDeleteSelected}>نعم، احذف</button>
                <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Exclusion modal ── */}
        {showExclusionModal && (
          <div className="modal-overlay">
            <div className="modal-box scale-in">
              <div className="modal-header">
                <h3>سبب الاستبعاد</h3>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} onClick={() => setShowExclusionModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <label className="form-label">اكتب سبب الاستبعاد *</label>
                <textarea className="form-input" value={exclusionReason} onChange={e => setExclusionReason(e.target.value)} placeholder="سبب الاستبعاد..." style={{ height: '100px', resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowExclusionModal(false)}>إلغاء</button>
                <button className="btn btn-warning" style={{ background: 'hsl(var(--warning))', color: 'white' }} onClick={handleExclusionSubmit}>تأكيد الاستبعاد</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Resignation modal ── */}
        {showResignationModal && (
          <div className="modal-overlay">
            <div className="modal-box scale-in">
              <div className="modal-header">
                <h3>سبب الاستقالة</h3>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} onClick={() => setShowResignationModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <label className="form-label">اكتب سبب الاستقالة *</label>
                <textarea className="form-input" value={resignationReason} onChange={e => setResignationReason(e.target.value)} placeholder="سبب الاستقالة..." style={{ height: '100px', resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowResignationModal(false)}>إلغاء</button>
                <button className="btn btn-primary" style={{ background: 'hsl(var(--purple))', color: 'white' }} onClick={handleResignationSubmit}>تأكيد الاستقالة</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedLayout>
  )
}

export default DatabasePage
