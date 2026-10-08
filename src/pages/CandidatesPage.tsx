import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { GOVERNORATES } from '../constants/lists'
import { useEditableLists } from '../hooks/useEditableLists'
import { usePermissions } from '../hooks/usePermissions'
import SelectOrAdd from '../components/SelectOrAdd'
import MultiSelect from '../components/MultiSelect'
import { CheckCircle, Pencil, ListChecks, Printer, Download, Sparkles, MessageCircle, BadgeCheck, LayoutGrid, Table2, Eye, ImagePlus, FileText, X, QrCode } from 'lucide-react'
import VoiceSearchButton from '../components/VoiceSearchButton'
import CandidateIDCard from '../components/CandidateIDCard'
import UndoToast from '../components/UndoToast'
import CandidateDrawer from '../components/CandidateDrawer'
import CandidateKanbanBoard from '../components/CandidateKanbanBoard'
import QRCardScannerModal from '../components/QRCardScannerModal'
import { useAuditLog } from '../hooks/useAuditLog'
import type { VoiceCommandResult } from '../hooks/useVoiceSearch'
import { MarassiAI } from '../utils/aiAnalyzer'
import { WhatsAppHelper } from '../utils/whatsappHelper'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { compressCandidatePhoto, processCandidateCV } from '../utils/imageCompressor'

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
  const { record: auditRecord, undoEntry, dismissUndo } = useAuditLog()

  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCompany, setFilterCompany] = useState<string[]>([])
  const [filterPosition, setFilterPosition] = useState<string[]>([])
  const [filterGovernorate, setFilterGovernorate] = useState<string[]>([])
  const [filterResult, setFilterResult] = useState<string[]>([])
  const [filterMaritalStatus, setFilterMaritalStatus] = useState<string[]>([])
  const [filterShift, setFilterShift] = useState<string[]>([])
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
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState<string>('')
  const [newCVFile, setNewCVFile] = useState<File | null>(null)
  const [newCVName, setNewCVName] = useState<string>('')
  const [isAddingCandidate, setIsAddingCandidate] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const editPhotoInputRef = useRef<HTMLInputElement>(null)
  const editCvInputRef = useRef<HTMLInputElement>(null)
  const [editCandidate, setEditCandidate] = useState<any>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [bulkField, setBulkField] = useState('')
  const [bulkValue, setBulkValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [idCardCandidate, setIdCardCandidate] = useState<any>(null)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [drawerCandidate, setDrawerCandidate] = useState<any | null>(null)
  const [quickFilter, setQuickFilter] = useState<string>('all')
  const PAGE_SIZE = 100

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredCandidates.slice(start, start + PAGE_SIZE)
  }, [filteredCandidates, currentPage])

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterCompany, filterPosition, filterGovernorate, filterResult, filterMaritalStatus, filterShift])

  useEffect(() => {
    let filtered = searchQuery ? searchCandidates(searchQuery) : candidates
    if (filterCompany.length > 0) filtered = filtered.filter(c => filterCompany.includes(c.securityCompany))
    if (filterPosition.length > 0) filtered = filtered.filter(c => filterPosition.includes(c.position || ''))
    if (filterGovernorate.length > 0) filtered = filtered.filter(c => filterGovernorate.includes(c.governorate))
    if (filterResult.length > 0) filtered = filtered.filter(c => filterResult.includes(c.offerResult))
    if (filterMaritalStatus.length > 0) filtered = filtered.filter(c => filterMaritalStatus.includes(c.maritalStatus))
    if (filterShift.length > 0) filtered = filtered.filter(c => filterShift.includes((c as any).workShift || ''))
    setFilteredCandidates(filtered)
  }, [searchQuery, filterCompany, filterPosition, filterGovernorate, filterResult, filterMaritalStatus, filterShift, candidates])

  const handlePhotoChange = async (file: File, isEdit = false) => {
    try {
      const result = await compressCandidatePhoto(file)
      if (isEdit) {
        setEditCandidate((p: any) => ({ ...p, photoBase64: result.base64 }))
      } else {
        setNewPhotoPreview(result.base64)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCVChange = async (file: File, isEdit = false) => {
    try {
      const result = await processCandidateCV(file)
      if (isEdit) {
        setEditCandidate((p: any) => ({ ...p, cvBase64: result.base64, cvFileName: result.fileName }))
      } else {
        setNewCVFile(file)
        setNewCVName(result.fileName)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.nationalId || !newCandidate.birthDate || !newCandidate.governorate || !newCandidate.qualification) {
      alert(t('candidates.alerts.fillRequired', 'يرجى ملء جميع الحقول المطلوبة'))
      return
    }
    setIsAddingCandidate(true)
    try {
      let photoBase64: string | undefined
      let cvBase64: string | undefined
      let cvFileName: string | undefined

      if (newPhotoFile) {
        const r = await compressCandidatePhoto(newPhotoFile)
        photoBase64 = r.base64
      }
      if (newCVFile) {
        const r = await processCandidateCV(newCVFile)
        cvBase64 = r.base64
        cvFileName = r.fileName
      }

      addCandidate({
        ...newCandidate,
        createdBy: currentUser?.name || 'Unknown',
        ...(photoBase64 ? { photoBase64 } : {}),
        ...(cvBase64 ? { cvBase64, cvFileName } : {}),
      } as any)

      setNewCandidate(EMPTY_CANDIDATE)
      setNewPhotoFile(null)
      setNewPhotoPreview('')
      setNewCVFile(null)
      setNewCVName('')
      setShowAddForm(false)
      alert(t('candidates.alerts.addSuccess', 'تم إضافة المرشح بنجاح'))
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في إضافة المرشح')
    } finally {
      setIsAddingCandidate(false)
    }
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
    // حفظ الحالة قبل التعديل للتراجع
    const beforeState = {
      offerResult: selectedCandidate.offerResult,
      status: selectedCandidate.status,
      workShift: selectedCandidate.workShift,
      notes: selectedCandidate.notes,
    }
    try {
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
      // تسجيل في السجل
      auditRecord({
        action: 'update_status',
        entityId: selectedCandidate.id,
        entityName: selectedCandidate.name,
        performedBy: currentUser?.name || 'مجهول',
        before: beforeState,
        after: { offerResult: decisionResult, workShift },
        description: `تغيير حالة ${selectedCandidate.name} إلى “${decisionResult}”`,
      })
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
    const candidate = candidates.find(c => c.id === id)
    if (!candidate) return
    if (window.confirm(t('candidates.alerts.confirmDelete', 'هل أنت متأكد من حذف هذا المرشح؟'))) {
      deleteCandidate(id)
      auditRecord({
        action: 'delete_candidate',
        entityId: id,
        entityName: candidate.name,
        performedBy: currentUser?.name || 'مجهول',
        before: { ...candidate },
        description: `حذف مرشح: ${candidate.name}`,
      })
    }
  }

  const handleEditSubmit = async () => {
    if (!editCandidate) return
    const original = candidates.find(c => c.id === editCandidate.id)
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
      auditRecord({
        action: 'update_candidate',
        entityId: editCandidate.id,
        entityName: editCandidate.name,
        performedBy: currentUser?.name || 'مجهول',
        before: original ? { name: original.name, phone: original.phone, qualification: original.qualification } : undefined,
        after: { name: editCandidate.name, phone: editCandidate.phone, qualification: editCandidate.qualification },
        description: `تعديل بيانات: ${editCandidate.name}`,
      })
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
  const handleExportExcel = () => {
    const data = filteredCandidates.map(c => ({
      'الاسم': c.name,
      'الرقم القومي': c.nationalId,
      'تاريخ الميلاد': c.birthDate,
      'المحافظة': c.governorate,
      'المؤهل': c.qualification,
      'الحالة الاجتماعية': c.maritalStatus,
      'شركة الأمن': c.securityCompany,
      'الوظيفة': c.position || '',
      'الموبايل': (c as any).phone || '',
      'تاريخ العرض': c.offerDate || '',
      'الوردية': (c as any).workShift || '',
      'النتيجة': c.offerResult,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Candidates')
    XLSX.writeFile(wb, `Candidates_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const perms = usePermissions()
  const canAddCandidate = perms.canAddCandidates
  const canUpdateStatus = perms.canApproveCandidates
  const canEdit = perms.canEditCandidates
  const canDelete = perms.canDeleteCandidates
  const uniqueCompanies = Array.from(new Set(candidates.map(c => c.securityCompany))).filter(Boolean)
  const { allCompanies, allPositions, allGovernorates, addCompany, addPosition, addGovernorate } = useEditableLists()

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
            <VoiceSearchButton onCommand={(result: VoiceCommandResult) => {
              if (result.intent === 'search' && result.value) {
                setSearchQuery(result.value)
              } else if (result.intent === 'filter_status' && result.value) {
                setFilterResult([result.value])
              } else if (result.intent === 'filter_shift' && result.value) {
                setFilterShift([result.value])
              } else if (result.intent === 'filter_governorate' && result.value) {
                setFilterGovernorate([result.value])
              } else if (result.intent === 'reset') {
                setSearchQuery('')
                setFilterCompany([])
                setFilterPosition([])
                setFilterGovernorate([])
                setFilterResult([])
                setFilterMaritalStatus([])
                setFilterShift([])
              }
            }} />
            {/* View Mode Switcher */}
            <div className="print-hidden" style={{ display: 'inline-flex', background: 'hsl(var(--muted)/0.8)', padding: '3px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'table' ? 'hsl(var(--card))' : 'transparent',
                  color: viewMode === 'table' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'inherit',
                }}
              >
                <Table2 size={14} /> جدول
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'kanban' ? 'hsl(var(--card))' : 'transparent',
                  color: viewMode === 'kanban' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'inherit',
                }}
              >
                <LayoutGrid size={14} /> كانبان
              </button>
            </div>

            {canAddCandidate && (
              <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                {t('candidates.addCandidate', 'إضافة مرشح')}
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, hsl(262 72% 45%), hsl(280 70% 50%))',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                cursor: 'pointer',
              }}
              onClick={() => setShowQRScanner(true)}
            >
              <QrCode size={15} /> فحص كارت QR
            </button>
            <button className="btn btn-success btn-sm" onClick={handleExportExcel} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Download size={14} /> {t('general.export', 'Excel')}
            </button>
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

        {/* ── Quick Filter Pills ── */}
        <div className="print-hidden" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '12px' }}>
          {[
            { id: 'all', label: 'الكل', count: candidates.length, color: '#6366f1' },
            { id: 'في انتظار', label: '⏳ في انتظار', count: candidates.filter(c => !c.offerResult || c.offerResult === 'في انتظار').length, color: '#3b82f6' },
            { id: 'مقبول', label: '✅ مقبول', count: candidates.filter(c => c.offerResult === 'مقبول').length, color: '#10b981' },
            { id: 'مرفوض', label: '❌ مرفوض', count: candidates.filter(c => c.offerResult === 'مرفوض').length, color: '#ef4444' },
            { id: 'مستبعد', label: '⚠️ مستبعد', count: candidates.filter(c => c.offerResult === 'مستبعد').length, color: '#f59e0b' },
          ].map(pill => {
            const active = (pill.id === 'all' && filterResult.length === 0) || (filterResult.length === 1 && filterResult[0] === pill.id)
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  if (pill.id === 'all') {
                    setFilterResult([])
                  } else {
                    setFilterResult([pill.id])
                  }
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  border: active ? `1.5px solid ${pill.color}` : '1px solid hsl(var(--border))',
                  background: active ? `${pill.color}18` : 'hsl(var(--card))',
                  color: active ? pill.color : 'hsl(var(--foreground))',
                  fontSize: '12.5px',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                <span>{pill.label}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '99px',
                  background: active ? pill.color : 'hsl(var(--muted))',
                  color: active ? '#ffffff' : 'hsl(var(--muted-foreground))',
                }}>
                  {pill.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Filters ── */}
        <div className="filter-bar print-hidden">
          <MultiSelect options={uniqueCompanies} selectedValues={filterCompany} onChange={setFilterCompany} placeholder={t('candidates.columns.company', 'الشركة')} />
          <MultiSelect options={allPositions} selectedValues={filterPosition} onChange={setFilterPosition} placeholder={t('candidates.columns.position', 'الوظيفة')} />
          <MultiSelect options={allGovernorates} selectedValues={filterGovernorate} onChange={setFilterGovernorate} placeholder={t('candidates.columns.governorate', 'المحافظة')} />
          <MultiSelect options={['مقبول','مرفوض','مستبعد','في انتظار']} selectedValues={filterResult} onChange={setFilterResult} placeholder={t('candidates.columns.status', 'النتيجة')} />
          <MultiSelect options={['أعزب','متزوج','مطلق','أرمل']} selectedValues={filterMaritalStatus} onChange={setFilterMaritalStatus} placeholder={t('candidates.columns.maritalStatus', 'الحالة الاجتماعية')} />
          <MultiSelect options={['نهار','ليل']} selectedValues={filterShift} onChange={setFilterShift} placeholder={t('candidates.columns.shift', 'الوردية')} />
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
                  <SelectOrAdd listType="governorates" title="المحافظات" value={newCandidate.governorate} options={allGovernorates} onChange={v => setNewCandidate(p => ({...p, governorate: v}))} onAddNew={addGovernorate} placeholder="اختر المحافظة" />
                </Field>
                <Field label={t('candidates.columns.qualification','المؤهل') + ' *'}><input className="form-input" type="text" value={newCandidate.qualification} onChange={set('qualification')} /></Field>
                <Field label={t('candidates.columns.maritalStatus','الحالة الاجتماعية')}>
                  <select className="form-input" value={newCandidate.maritalStatus} onChange={set('maritalStatus')}>
                    {['أعزب','متزوج','مطلق','أرمل'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label={t('candidates.columns.company','شركة الأمن')}>
                  <SelectOrAdd listType="companies" title="شركات الأمن" value={newCandidate.securityCompany} options={allCompanies} onChange={v => setNewCandidate(p => ({...p, securityCompany: v}))} onAddNew={addCompany} placeholder="اختر الشركة" />
                </Field>
                <Field label={t('candidates.columns.position','الوظيفة')}>
                  <SelectOrAdd listType="positions" title="الوظائف" value={newCandidate.position} options={allPositions} onChange={v => setNewCandidate(p => ({...p, position: v}))} onAddNew={addPosition} placeholder="اختر الوظيفة" />
                </Field>
                <Field label={t('candidates.columns.mobile','الموبايل')}><input className="form-input" type="tel" value={newCandidate.phone} onChange={set('phone')} placeholder="01xxxxxxxxx" /></Field>
                <Field label={t('candidates.columns.addDate','تاريخ العرض')}><input className="form-input" type="date" value={newCandidate.offerDate} onChange={set('offerDate')} /></Field>
              </div>

              {/* ── Photo & CV Upload ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px', padding: '14px', background: 'hsl(var(--muted)/0.4)', borderRadius: '10px', border: '1px dashed hsl(var(--border))' }}>
                {/* Photo */}
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImagePlus size={14} /> الصورة الشخصية <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>(اختياري • يُضغط تلقائياً ~30KB)</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {newPhotoPreview ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={newPhotoPreview} alt="preview" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid hsl(var(--primary))' }} />
                        <button type="button" onClick={() => { setNewPhotoFile(null); setNewPhotoPreview(''); if (photoInputRef.current) photoInputRef.current.value = '' }}
                          style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed hsl(var(--border))' }}>
                        <ImagePlus size={20} color="hsl(var(--muted-foreground))" />
                      </div>
                    )}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => photoInputRef.current?.click()} style={{ fontSize: '12px' }}>
                      {newPhotoPreview ? 'تغيير الصورة' : 'اختر صورة'}
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) { setNewPhotoFile(f); handlePhotoChange(f) } }} />
                  </div>
                </div>

                {/* CV */}
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} /> السيرة الذاتية (CV) <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>(اختياري • PDF حد أقصى 500KB)</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {newCVName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'hsl(var(--card))', padding: '6px 10px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                        <FileText size={14} color="#6366f1" />
                        <span style={{ fontSize: '12px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newCVName}</span>
                        <button type="button" onClick={() => { setNewCVFile(null); setNewCVName(''); if (cvInputRef.current) cvInputRef.current.value = '' }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => cvInputRef.current?.click()} style={{ fontSize: '12px' }}>
                        اختر ملف CV
                      </button>
                    )}
                    <input ref={cvInputRef} type="file" accept=".pdf,image/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleCVChange(f) }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-success" onClick={handleAddCandidate} disabled={isAddingCandidate}
                  style={{ opacity: isAddingCandidate ? 0.7 : 1 }}>
                  <CheckCircle size={14} /> {isAddingCandidate ? 'جاري الإضافة...' : t('candidates.addCandidate','إضافة المرشح')}
                </button>
                <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Main View: Kanban or Table ── */}
        {viewMode === 'kanban' ? (
          <CandidateKanbanBoard
            candidates={filteredCandidates}
            onCandidateClick={c => setDrawerCandidate(c)}
            onStatusChange={(id, result) => handleStatusUpdate(id, '', result)}
            onPrintCard={c => setIdCardCandidate(c)}
            canUpdateStatus={canUpdateStatus}
          />
        ) : (
          <>
            {/* ── Table ── */}
            <div className="section-card">
              <div style={{ overflowX: 'auto' }}>
                <table className={`data-table${selectedIds.length > 0 ? ' has-selection' : ''}`}>
                  <thead>
                    <tr>
                      {canEdit && <th className="print-hidden" style={{ width: '40px' }}>
                        <input type="checkbox" checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer', accentColor: '#8b5cf6' }} />
                      </th>}
                      {[t('candidates.columns.name','الاسم'), t('candidates.columns.nationalId','الرقم القومي'), t('candidates.columns.birthDate','تاريخ الميلاد'), t('candidates.columns.governorate','المحافظة'), t('candidates.columns.qualification','المؤهل'), t('candidates.columns.maritalStatus','الحالة'), t('candidates.columns.company','الشركة'), t('candidates.columns.position','الوظيفة'), t('candidates.columns.mobile','الموبايل'), t('candidates.columns.addDate','تاريخ العرض'), t('candidates.columns.status','النتيجة')].map(h => <th key={h}>{h}</th>)}
                      <th className="print-hidden">عرض</th>
                      <th className="print-hidden">🪪</th>
                      {canUpdateStatus && <th className="print-hidden">{t('candidates.columns.actions','الإجراءات')}</th>}
                      {canEdit && <th className="print-hidden">{t('actions.edit','تعديل')}</th>}
                      {canDelete && <th className="print-hidden">{t('actions.delete','حذف')}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCandidates.map(candidate => (
                      <tr
                        key={candidate.id}
                        className={selectedIds.includes(candidate.id) ? 'selected' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setDrawerCandidate(candidate)}
                      >
                        {canEdit && (
                          <td className="print-hidden" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedIds.includes(candidate.id)} onChange={() => toggleSelect(candidate.id)} style={{ cursor: 'pointer', accentColor: '#8b5cf6' }} />
                          </td>
                        )}
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
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{(candidate as any).phone || <span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span>}</span>
                            {(candidate as any).phone && (
                              <button
                                type="button"
                                onClick={() => WhatsAppHelper.openWhatsApp({
                                  phone: (candidate as any).phone,
                                  candidateName: candidate.name,
                                  position: candidate.position,
                                  securityCompany: candidate.securityCompany,
                                  type: candidate.offerResult === 'مقبول' ? 'acceptance' : 'documents'
                                })}
                                title="تجهيز رسالة واتساب وتوجه للتطبيق"
                                style={{
                                  background: '#25D366', color: '#fff', border: 'none',
                                  borderRadius: '50%', width: '22px', height: '22px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', padding: 0, boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
                                }}
                              >
                                <MessageCircle size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td>{candidate.offerDate || <span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span>}</td>
                        <td>
                          <span className={candidate.offerResult === 'مقبول' ? 'badge badge-success' : candidate.offerResult === 'مرفوض' ? 'badge badge-danger' : candidate.offerResult === 'مستبعد' ? 'badge badge-warning' : 'badge badge-info'}>
                            {candidate.offerResult}
                          </span>
                        </td>
                        {/* ── زرار الفحص السريع ── */}
                        <td className="print-hidden" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setDrawerCandidate(candidate)}
                            title="عرض تفاصيل المرشح الكاملة"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 6px' }}
                          >
                            <Eye size={14} color="#6366f1" />
                          </button>
                        </td>
                        {/* ── زرار كارت الهوية — فقط للمقبولين ── */}
                        <td className="print-hidden" onClick={e => e.stopPropagation()}>
                          {candidate.offerResult === 'مقبول' ? (
                            <button
                              type="button"
                              onClick={() => setIdCardCandidate(candidate)}
                              title="عرض كارت الهوية الرقمي"
                              style={{
                                background: 'linear-gradient(135deg, hsl(262 72% 48%), hsl(280 70% 55%))',
                                color: '#fff', border: 'none',
                                borderRadius: '8px', padding: '4px 8px',
                                cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                boxShadow: '0 2px 8px rgba(109,40,217,0.3)',
                              }}
                            >
                              <BadgeCheck size={12} /> كارت
                            </button>
                          ) : (
                            <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                        {canUpdateStatus && (
                          <td className="print-hidden" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(candidate.id,'تم التوظيف','مقبول')}>قبول</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(candidate.id,'مرفوض','مرفوض')}>رفض</button>
                              <button className="btn btn-warning btn-sm" onClick={() => handleStatusUpdate(candidate.id,'مستبعد','مستبعد')}>استبعاد</button>
                            </div>
                          </td>
                        )}
                        {canEdit && (
                          <td className="print-hidden" onClick={e => e.stopPropagation()}>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'hsl(var(--primary))' }} onClick={() => setEditCandidate({...candidate})}>
                              <Pencil size={13} />
                            </button>
                          </td>
                        )}
                        {canDelete && (
                          <td className="print-hidden" onClick={e => e.stopPropagation()}>
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

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
                <button className="btn btn-ghost btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)} style={{ opacity: currentPage === 1 ? 0.4 : 1 }}>{'<<'}</button>
                <button className="btn btn-ghost btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ opacity: currentPage === 1 ? 0.4 : 1 }}>{'<'}</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ opacity: 0.4 }}>...</span>}
                      <button className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCurrentPage(p)}>{p}</button>
                    </React.Fragment>
                  ))}
                <button className="btn btn-ghost btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}>{'>'}</button>
                <button className="btn btn-ghost btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}>{'>>'}</button>
              </div>
            )}
          </>
        )}

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
                  {bulkField === 'securityCompany' && <SelectOrAdd listType="companies" title="شركات الأمن" value={bulkValue} options={allCompanies} onChange={setBulkValue} onAddNew={addCompany} placeholder="اختر شركة الأمن" />}
                  {bulkField === 'position' && <SelectOrAdd listType="positions" title="الوظائف" value={bulkValue} options={allPositions} onChange={setBulkValue} onAddNew={addPosition} placeholder="اختر الوظيفة" />}
                  {bulkField === 'governorate' && <SelectOrAdd listType="governorates" title="المحافظات" value={bulkValue} options={allGovernorates} onChange={setBulkValue} onAddNew={addGovernorate} placeholder="اختر المحافظة" />}
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

        {/* ── ID Card Modal ── */}
        {idCardCandidate && (
          <CandidateIDCard
            candidate={{
              ...idCardCandidate,
              workShift: (idCardCandidate as any).workShift,
            }}
            onClose={() => setIdCardCandidate(null)}
          />
        )}

        {/* ── QR Code Card Scanner Modal ── */}
        {showQRScanner && (
          <QRCardScannerModal
            onClose={() => setShowQRScanner(false)}
            onSelectCandidate={c => setDrawerCandidate(c)}
            onViewIDCard={c => setIdCardCandidate(c)}
          />
        )}

        {/* ── Edit Modal ── */}
        {editCandidate && (
          <div className="modal-overlay">
            <div className="modal-box wide scale-in">
              <div className="modal-header">
                <h3>تعديل بيانات: {editCandidate.name}</h3>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} onClick={() => setEditCandidate(null)}>✕</button>
              </div>
              {/* Edit Photo & CV */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', padding: '12px', background: 'hsl(var(--muted)/0.4)', borderRadius: '10px', border: '1px dashed hsl(var(--border))' }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ImagePlus size={13} /> الصورة الشخصية</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {editCandidate.photoBase64 ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={editCandidate.photoBase64} alt="" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid hsl(var(--primary))' }} />
                        <button type="button" onClick={() => setEditCandidate((p: any) => ({ ...p, photoBase64: null }))}
                          style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 16, height: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                          <X size={9} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed hsl(var(--border))' }}>
                        <ImagePlus size={18} color="hsl(var(--muted-foreground))" />
                      </div>
                    )}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => editPhotoInputRef.current?.click()} style={{ fontSize: '12px' }}>
                      {editCandidate.photoBase64 ? 'تغيير' : 'إضافة صورة'}
                    </button>
                    <input ref={editPhotoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoChange(f, true) }} />
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={13} /> السيرة الذاتية</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {editCandidate.cvFileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'hsl(var(--card))', padding: '5px 8px', borderRadius: '7px', border: '1px solid hsl(var(--border))' }}>
                        <FileText size={13} color="#6366f1" />
                        <span style={{ fontSize: '11px', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{editCandidate.cvFileName}</span>
                        <button type="button" onClick={() => setEditCandidate((p: any) => ({ ...p, cvBase64: null, cvFileName: null }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0 }}><X size={11} /></button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => editCvInputRef.current?.click()} style={{ fontSize: '12px' }}>إضافة CV</button>
                    )}
                    <input ref={editCvInputRef} type="file" accept=".pdf,image/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleCVChange(f, true) }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '4px' }}>
                <Field label="الاسم الكامل *"><input className="form-input" type="text" value={editCandidate.name} onChange={e => setEditCandidate((p: any) => ({...p, name: e.target.value}))} /></Field>
                <Field label="الرقم القومي *"><input className="form-input" type="text" value={editCandidate.nationalId} onChange={e => setEditCandidate((p: any) => ({...p, nationalId: e.target.value}))} /></Field>
                <Field label="تاريخ الميلاد *"><input className="form-input" type="date" value={editCandidate.birthDate} onChange={e => setEditCandidate((p: any) => ({...p, birthDate: e.target.value}))} /></Field>
                <Field label="المحافظة *"><SelectOrAdd listType="governorates" title="المحافظات" value={editCandidate.governorate} options={allGovernorates} onChange={v => setEditCandidate((p: any) => ({...p, governorate: v}))} onAddNew={addGovernorate} placeholder="اختر المحافظة" /></Field>
                <Field label="المؤهل *"><input className="form-input" type="text" value={editCandidate.qualification} onChange={e => setEditCandidate((p: any) => ({...p, qualification: e.target.value}))} /></Field>
                <Field label="الحالة الاجتماعية"><select className="form-input" value={editCandidate.maritalStatus} onChange={e => setEditCandidate((p: any) => ({...p, maritalStatus: e.target.value}))}>{['أعزب','متزوج','مطلق','أرمل'].map(v => <option key={v} value={v}>{v}</option>)}</select></Field>
                <Field label="شركة الأمن"><SelectOrAdd listType="companies" title="شركات الأمن" value={editCandidate.securityCompany} options={allCompanies} onChange={v => setEditCandidate((p: any) => ({...p, securityCompany: v}))} onAddNew={addCompany} placeholder="اختر الشركة" /></Field>
                <Field label="الوظيفة"><SelectOrAdd listType="positions" title="الوظائف" value={editCandidate.position || ''} options={allPositions} onChange={v => setEditCandidate((p: any) => ({...p, position: v}))} onAddNew={addPosition} placeholder="اختر الوظيفة" /></Field>
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

                {/* توصية Marassi AI الذكية */}
                {selectedCandidate && (() => {
                  const analysis = MarassiAI.analyzeCandidate(selectedCandidate, candidates, useStore.getState().savedCandidates)
                  return (
                    <div style={{
                      background: 'linear-gradient(135deg, hsl(262 70% 97%), hsl(280 60% 94%))',
                      border: '1px solid hsl(262 60% 85%)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 4px 12px rgba(108, 63, 197, 0.08)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'hsl(262 70% 40%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={15} /> توصية Marassi AI الذكية
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: analysis.score >= 75 ? '#16a34a' : analysis.score < 45 ? '#dc2626' : '#d97706' }}>
                          {analysis.recommendationLabel} ({analysis.score}%)
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'hsl(260 20% 30%)', margin: 0, lineHeight: 1.5 }}>
                        {analysis.summaryText}
                      </p>
                    </div>
                  )
                })()}

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
                      <input className="form-input" type="text" value={workLocation} onChange={e => setWorkLocation(e.target.value)} placeholder="مثال: قطاع أ - بوابة 1" />
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
                {selectedCandidate?.phone && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ color: '#25D366', border: '1px solid #25D366', marginLeft: 'auto' }}
                    onClick={() => WhatsAppHelper.openWhatsApp({
                      phone: selectedCandidate.phone,
                      candidateName: selectedCandidate.name,
                      position: selectedCandidate.position,
                      securityCompany: selectedCandidate.securityCompany,
                      shift: workShift || selectedCandidate.workShift,
                      type: decisionResult === 'مقبول' ? 'acceptance' : 'documents'
                    })}
                  >
                    <MessageCircle size={14} /> تجهيز وتوجيه للواتساب 💬
                  </button>
                )}
                <button className="btn btn-ghost" onClick={() => setShowDecisionModal(false)}>إلغاء</button>
                <button className={`btn ${decisionResult === 'مقبول' ? 'btn-success' : decisionResult === 'مرفوض' ? 'btn-danger' : 'btn-warning'}`} onClick={handleSubmitDecision}>
                  تأكيد القرار
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Candidate Slide-over Details Drawer ── */}
        <CandidateDrawer
          candidate={drawerCandidate}
          isOpen={Boolean(drawerCandidate)}
          onClose={() => setDrawerCandidate(null)}
          onEdit={c => { setDrawerCandidate(null); setEditCandidate(c) }}
          onDelete={id => { setDrawerCandidate(null); handleDeleteCandidate(id) }}
          onStatusChange={(id, result) => handleStatusUpdate(id, '', result)}
          onPrintCard={c => setIdCardCandidate(c)}
          canEdit={canEdit}
          canDelete={canDelete}
          canUpdateStatus={canUpdateStatus}
        />

      </div>

      {/* ── Undo Toast ── */}
      {undoEntry && (
        <UndoToast
          entry={undoEntry}
          onDismiss={dismissUndo}
          onUndo={async (entry) => {
            if (entry.action === 'update_status' && entry.before) {
              // التراجع: إعادة الحالة السابقة
              await updateCandidateStatus(
                entry.entityId,
                entry.before.status || 'جديد',
                entry.before.offerResult || 'في انتظار',
                entry.before.notes,
                entry.before.workShift
              )
            } else if (entry.action === 'update_candidate' && entry.before) {
              await updateCandidate(entry.entityId, entry.before as any)
            }
          }}
        />
      )}
    </ProtectedLayout>
  )
}

export default CandidatesPage
