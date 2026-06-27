import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { GOVERNORATES } from '../constants/lists'
import { useEditableLists } from '../hooks/useEditableLists'
import { usePermissions } from '../hooks/usePermissions'
import SelectOrAdd from '../components/SelectOrAdd'
import MultiSelect from '../components/MultiSelect'
import { CheckCircle, Pencil, ListChecks, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EMPTY_CANDIDATE = {
  name: '', nationalId: '', birthDate: '', governorate: '',
  qualification: '', maritalStatus: 'أعزب' as const,
  securityCompany: '', position: '', phone: '', offerDate: '',
  offerResult: 'في انتظار' as const,
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="form-label">{label}</label>
    {children}
  </div>
)

const CandidatesPage: React.FC = () => {
  const { currentUser, candidates, addCandidate, updateCandidateStatus, deleteCandidate, searchCandidates, saveCandidateToDatabase, updateCandidate } = useStore()
  const { t, i18n } = useTranslation()

  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCompany, setFilterCompany] = useState<string[]>([])
  const [filterPosition, setFilterPosition] = useState<string[]>([])
  const [filterGovernorate, setFilterGovernorate] = useState<string[]>([])
  const [filterResult, setFilterResult] = useState<string[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState(candidates)
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [decisionResult, setDecisionResult] = useState<'مقبول' | 'مرفوض' | 'مستبعد' | ''>('')
  const [decisionNotes, setDecisionNotes] = useState('')
  const [workShift, setWorkShift] = useState<'نهار' | 'ليل' | ''>('')
  const [workLocation, setWorkLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [exclusionReason, setExclusionReason] = useState('')
  const [newCandidate, setNewCandidate] = useState(EMPTY_CANDIDATE)
  const [editCandidate, setEditCandidate] = useState<any>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [bulkField, setBulkField] = useState('')
  const [bulkValue, setBulkValue] = useState('')

  useEffect(() => {
    let filtered = searchQuery ? searchCandidates(searchQuery) : candidates
    if (filterCompany.length > 0) filtered = filtered.filter(c => filterCompany.includes(c.securityCompany))
    if (filterPosition.length > 0) filtered = filtered.filter(c => filterPosition.includes(c.position || ''))
    if (filterGovernorate.length > 0) filtered = filtered.filter(c => filterGovernorate.includes(c.governorate))
    if (filterResult.length > 0) filtered = filtered.filter(c => filterResult.includes(c.offerResult))
    setFilteredCandidates(filtered)
  }, [searchQuery, filterCompany, filterPosition, filterGovernorate, filterResult, candidates])

  const handleAddCandidate = () => {
    if (!newCandidate.name || !newCandidate.nationalId || !newCandidate.birthDate || !newCandidate.governorate || !newCandidate.qualification) {
      alert(t('candidates.alerts.fillRequired', 'يرجى ملء جميع الحقول المطلوبة'))
      return
    }
    addCandidate({ ...newCandidate, createdBy: currentUser?.name || 'Unknown' })
    setNewCandidate(EMPTY_CANDIDATE)
    setShowAddForm(false)
    alert(t('candidates.alerts.addSuccess', 'تم إضافة المرشح بنجاح'))
  }

  const handleStatusUpdate = (id: string, _status: string, result: string) => {
    const candidate = candidates.find(c => c.id === id)
    if (candidate) {
      setSelectedCandidate(candidate)
      setDecisionResult(result as 'مقبول' | 'مرفوض' | 'مستبعد')
      setDecisionNotes('')
      setWorkShift('')
      setWorkLocation('')
      setStartDate('')
      setRejectionReason('')
      setExclusionReason('')
      setShowDecisionModal(true)
    }
  }

  const handleSubmitDecision = async () => {
    if (!selectedCandidate || !decisionResult) return
    try {
      // دمج كل المعلومات في الملاحظات
      const fullNotes = [
        decisionNotes,
        decisionResult === 'مقبول' && workLocation ? `الموقع: ${workLocation}` : '',
        decisionResult === 'مقبول' && startDate ? `تاريخ البداية: ${startDate}` : '',
        decisionResult === 'مرفوض' && rejectionReason ? `سبب الرفض: ${rejectionReason}` : '',
        decisionResult === 'مستبعد' && exclusionReason ? `سبب الاستبعاد: ${exclusionReason}` : '',
      ].filter(Boolean).join(' | ') || undefined

      await updateCandidateStatus(
        selectedCandidate.id,
        decisionResult === 'مقبول' ? 'تم التوظيف' : decisionResult === 'مرفوض' ? 'مرفوض' : 'مستبعد',
        decisionResult as any,
        fullNotes,
        workShift as 'نهار' | 'ليل' || undefined
      )
      if (['مقبول', 'مرفوض', 'مستبعد'].includes(decisionResult)) {
        const updated = candidates.find(c => c.id === selectedCandidate.id)
        if (updated) await saveCandidateToDatabase(updated, decisionResult as any, fullNotes, workShift as 'نهار' | 'ليل' || undefined, decisionResult === 'مستبعد' ? exclusionReason : undefined)
      }
      alert(t('candidates.alerts.statusUpdated', 'تم تحديث حالة المرشح وحفظه في قاعدة البيانات بنجاح'))
      setShowDecisionModal(false)
      setSelectedCandidate(null)
      setDecisionResult('')
      setDecisionNotes('')
      setWorkShift('')
      setWorkLocation('')
      setStartDate('')
      setRejectionReason('')
      setExclusionReason('')
    } catch (error) {
      console.error('Error saving decision:', error)
      alert(t('candidates.alerts.statusUpdateError', 'حدث خطأ في حفظ القرار'))
    }
  }

  const handleDeleteCandidate = (id: string) => {
    if (window.confirm(t('candidates.alerts.confirmDelete', 'هل أنت متأكد من حذف هذا المرشح؟'))) {
      deleteCandidate(id)
      alert(t('candidates.alerts.deleteSuccess', 'تم حذف المرشح بنجاح'))
    }
  }

  const handleEditSubmit = async () => {
    if (!editCandidate) return
    try {
      await updateCandidate(editCandidate.id, {
        name: editCandidate.name,
        nationalId: editCandidate.nationalId,
        birthDate: editCandidate.birthDate,
        governorate: editCandidate.governorate,
        qualification: editCandidate.qualification,
        maritalStatus: editCandidate.maritalStatus,
        securityCompany: editCandidate.securityCompany,
        position: editCandidate.position,
        phone: editCandidate.phone,
        offerDate: editCandidate.offerDate,
        workShift: editCandidate.workShift,
        notes: editCandidate.notes,
      })
      alert(t('candidates.alerts.updateSuccess', 'تم تحديث بيانات المرشح بنجاح'))
      setEditCandidate(null)
    } catch {
      alert(t('candidates.alerts.updateError', 'حدث خطأ في تحديث البيانات'))
    }
  }

  const handleBulkEdit = async () => {
    if (!bulkField || !bulkValue || selectedIds.length === 0) return
    try {
      await Promise.all(selectedIds.map(id => updateCandidate(id, { [bulkField]: bulkValue } as any)))
      alert(t('candidates.alerts.bulkUpdateSuccess', 'تم تحديث {{count}} مرشح بنجاح', { count: selectedIds.length }))
      setShowBulkEdit(false)
      setSelectedIds([])
      setBulkField('')
      setBulkValue('')
    } catch {
      alert(t('candidates.alerts.bulkUpdateError', 'حدث خطأ في التحديث'))
    }
  }

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleSelectAll = () =>
    setSelectedIds(prev => prev.length === filteredCandidates.length ? [] : filteredCandidates.map(c => c.id))
  const perms = usePermissions()
  const canAddCandidate = perms.canAddCandidates
  const canUpdateStatus = perms.canApproveCandidates
  const canEdit = perms.canEditCandidates
  const canDelete = perms.canDeleteCandidates
  const uniqueCompanies = Array.from(new Set(candidates.map(c => c.securityCompany))).filter(Boolean)
  const { allCompanies, allPositions, addCompany, addPosition } = useEditableLists()

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewCandidate(prev => ({ ...prev, [key]: e.target.value }))


  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
      <div className="page-wrapper" style={{ direction: i18n.language === 'en' ? 'ltr' : 'rtl' }}>

        {/* ── Page header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('candidates.title')}</h1>
            <p className="page-subtitle">{filteredCandidates.length} {t('candidates.count', 'مرشح')}</p>
          </div>
          <div className="page-header-actions">
            <div className="search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input className="form-input" style={{ width: '220px' }} type="text" placeholder={t('candidates.search', 'بحث...')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {canAddCandidate && (
              <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                {t('candidates.addCandidate', 'إضافة مرشح')}
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Printer size={14} /> {selectedIds.length > 0 ? `${t('general.print')} (${selectedIds.length})` : t('general.print', 'طباعة')}
            </button>
            {canEdit && selectedIds.length > 0 && (
              <button className="btn btn-sm" style={{ background: '#8b5cf6', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '5px' }} onClick={() => setShowBulkEdit(true)}>
                <ListChecks size={14} /> {t('candidates.bulkEdit', 'تعديل جماعي')} ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* ── Selection bar ── */}
        {selectedIds.length > 0 && (
          <div className="selection-bar">
            <CheckCircle size={15} />
            تم تحديد {selectedIds.length} مرشح
            <button onClick={() => setSelectedIds([])} style={{ marginRight: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'inherit', fontFamily: 'inherit' }}>إلغاء التحديد</button>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="filter-bar print-hidden">
          <MultiSelect options={uniqueCompanies} selectedValues={filterCompany} onChange={setFilterCompany} placeholder={t('candidates.columns.company', 'الشركة')} />
          <MultiSelect options={allPositions} selectedValues={filterPosition} onChange={setFilterPosition} placeholder={t('candidates.columns.position', 'الوظيفة')} />
          <MultiSelect options={GOVERNORATES} selectedValues={filterGovernorate} onChange={setFilterGovernorate} placeholder={t('candidates.columns.governorate', 'المحافظة')} />
          <MultiSelect options={['مقبول','مرفوض','مستبعد','في انتظار']} selectedValues={filterResult} onChange={setFilterResult} placeholder={t('candidates.columns.status', 'النتيجة')} />
        </div>

        {/* ── Add form ── */}
        {showAddForm && (
          <div className="section-card" style={{ marginBottom: '20px' }}>
            <div className="section-card-header">
              <h3>{t('candidates.addCandidate', 'إضافة مرشح جديد')}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>إلغاء</button>
            </div>
            <div className="section-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <Field label={t('candidates.columns.name','الاسم') + ' *'}><input className="form-input" type="text" value={newCandidate.name} onChange={set('name')} placeholder={t('candidates.columns.name','الاسم الكامل')} /></Field>
                <Field label={t('candidates.columns.nationalId','الرقم القومي') + ' *'}><input className="form-input" type="text" value={newCandidate.nationalId} onChange={set('nationalId')} placeholder="14 رقم" /></Field>
                <Field label={t('candidates.columns.birthDate','تاريخ الميلاد') + ' *'}><input className="form-input" type="date" value={newCandidate.birthDate} onChange={set('birthDate')} /></Field>
                <Field label={t('candidates.columns.governorate','المحافظة') + ' *'}>
                  <select className="form-input" value={newCandidate.governorate} onChange={set('governorate')}>
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label={t('candidates.columns.qualification','المؤهل') + ' *'}><input className="form-input" type="text" value={newCandidate.qualification} onChange={set('qualification')} /></Field>
                <Field label={t('candidates.columns.maritalStatus','الحالة الاجتماعية')}>
                  <select className="form-input" value={newCandidate.maritalStatus} onChange={set('maritalStatus')}>
                    {['أعزب','متزوج','مطلق','أرمل'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label={t('candidates.columns.company','شركة الأمن')}>
                  <SelectOrAdd value={newCandidate.securityCompany} options={allCompanies} onChange={v => setNewCandidate(p => ({...p, securityCompany: v}))} onAddNew={addCompany} placeholder="اختر الشركة" />
                </Field>
                <Field label={t('candidates.columns.position','الوظيفة')}>
                  <SelectOrAdd value={newCandidate.position} options={allPositions} onChange={v => setNewCandidate(p => ({...p, position: v}))} onAddNew={addPosition} placeholder="اختر الوظيفة" />
                </Field>
                <Field label={t('candidates.columns.mobile','الموبايل')}><input className="form-input" type="tel" value={newCandidate.phone} onChange={set('phone')} placeholder="01xxxxxxxxx" /></Field>
                <Field label={t('candidates.columns.addDate','تاريخ العرض')}><input className="form-input" type="date" value={newCandidate.offerDate} onChange={set('offerDate')} /></Field>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-success" onClick={handleAddCandidate}><CheckCircle size={14} /> {t('candidates.addCandidate','إضافة المرشح')}</button>
                <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="section-card">
          <div style={{ overflowX: 'auto' }}>
            <table className={`data-table${selectedIds.length > 0 ? ' has-selection' : ''}`}>
              <thead>
                <tr>
                  {canEdit && <th className="print-hidden" style={{ width: '40px' }}>
                    <input type="checkbox" checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer', accentColor: '#8b5cf6' }} />
                  </th>}
                  {[t('candidates.columns.name','الاسم'), t('candidates.columns.nationalId','الرقم القومي'), t('candidates.columns.birthDate','تاريخ الميلاد'), t('candidates.columns.governorate','المحافظة'), t('candidates.columns.qualification','المؤهل'), t('candidates.columns.maritalStatus','الحالة'), t('candidates.columns.company','الشركة'), t('candidates.columns.position','الوظيفة'), t('candidates.columns.mobile','الموبايل'), t('candidates.columns.status','النتيجة')].map(h => <th key={h}>{h}</th>)}
                  {canUpdateStatus && <th className="print-hidden">{t('candidates.columns.actions','الإجراءات')}</th>}
                  {canEdit && <th className="print-hidden">{t('actions.edit','تعديل')}</th>}
                  {canDelete && <th className="print-hidden">{t('actions.delete','حذف')}</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map(candidate => (
                  <tr key={candidate.id} className={selectedIds.includes(candidate.id) ? 'selected' : ''}>
                    {canEdit && <td className="print-hidden"><input type="checkbox" checked={selectedIds.includes(candidate.id)} onChange={() => toggleSelect(candidate.id)} style={{ cursor: 'pointer', accentColor: '#8b5cf6' }} /></td>}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                          {candidate.name}
                          {candidate.isRejectedBefore && <span title={`مرفوض من قبل في ${candidate.previousRejectionDate}`} style={{ marginRight: '4px', color: 'hsl(var(--warning))' }}>⚠</span>}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{candidate.nationalId}</td>
                    <td>{candidate.birthDate}</td>
                    <td>{candidate.governorate}</td>
                    <td>{candidate.qualification}</td>
                    <td>{candidate.maritalStatus}</td>
                    <td style={{ fontWeight: 600, color: 'hsl(var(--primary))' }}>{candidate.securityCompany}</td>
                    <td>{candidate.position || <span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span>}</td>
                    <td>{(candidate as any).phone || <span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span>}</td>
                    <td>
                      <span className={candidate.offerResult === 'مقبول' ? 'badge badge-success' : candidate.offerResult === 'مرفوض' ? 'badge badge-danger' : candidate.offerResult === 'مستبعد' ? 'badge badge-warning' : 'badge badge-info'}>
                        {candidate.offerResult}
                      </span>
                    </td>
                    {canUpdateStatus && (
                      <td className="print-hidden">
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(candidate.id,'تم التوظيف','مقبول')}>قبول</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(candidate.id,'مرفوض','مرفوض')}>رفض</button>
                          <button className="btn btn-warning btn-sm" onClick={() => handleStatusUpdate(candidate.id,'مستبعد','مستبعد')}>استبعاد</button>
                        </div>
                      </td>
                    )}
                    {canEdit && (
                      <td className="print-hidden">
                        <button className="btn btn-ghost btn-sm" style={{ color: 'hsl(var(--primary))' }} onClick={() => setEditCandidate({...candidate})}>
                          <Pencil size={13} />
                        </button>
                      </td>
                    )}
                    {canDelete && (
                      <td className="print-hidden">
                        <button className="btn btn-ghost btn-sm" style={{ color: 'hsl(var(--danger))' }} onClick={() => handleDeleteCandidate(candidate.id)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCandidates.length === 0 && (
            <div className="empty-state">لا توجد نتائج مطابقة</div>
          )}
        </div>

        {/* ── Bulk Edit Modal ── */}
        {showBulkEdit && (
          <div className="modal-overlay">
            <div className="modal-box scale-in">
              <div className="modal-header">
                <h3>تعديل جماعي - {selectedIds.length} مرشح</h3>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} onClick={() => setShowBulkEdit(false)}>✕</button>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">الحقل المراد تعديله</label>
                <select className="form-input" value={bulkField} onChange={e => { setBulkField(e.target.value); setBulkValue('') }}>
                  <option value="">اختر الحقل</option>
                  <option value="securityCompany">شركة الأمن</option>
                  <option value="position">الوظيفة</option>
                  <option value="governorate">المحافظة</option>
                  <option value="qualification">المؤهل</option>
                  <option value="maritalStatus">الحالة الاجتماعية</option>
                </select>
              </div>
              {bulkField && (
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">القيمة الجديدة</label>
                  {bulkField === 'securityCompany' && <SelectOrAdd value={bulkValue} options={allCompanies} onChange={setBulkValue} onAddNew={addCompany} placeholder="اختر شركة الأمن" />}
                  {bulkField === 'position' && <SelectOrAdd value={bulkValue} options={allPositions} onChange={setBulkValue} onAddNew={addPosition} placeholder="اختر الوظيفة" />}
                  {bulkField === 'governorate' && <select className="form-input" value={bulkValue} onChange={e => setBulkValue(e.target.value)}><option value="">اختر المحافظة</option>{GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}</select>}
                  {bulkField === 'maritalStatus' && <select className="form-input" value={bulkValue} onChange={e => setBulkValue(e.target.value)}><option value="">اختر</option>{['أعزب','متزوج','مطلق','أرمل'].map(v => <option key={v} value={v}>{v}</option>)}</select>}
                  {bulkField === 'qualification' && <input className="form-input" type="text" value={bulkValue} onChange={e => setBulkValue(e.target.value)} placeholder="أدخل المؤهل" />}
                </div>
              )}
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowBulkEdit(false)}>إلغاء</button>
                <button className="btn btn-primary" disabled={!bulkField || !bulkValue} onClick={handleBulkEdit} style={{ opacity: (!bulkField || !bulkValue) ? 0.5 : 1 }}>
                  <CheckCircle size={14} /> تطبيق على {selectedIds.length} مرشح
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Modal ── */}
        {editCandidate && (
          <div className="modal-overlay">
            <div className="modal-box wide scale-in">
              <div className="modal-header">
                <h3>تعديل بيانات: {editCandidate.name}</h3>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} onClick={() => setEditCandidate(null)}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '4px' }}>
                <Field label="الاسم الكامل *"><input className="form-input" type="text" value={editCandidate.name} onChange={e => setEditCandidate((p: any) => ({...p, name: e.target.value}))} /></Field>
                <Field label="الرقم القومي *"><input className="form-input" type="text" value={editCandidate.nationalId} onChange={e => setEditCandidate((p: any) => ({...p, nationalId: e.target.value}))} /></Field>
                <Field label="تاريخ الميلاد *"><input className="form-input" type="date" value={editCandidate.birthDate} onChange={e => setEditCandidate((p: any) => ({...p, birthDate: e.target.value}))} /></Field>
                <Field label="المحافظة *"><select className="form-input" value={editCandidate.governorate} onChange={e => setEditCandidate((p: any) => ({...p, governorate: e.target.value}))}><option value="">اختر</option>{GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}</select></Field>
                <Field label="المؤهل *"><input className="form-input" type="text" value={editCandidate.qualification} onChange={e => setEditCandidate((p: any) => ({...p, qualification: e.target.value}))} /></Field>
                <Field label="الحالة الاجتماعية"><select className="form-input" value={editCandidate.maritalStatus} onChange={e => setEditCandidate((p: any) => ({...p, maritalStatus: e.target.value}))}>{['أعزب','متزوج','مطلق','أرمل'].map(v => <option key={v} value={v}>{v}</option>)}</select></Field>
                <Field label="شركة الأمن"><SelectOrAdd value={editCandidate.securityCompany} options={allCompanies} onChange={v => setEditCandidate((p: any) => ({...p, securityCompany: v}))} onAddNew={addCompany} placeholder="اختر الشركة" /></Field>
                <Field label="الوظيفة"><SelectOrAdd value={editCandidate.position || ''} options={allPositions} onChange={v => setEditCandidate((p: any) => ({...p, position: v}))} onAddNew={addPosition} placeholder="اختر الوظيفة" /></Field>
                <Field label="رقم الموبايل"><input className="form-input" type="tel" value={editCandidate.phone || ''} onChange={e => setEditCandidate((p: any) => ({...p, phone: e.target.value}))} placeholder="01xxxxxxxxx" /></Field>
                <Field label="تاريخ العرض"><input className="form-input" type="date" value={editCandidate.offerDate || ''} onChange={e => setEditCandidate((p: any) => ({...p, offerDate: e.target.value}))} /></Field>
                <Field label="الوردية"><select className="form-input" value={editCandidate.workShift || ''} onChange={e => setEditCandidate((p: any) => ({...p, workShift: e.target.value}))}><option value="">بدون وردية</option><option value="نهار">نهار</option><option value="ليل">ليل</option></select></Field>
                <Field label="الملاحظات"><textarea className="form-input" value={editCandidate.notes || ''} onChange={e => setEditCandidate((p: any) => ({...p, notes: e.target.value}))} style={{ height: '70px', resize: 'vertical' }} /></Field>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditCandidate(null)}>إلغاء</button>
                <button className="btn btn-primary" onClick={handleEditSubmit}><CheckCircle size={14} /> حفظ التعديلات</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Decision Modal ── */}
        {showDecisionModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h3>{decisionResult === 'مقبول' ? '✅ قبول المرشح' : decisionResult === 'مرفوض' ? '❌ رفض المرشح' : '⚠️ استبعاد المرشح'}: {selectedCandidate?.name}</h3>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} onClick={() => setShowDecisionModal(false)}>✕</button>
              </div>
              <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* حقول القبول */}
                {decisionResult === 'مقبول' && (
                  <>
                    <div>
                      <label className="form-label">الوردية (اختياري)</label>
                      <select className="form-input" value={workShift} onChange={e => setWorkShift(e.target.value as any)}>
                        <option value="">اختر الوردية</option>
                        <option value="نهار">🌤 نهار</option>
                        <option value="ليل">🌙 ليل</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">الموقع / المنشأة (اختياري)</label>
                      <input className="form-input" type="text" value={workLocation} onChange={e => setWorkLocation(e.target.value)} placeholder="مثال: مراسي - بوابة 3" />
                    </div>
                    <div>
                      <label className="form-label">تاريخ بداية العمل (اختياري)</label>
                      <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                  </>
                )}

                {/* سبب الرفض */}
                {decisionResult === 'مرفوض' && (
                  <div>
                    <label className="form-label">سبب الرفض (اختياري)</label>
                    <select className="form-input" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}>
                      <option value="">اختر السبب</option>
                      <option value="غير لائق طبياً">غير لائق طبياً</option>
                      <option value="سجل جنائي">سجل جنائي</option>
                      <option value="عدم اجتياز الاختبار">عدم اجتياز الاختبار</option>
                      <option value="عدم استيفاء الشروط">عدم استيفاء الشروط</option>
                      <option value="تجاوز السن المطلوب">تجاوز السن المطلوب</option>
                      <option value="أسباب أخرى">أسباب أخرى</option>
                    </select>
                  </div>
                )}

                {/* سبب الاستبعاد */}
                {decisionResult === 'مستبعد' && (
                  <div>
                    <label className="form-label">سبب الاستبعاد</label>
                    <textarea className="form-input" value={exclusionReason} onChange={e => setExclusionReason(e.target.value)} placeholder="اذكر سبب الاستبعاد..." style={{ height: '80px', resize: 'vertical' }} />
                  </div>
                )}

                {/* الملاحظات */}
                <div>
                  <label className="form-label">ملاحظات إضافية (اختياري)</label>
                  <textarea className="form-input" value={decisionNotes} onChange={e => setDecisionNotes(e.target.value)} placeholder="أي ملاحظات إضافية..." style={{ height: '80px', resize: 'vertical' }} />
                </div>

              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowDecisionModal(false)}>إلغاء</button>
                <button className={`btn ${decisionResult === 'مقبول' ? 'btn-success' : decisionResult === 'مرفوض' ? 'btn-danger' : 'btn-warning'}`} onClick={handleSubmitDecision}>
                  تأكيد القرار
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
