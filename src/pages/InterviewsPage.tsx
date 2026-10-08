import React, { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import {
  Plus, CheckCircle, XCircle, Trash2, Search, Filter, Download,
  Calendar, Clock, MessageCircle, User, Briefcase, MapPin,
  LayoutGrid, Table2, BellRing, ClipboardCheck, Sparkles, UserCheck,
  AlertTriangle, Shield, CheckCircle2, Sun, Moon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePermissions } from '../hooks/usePermissions'
import { WhatsAppHelper } from '../utils/whatsappHelper'
import CandidateIDCard from '../components/CandidateIDCard'
import * as XLSX from 'xlsx'

const InterviewsPage: React.FC = () => {
  const {
    currentUser,
    interviews,
    candidates,
    addInterview,
    updateInterview,
    deleteInterview,
    updateCandidateStatus,
    saveCandidateToDatabase
  } = useStore()

  const { t } = useTranslation()
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // نموذج الجدولة الجديد
  const [newInterview, setNewInterview] = useState({
    candidateId: '',
    candidateName: '',
    position: '',
    interviewer: '',
    date: '',
    time: '',
    status: 'مجدولة' as const,
    notes: ''
  })
  const [candidateSearchText, setCandidateSearchText] = useState('')
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false)

  // نموذج اتخاذ القرار الفوري للمقابلة
  const [decisionInterview, setDecisionInterview] = useState<any>(null)
  const [decisionResult, setDecisionResult] = useState<'مقبول' | 'مرفوض' | 'مستبعد' | ''>('')
  const [decisionNotes, setDecisionNotes] = useState('')
  const [workShift, setWorkShift] = useState<'نهار' | 'ليل' | ''>('')
  const [workLocation, setWorkLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [exclusionReason, setExclusionReason] = useState('')
  const [idCardCandidate, setIdCardCandidate] = useState<any>(null)

  // المرشحون المطابقون للبحث في نموذج الجدولة
  const searchedCandidates = useMemo(() => {
    if (!candidateSearchText.trim()) return (candidates || []).slice(0, 20)
    const q = candidateSearchText.toLowerCase()
    return (candidates || []).filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.nationalId || '').includes(q) ||
      (c.position && c.position.toLowerCase().includes(q)) ||
      (c.securityCompany && c.securityCompany.toLowerCase().includes(q)) ||
      (c.governorate && c.governorate.toLowerCase().includes(q))
    ).slice(0, 20)
  }, [candidates, candidateSearchText])

  const permissions = usePermissions()

  const filteredInterviews = useMemo(() => {
    const q = (searchQuery || '').toLowerCase()
    return (interviews || []).filter(interview => {
      const candidateName = (interview.candidateName || '').toLowerCase()
      const interviewer = (interview.interviewer || '').toLowerCase()
      const position = (interview.position || '').toLowerCase()
      const matchesSearch = candidateName.includes(q) || interviewer.includes(q) || position.includes(q)
      const matchesStatus = statusFilter ? interview.status === statusFilter : true
      return matchesSearch && matchesStatus
    })
  }, [interviews, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const scheduled = (interviews || []).filter(i => i.status === 'مجدولة').length
    const completed = (interviews || []).filter(i => i.status === 'مكتملة').length
    const cancelled = (interviews || []).filter(i => i.status === 'ملغاة').length
    return { total: (interviews || []).length, scheduled, completed, cancelled }
  }, [interviews])

  const handleExport = () => {
    const exportData = filteredInterviews.map(i => ({
      [t('candidates.columns.name', 'اسم المرشح')]: i.candidateName,
      [t('candidates.columns.position', 'المنصب')]: i.position,
      'المحاور': i.interviewer || 'غير محدد',
      [t('interviews.date', 'التاريخ')]: i.date,
      [t('interviews.time', 'الوقت')]: i.time,
      [t('candidates.columns.status', 'الحالة')]: i.status,
      [t('database.columns.notes', 'ملاحظات')]: i.notes || ''
    }))
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Interviews')
    XLSX.writeFile(wb, `Interviews_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleAddInterview = () => {
    if (!newInterview.candidateId || !newInterview.position || !newInterview.date || !newInterview.time) {
      alert(t('interviews.fillRequired', 'يرجى ملء جميع الحقول المطلوبة'))
      return
    }

    addInterview(newInterview)
    setNewInterview({
      candidateId: '',
      candidateName: '',
      position: '',
      interviewer: '',
      date: '',
      time: '',
      status: 'مجدولة',
      notes: ''
    })
    setCandidateSearchText('')
    setShowCandidateDropdown(false)
    setShowAddForm(false)
    alert(t('interviews.scheduleSuccess', 'تم جدولة المقابلة بنجاح'))
  }

  const handleUpdateInterview = (id: string, status: string) => {
    updateInterview(id, { status: status as any })
  }

  const handleDeleteInterview = (id: string) => {
    if (window.confirm(t('interviews.deleteConfirm', 'هل أنت متأكد من حذف هذه المقابلة؟'))) {
      deleteInterview(id)
    }
  }

  // فتح نافذة تقييم واتخاذ القرار للمقابلة
  const handleOpenDecisionModal = (interview: any) => {
    const cand = candidates.find(c => c.id === interview.candidateId || c.name === interview.candidateName)
    setDecisionInterview(interview)
    setDecisionResult((cand?.offerResult as any) || 'مقبول')
    setWorkShift((cand?.workShift as any) || '')
    setWorkLocation(cand?.notes?.match(/الموقع:\s*([^|]+)/)?.[1]?.trim() || '')
    setDecisionNotes(interview.notes || '')
    setStartDate(new Date().toISOString().split('T')[0])
    setRejectionReason('')
    setExclusionReason('')
  }

  // اعتماد قرار المقابلة وتحديث المرشح والأرشيف
  const handleSubmitInterviewDecision = async () => {
    if (!decisionInterview || !decisionResult) {
      alert('يرجى تحديد نتيجة المقابلة (مقبول / مرفوض / مستبعد)')
      return
    }

    const cand = candidates.find(c => c.id === decisionInterview.candidateId || c.name === decisionInterview.candidateName)

    const fullNotes = [
      decisionNotes,
      decisionResult === 'مقبول' && workLocation ? `الموقع: ${workLocation}` : '',
      decisionResult === 'مقبول' && startDate ? `تاريخ البداية: ${startDate}` : '',
      decisionResult === 'مرفوض' && rejectionReason ? `سبب الرفض: ${rejectionReason}` : '',
      decisionResult === 'مستبعد' && exclusionReason ? `سبب الاستبعاد: ${exclusionReason}` : '',
    ].filter(Boolean).join(' | ') || undefined

    if (cand) {
      await updateCandidateStatus(
        cand.id,
        decisionResult === 'مقبول' ? 'تم التوظيف' : decisionResult === 'مرفوض' ? 'مرفوض' : 'مستبعد',
        decisionResult as any,
        fullNotes,
        (workShift as 'نهار' | 'ليل') || undefined
      )
      if (['مقبول', 'مرفوض', 'مستبعد'].includes(decisionResult)) {
        await saveCandidateToDatabase(
          { ...cand, offerResult: decisionResult as any, workShift: (workShift as any) || cand.workShift },
          decisionResult as any,
          fullNotes,
          (workShift as 'نهار' | 'ليل') || undefined,
          decisionResult === 'مستبعد' ? exclusionReason : undefined
        )
      }
    }

    // تحديث سجل المقابلة كمكتملة مع إضافة القرار
    updateInterview(decisionInterview.id, {
      status: 'مكتملة',
      notes: `[قرار المقابلة: ${decisionResult}] ${decisionNotes || ''}`.trim()
    })

    const updatedCandidateForCard = cand
      ? {
          ...cand,
          offerResult: decisionResult,
          workShift: workShift || cand.workShift,
          workLocation: workLocation,
          offerDate: startDate || cand.offerDate,
          notes: fullNotes,
        }
      : null

    const wasAccepted = decisionResult === 'مقبول'
    setDecisionInterview(null)

    if (wasAccepted && updatedCandidateForCard) {
      if (window.confirm('✅ تم قبول واعتماد المرشح بنجاح! هل ترغب في عرض وطباعة كارت الهوية الرقمي الآن؟')) {
        setIdCardCandidate(updatedCandidateForCard)
      }
    } else {
      alert(`تم تسجيل قرار (${decisionResult}) بنجاح وإكمال المقابلة.`)
    }
  }

  const canAddInterview = permissions.canManageInterviews
  const canDelete = permissions.canManageInterviews

  return (
    <ProtectedLayout requiredPermissionKey="canManageInterviews">
      <div className="page-wrapper" style={{ direction: 'rtl' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="page-title">{t('interviews.title', 'جدول المقابلات والتقييم')}</h1>
            <p className="page-subtitle">{interviews.length} مقابلة مسجلة بالنظام</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View Switcher */}
            <div style={{ display: 'inline-flex', background: 'hsl(var(--muted)/0.8)', padding: '3px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'cards' ? 'hsl(var(--card))' : 'transparent',
                  color: viewMode === 'cards' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'inherit',
                }}
              >
                <LayoutGrid size={14} /> بطاقات
              </button>
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
            </div>

            <button onClick={handleExport} className="btn btn-ghost btn-sm" style={{ border: '1px solid hsl(var(--border))' }}>
              <Download size={15} /> Excel
            </button>
            {canAddInterview && (
              <button onClick={() => setShowAddForm(true)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> {t('interviews.schedule', 'جدولة مقابلة جديدة')}
              </button>
            )}
          </div>
        </div>

        {/* ── KPI Summary Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ background: 'hsl(var(--card))', padding: '14px 18px', borderRadius: '12px', border: '1px solid hsl(var(--border))', borderRight: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>إجمالي المقابلات</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'hsl(var(--foreground))', marginTop: '2px' }}>{stats.total}</div>
          </div>
          <div style={{ background: 'hsl(var(--card))', padding: '14px 18px', borderRadius: '12px', border: '1px solid hsl(var(--border))', borderRight: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>⏳ مجدولة وقادمة</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>{stats.scheduled}</div>
          </div>
          <div style={{ background: 'hsl(var(--card))', padding: '14px 18px', borderRadius: '12px', border: '1px solid hsl(var(--border))', borderRight: '4px solid #10b981' }}>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>✅ مقابلات مكتملة ومبتوت فيها</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>{stats.completed}</div>
          </div>
          <div style={{ background: 'hsl(var(--card))', padding: '14px 18px', borderRadius: '12px', border: '1px solid hsl(var(--border))', borderRight: '4px solid #ef4444' }}>
            <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>❌ ملغاة</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>{stats.cancelled}</div>
          </div>
        </div>

        {/* ── Add Interview Form Modal / Card ── */}
        {showAddForm && (
          <div className="section-card" style={{ marginBottom: '20px' }}>
            <div className="section-card-header">
              <h3>{t('interviews.scheduleNew', 'جدولة مقابلة جديدة')}</h3>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setCandidateSearchText('')
                  setShowCandidateDropdown(false)
                }}
                className="btn btn-ghost btn-sm"
              >
                {t('actions.cancel', 'إلغاء')}
              </button>
            </div>
            <div className="section-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {/* خانة بحث واختيار المرشح */}
                <div style={{ position: 'relative' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t('candidates.columns.name', 'اسم المرشح')} *</span>
                    {newInterview.candidateId && (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>✓ تم اختيار المرشح</span>
                    )}
                  </label>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="🔍 اكتب اسم المرشح أو الرقم القومي..."
                      value={candidateSearchText}
                      onChange={(e) => {
                        setCandidateSearchText(e.target.value)
                        setShowCandidateDropdown(true)
                        if (!e.target.value) {
                          setNewInterview({ ...newInterview, candidateId: '', candidateName: '' })
                        }
                      }}
                      onFocus={() => setShowCandidateDropdown(true)}
                      style={{
                        paddingRight: '12px',
                        paddingLeft: newInterview.candidateId ? '32px' : '12px',
                        borderColor: newInterview.candidateId ? '#10b981' : undefined,
                        background: newInterview.candidateId ? 'rgba(16, 185, 129, 0.05)' : undefined,
                      }}
                    />
                    {newInterview.candidateId && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewInterview({ ...newInterview, candidateId: '', candidateName: '' })
                          setCandidateSearchText('')
                          setShowCandidateDropdown(true)
                        }}
                        style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                        title="إلغاء الاختيار"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* قائمة المقترحات المنسدلة للبحث */}
                  {showCandidateDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        left: 0,
                        zIndex: 100,
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '10px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        marginTop: '4px',
                      }}
                    >
                      {searchedCandidates.length > 0 ? (
                        searchedCandidates.map((c) => {
                          const isSelected = newInterview.candidateId === c.id
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                setNewInterview({
                                  ...newInterview,
                                  candidateId: c.id,
                                  candidateName: c.name,
                                  position: c.position || newInterview.position,
                                })
                                setCandidateSearchText(`${c.name} (${c.nationalId})`)
                                setShowCandidateDropdown(false)
                              }}
                              style={{
                                padding: '10px 12px',
                                borderBottom: '1px solid hsl(var(--border))',
                                cursor: 'pointer',
                                background: isSelected ? 'hsl(var(--primary)/0.12)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted)/0.5)')}
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = isSelected ? 'hsl(var(--primary)/0.12)' : 'transparent')
                              }
                            >
                              {/* صورة / رمز المرشح */}
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '8px',
                                  background: 'hsl(var(--primary))',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '14px',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                }}
                              >
                                {c.photoBase64 ? (
                                  <img src={c.photoBase64} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  c.name.charAt(0)
                                )}
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '13px', color: 'hsl(var(--foreground))' }}>
                                  {c.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', display: 'flex', gap: '8px' }}>
                                  <span>🆔 {c.nationalId}</span>
                                  <span>📍 {c.governorate}</span>
                                  <span>🏢 {c.securityCompany}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: '12.5px' }}>
                          لا يوجد مرشح يطابق كلمة البحث "{candidateSearchText}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label">{t('candidates.columns.position', 'المنصب')} *</label>
                  <input type="text" value={newInterview.position} onChange={(e) => setNewInterview({...newInterview, position: e.target.value})} className="form-input" placeholder={t('interviews.positionPlaceholder', 'أدخل المنصب')} />
                </div>
                <div>
                  <label className="form-label">المحاور (اختياري)</label>
                  <input type="text" value={newInterview.interviewer || ''} onChange={(e) => setNewInterview({...newInterview, interviewer: e.target.value})} className="form-input" placeholder="اسم مسؤول المقابلة" />
                </div>
                <div>
                  <label className="form-label">{t('interviews.date', 'التاريخ')} *</label>
                  <input type="date" value={newInterview.date} onChange={(e) => setNewInterview({...newInterview, date: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="form-label">{t('interviews.time', 'الوقت')} *</label>
                  <input type="time" value={newInterview.time} onChange={(e) => setNewInterview({...newInterview, time: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="form-label">{t('candidates.columns.status', 'الحالة')}</label>
                  <select value={newInterview.status} onChange={(e) => setNewInterview({...newInterview, status: e.target.value as any})} className="form-input">
                    <option value="مجدولة">{t('status.scheduled', 'مجدولة')}</option>
                    <option value="مكتملة">{t('status.completed', 'مكتملة')}</option>
                    <option value="ملغاة">{t('status.cancelled', 'ملغاة')}</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">{t('database.columns.notes', 'ملاحظات')}</label>
                  <textarea value={newInterview.notes} onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})} className="form-input" style={{ height: '54px', resize: 'vertical' }} placeholder={t('database.columns.notesPlaceholder', 'تعليمات الحضور أو ملاحظات إضافية')} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleAddInterview} className="btn btn-success">
                  <CheckCircle size={15} />
                  {t('interviews.schedule', 'حفظ وجدولة')}
                </button>
                <button onClick={() => setShowAddForm(false)} className="btn btn-ghost">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Filters & Search ── */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '11px', color: 'hsl(var(--muted-foreground))' }} />
            <input
              type="text"
              className="form-input"
              placeholder="البحث بالاسم أو المحاور أو الوظيفة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: '36px' }}
            />
          </div>

          {/* Quick status pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {[
              { id: '', label: 'الكل' },
              { id: 'مجدولة', label: '⏳ مجدولة' },
              { id: 'مكتملة', label: '✅ مكتملة' },
              { id: 'ملغاة', label: '❌ ملغاة' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setStatusFilter(p.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '99px',
                  border: statusFilter === p.id ? '1.5px solid #6366f1' : '1px solid hsl(var(--border))',
                  background: statusFilter === p.id ? 'rgba(99, 102, 241, 0.12)' : 'hsl(var(--card))',
                  color: statusFilter === p.id ? '#6366f1' : 'hsl(var(--foreground))',
                  fontSize: '12.5px',
                  fontWeight: statusFilter === p.id ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content View ── */}
        {viewMode === 'cards' ? (
          /* Cards Grid View */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {filteredInterviews.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                لا توجد مقابلات تطابق البحث
              </div>
            ) : (
              filteredInterviews.map(interview => {
                const candidateObj = candidates.find(c => c.id === interview.candidateId || c.name === interview.candidateName)
                const phone = candidateObj?.phone
                const hasDecision = candidateObj && candidateObj.offerResult && candidateObj.offerResult !== 'في انتظار'

                return (
                  <div
                    key={interview.id}
                    style={{
                      background: 'hsl(var(--card))',
                      borderRadius: '16px',
                      border: '1px solid hsl(var(--border))',
                      padding: '18px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Avatar */}
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: 'hsl(var(--primary))',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '16px',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {candidateObj?.photoBase64 ? (
                            <img src={candidateObj.photoBase64} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            interview.candidateName.charAt(0)
                          )}
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, fontSize: '15px', color: 'hsl(var(--foreground))' }}>
                            {interview.candidateName}
                          </div>
                          <div style={{ fontSize: '12.5px', color: 'hsl(var(--muted-foreground))', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Briefcase size={13} /> {interview.position} {candidateObj?.securityCompany ? `• ${candidateObj.securityCompany}` : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span className={`badge ${
                          interview.status === 'مكتملة' ? 'badge-success' :
                          interview.status === 'ملغاة'  ? 'badge-danger'  : 'badge-warning'
                        }`}>
                          {interview.status}
                        </span>

                        {hasDecision && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '6px',
                            background: candidateObj?.offerResult === 'مقبول' ? '#10b98120' : candidateObj?.offerResult === 'مرفوض' ? '#ef444420' : '#f59e0b20',
                            color: candidateObj?.offerResult === 'مقبول' ? '#10b981' : candidateObj?.offerResult === 'مرفوض' ? '#ef4444' : '#f59e0b',
                          }}>
                            {candidateObj?.offerResult === 'مقبول' ? '✅ مقبول' : candidateObj?.offerResult === 'مرفوض' ? '❌ مرفوض' : '⚠️ مستبعد'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px 12px', background: 'hsl(var(--muted)/0.3)', borderRadius: '10px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--foreground))' }}>
                        <Calendar size={13} color="#3b82f6" /> {interview.date || '—'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--foreground))' }}>
                        <Clock size={13} color="#f59e0b" /> {interview.time || '—'}
                      </div>
                      {interview.interviewer && (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--muted-foreground))' }}>
                          <User size={13} /> مسؤول المقابلة: <strong>{interview.interviewer}</strong>
                        </div>
                      )}
                    </div>

                    {interview.notes && (
                      <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted)/0.2)', padding: '8px 10px', borderRadius: '8px', lineHeight: 1.4 }}>
                        📝 {interview.notes}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(var(--border)/0.6)', paddingTop: '12px', marginTop: 'auto', gap: '8px' }}>
                      {/* الزر الرئيسي: تقييم واتخاذ القرار */}
                      <button
                        onClick={() => handleOpenDecisionModal(interview)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, hsl(262 72% 45%), hsl(280 70% 50%))',
                          color: 'white',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                          fontFamily: 'inherit',
                        }}
                      >
                        <ClipboardCheck size={14} />
                        <span>{hasDecision ? 'تعديل القرار' : '📋 تقييم واتخاذ القرار'}</span>
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {candidateObj?.offerResult === 'مقبول' && (
                          <button
                            onClick={() => setIdCardCandidate(candidateObj)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: '#10b98118',
                              color: '#10b981',
                              border: '1px solid #10b98140',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="عرض وطباعة كارت الهوية"
                          >
                            <UserCheck size={13} /> كارت
                          </button>
                        )}

                        {phone && (
                          <a
                            href={WhatsAppHelper.getDirectChatUrl(
                              phone,
                              `مرحباً أستاذ ${interview.candidateName}، نود تذكيركم بموعد المقابلة لوظيفة (${interview.position}) يوم ${interview.date} الساعة ${interview.time}. برجاء الحضور في الموعد المحدد.`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: '#25D36618',
                              color: '#25D366',
                              textDecoration: 'none',
                              fontSize: '11.5px',
                              fontWeight: 700,
                            }}
                            title="تذكير واتساب"
                          >
                            <MessageCircle size={13} />
                          </a>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteInterview(interview.id)}
                            title="حذف"
                            style={{ padding: '6px 8px', background: 'transparent', color: 'hsl(var(--muted-foreground))', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          /* Table View */
          <div className="section-card">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('candidates.columns.name', 'المرشح')}</th>
                    <th>{t('candidates.columns.position', 'المنصب')}</th>
                    <th>المحاور</th>
                    <th>{t('interviews.date', 'التاريخ')}</th>
                    <th>{t('interviews.time', 'الوقت')}</th>
                    <th>{t('candidates.columns.status', 'حالة المقابلة')}</th>
                    <th>القرار الأمني</th>
                    <th>{t('candidates.columns.actions', 'الإجراءات والتقييم')}</th>
                    {canDelete && <th>{t('actions.delete', 'حذف')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map(interview => {
                    const candidateObj = candidates.find(c => c.id === interview.candidateId || c.name === interview.candidateName)
                    const hasDecision = candidateObj && candidateObj.offerResult && candidateObj.offerResult !== 'في انتظار'

                    return (
                      <tr key={interview.id}>
                        <td style={{ fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {candidateObj?.photoBase64 ? (
                              <img src={candidateObj.photoBase64} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : null}
                            <span>{interview.candidateName}</span>
                          </div>
                        </td>
                        <td>{interview.position}</td>
                        <td>{interview.interviewer || '-'}</td>
                        <td>{interview.date}</td>
                        <td>{interview.time}</td>
                        <td>
                          <span className={`badge ${
                            interview.status === 'مكتملة' ? 'badge-success' :
                            interview.status === 'ملغاة'  ? 'badge-danger'  : 'badge-warning'
                          }`}>
                            {interview.status}
                          </span>
                        </td>
                        <td>
                          {hasDecision ? (
                            <span style={{
                              fontWeight: 700,
                              fontSize: '12px',
                              color: candidateObj?.offerResult === 'مقبول' ? '#10b981' : candidateObj?.offerResult === 'مرفوض' ? '#ef4444' : '#f59e0b'
                            }}>
                              {candidateObj?.offerResult === 'مقبول' ? '✅ مقبول' : candidateObj?.offerResult === 'مرفوض' ? '❌ مرفوض' : '⚠️ مستبعد'}
                            </span>
                          ) : (
                            <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '11.5px' }}>⏳ قيد المقابلة</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleOpenDecisionModal(interview)}
                              className="btn btn-sm"
                              style={{
                                background: 'linear-gradient(135deg, hsl(262 72% 45%), hsl(280 70% 50%))',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '11.5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <ClipboardCheck size={13} /> {hasDecision ? 'تعديل القرار' : 'اتخاذ القرار'}
                            </button>

                            {candidateObj?.offerResult === 'مقبول' && (
                              <button
                                onClick={() => setIdCardCandidate(candidateObj)}
                                className="btn btn-sm"
                                style={{ background: '#10b98118', color: '#10b981', border: '1px solid #10b98140' }}
                                title="عرض كارت الهوية"
                              >
                                🪪
                              </button>
                            )}
                          </div>
                        </td>
                        {canDelete && (
                          <td>
                            <button onClick={() => handleDeleteInterview(interview.id)} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredInterviews.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>
                لا توجد مقابلات مطابقة
              </div>
            )}
          </div>
        )}

        {/* ── نافذة تقييم واتخاذ قرار المقابلة (Decision Modal) ── */}
        {decisionInterview && (
          <div className="modal-overlay">
            <div className="modal-box wide scale-in">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, hsl(262 72% 38%), hsl(280 70% 48%))', color: 'white', padding: '16px 20px', borderRadius: '16px 16px 0 0' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>📋 تقييم واعتماد نتيجة المقابلة</h3>
                  <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                    المرشح: <strong>{decisionInterview.candidateName}</strong> — الوظيفة: {decisionInterview.position}
                  </div>
                </div>
                <button
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', padding: '6px' }}
                  onClick={() => setDecisionInterview(null)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. أزرار اختيار القرار (قبول / رفض / استبعاد) */}
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>نتيجة وقرار المقابلة *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setDecisionResult('مقبول')}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: decisionResult === 'مقبول' ? '2px solid #10b981' : '1px solid hsl(var(--border))',
                        background: decisionResult === 'مقبول' ? '#10b98115' : 'hsl(var(--card))',
                        color: decisionResult === 'مقبول' ? '#10b981' : 'hsl(var(--foreground))',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.15s',
                        fontFamily: 'inherit',
                      }}
                    >
                      <CheckCircle2 size={18} />
                      <span>قبول وتعيين</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionResult('مرفوض')}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: decisionResult === 'مرفوض' ? '2px solid #ef4444' : '1px solid hsl(var(--border))',
                        background: decisionResult === 'مرفوض' ? '#ef444415' : 'hsl(var(--card))',
                        color: decisionResult === 'مرفوض' ? '#ef4444' : 'hsl(var(--foreground))',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.15s',
                        fontFamily: 'inherit',
                      }}
                    >
                      <XCircle size={18} />
                      <span>رفض</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionResult('مستبعد')}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: decisionResult === 'مستبعد' ? '2px solid #f59e0b' : '1px solid hsl(var(--border))',
                        background: decisionResult === 'مستبعد' ? '#f59e0b15' : 'hsl(var(--card))',
                        color: decisionResult === 'مستبعد' ? '#f59e0b' : 'hsl(var(--foreground))',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.15s',
                        fontFamily: 'inherit',
                      }}
                    >
                      <AlertTriangle size={18} />
                      <span>استبعاد أمني</span>
                    </button>
                  </div>
                </div>

                {/* 2. حقول القبول (الوردية، الموقع، تاريخ البدء) */}
                {decisionResult === 'مقبول' && (
                  <div style={{ padding: '14px', borderRadius: '12px', background: '#10b9810c', border: '1px solid #10b98130', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#10b981' }}>
                      📋 تفاصيل التسكين والتعيين الميداني:
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="form-label">الوردية المقررة</label>
                        <select
                          value={workShift}
                          onChange={(e) => setWorkShift(e.target.value as any)}
                          className="form-input"
                        >
                          <option value="">بدون وردية</option>
                          <option value="نهار">☀️ نهار</option>
                          <option value="ليل">🌙 ليل</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">الموقع / المنشأة</label>
                        <input
                          type="text"
                          value={workLocation}
                          onChange={(e) => setWorkLocation(e.target.value)}
                          className="form-input"
                          placeholder="مثال: البوابة الرئيسية / قطاع الفنادق"
                        />
                      </div>

                      <div>
                        <label className="form-label">تاريخ بدء العمل</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. سبب الرفض إن وجد */}
                {decisionResult === 'مرفوض' && (
                  <div>
                    <label className="form-label">سبب الرفض</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="form-input"
                      placeholder="مثال: عدم اجتياز اختبار اللياقة / المظهر غير مطابق"
                    />
                  </div>
                )}

                {/* 4. سبب الاستبعاد إن وجد */}
                {decisionResult === 'مستبعد' && (
                  <div>
                    <label className="form-label">سبب الاستبعاد الأمني</label>
                    <input
                      type="text"
                      value={exclusionReason}
                      onChange={(e) => setExclusionReason(e.target.value)}
                      className="form-input"
                      placeholder="مثال: قيد أمني سابق / سابقة فصل تأديبي"
                    />
                  </div>
                )}

                {/* 5. ملاحظات المقابلة العامة */}
                <div>
                  <label className="form-label">ملاحظات مسؤول المقابلة</label>
                  <textarea
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    className="form-input"
                    style={{ height: '60px', resize: 'vertical' }}
                    placeholder="أي ملاحظات فنية أو سلوكية أثناء المقابلة..."
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setDecisionInterview(null)}
                  className="btn btn-ghost"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSubmitInterviewDecision}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, hsl(262 72% 45%), hsl(280 70% 50%))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700,
                  }}
                >
                  <CheckCircle size={15} />
                  <span>اعتماد القرار وحفظ المقابلة</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ID Card Modal (عند قبول المرشح وطباعة الكارت) ── */}
        {idCardCandidate && (
          <CandidateIDCard
            candidate={{
              ...idCardCandidate,
              workShift: (idCardCandidate as any).workShift,
              workLocation: (idCardCandidate as any).workLocation,
            }}
            onClose={() => setIdCardCandidate(null)}
          />
        )}

      </div>
    </ProtectedLayout>
  )
}

export default InterviewsPage
