import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { Download, Upload, AlertTriangle, CheckCircle, Plus, Trash2, Edit2, RotateCcw, ListFilter, Briefcase, Building2, MapPin, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEditableLists, ListType } from '../hooks/useEditableLists'

const btn = (bg: string) => ({
  backgroundColor: bg, color: 'white', padding: '10px 20px',
  border: 'none', borderRadius: '8px', cursor: 'pointer',
  fontSize: '14px', fontWeight: 600, display: 'inline-flex',
  alignItems: 'center', gap: '6px', fontFamily: 'inherit'
} as const)

const card = {
  background: 'hsl(var(--card))', padding: '24px', borderRadius: '12px',
  marginBottom: '20px', border: '1px solid hsl(var(--border))',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
} as const

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const dir = i18n.language === 'en' ? 'ltr' : 'rtl'
  const { currentUser, users, candidates, savedCandidates, resetData, bulkAddCandidates, bulkAddSavedCandidates } = useStore()
  const {
    allPositions, allCompanies, allGovernorates,
    addItem, deleteItem, editItem, resetList
  } = useEditableLists()

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const candidatesRef = useRef<HTMLInputElement>(null)
  const savedRef = useRef<HTMLInputElement>(null)

  // ── Lists Management State ──────────────────────────────
  const [activeListTab, setActiveListTab] = useState<ListType>('positions')
  const [listSearch, setListSearch] = useState('')
  const [newListItem, setNewListItem] = useState('')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // ── Export ──────────────────────────────────────────────
  const exportJSON = (data: any[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  }

  // ── Import candidates ───────────────────────────────────
  const handleImportCandidates = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!Array.isArray(data)) throw new Error(t('settings.arrayRequired', 'الملف يجب أن يحتوي على مصفوفة'))
      const result = await bulkAddCandidates(data)
      setImportMsg({ type: 'success', text: t('settings.importSuccess', 'تم استيراد {{success}} مرشح بنجاح{{failedMsg}}', { success: result.success, failedMsg: result.failed > 0 ? ` (${result.failed} فشل)` : '' }) })
    } catch (err: any) {
      setImportMsg({ type: 'error', text: t('settings.importError', 'خطأ في الاستيراد: {{message}}', { message: err.message }) })
    }
    if (candidatesRef.current) candidatesRef.current.value = ''
  }

  const handleImportSaved = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!Array.isArray(data)) throw new Error(t('settings.arrayRequired', 'الملف يجب أن يحتوي على مصفوفة'))
      const result = await bulkAddSavedCandidates(data)
      setImportMsg({ type: 'success', text: t('settings.importSuccess', 'تم استيراد {{success}} سجل بنجاح{{failedMsg}}', { success: result.success, failedMsg: result.failed > 0 ? ` (${result.failed} فشل)` : '' }) })
    } catch (err: any) {
      setImportMsg({ type: 'error', text: t('settings.importError', 'خطأ في الاستيراد: {{message}}', { message: err.message }) })
    }
    if (savedRef.current) savedRef.current.value = ''
  }

  const handleResetData = () => {
    resetData()
    alert(t('settings.resetSuccess', 'تم إعادة تعيين جميع البيانات بنجاح'))
    setShowResetConfirm(false)
  }

  const systemInfo = {
    version: '2.0.0',
    lastUpdate: new Date().toLocaleDateString('en-GB'),
    totalUsers: users.length,
  }

  // Current active list data
  const currentItems = activeListTab === 'positions'
    ? allPositions
    : activeListTab === 'companies'
      ? allCompanies
      : allGovernorates

  const filteredItems = currentItems.filter(item =>
    item.toLowerCase().includes(listSearch.trim().toLowerCase())
  )

  const handleAddListItem = () => {
    const trimmed = newListItem.trim()
    if (!trimmed) return
    if (currentItems.includes(trimmed)) {
      alert('هذا العنصر موجود بالفعل')
      return
    }
    addItem(activeListTab, trimmed)
    setNewListItem('')
  }

  const handleSaveEdit = (oldItem: string) => {
    const trimmed = editingValue.trim()
    if (!trimmed) return
    editItem(activeListTab, oldItem, trimmed)
    setEditingItem(null)
    setEditingValue('')
  }

  const handleDeleteListItem = (item: string) => {
    deleteItem(activeListTab, item)
    setDeleteConfirm(null)
  }

  const handleResetCurrentList = () => {
    const title = activeListTab === 'positions' ? 'الوظائف' : activeListTab === 'companies' ? 'شركات الأمن' : 'المحافظات'
    if (window.confirm(`هل أنت متأكد من استعادة القائمة الافتراضية لـ ${title}؟`)) {
      resetList(activeListTab)
      setDeleteConfirm(null)
    }
  }

  return (
    <ProtectedLayout requiredPermissions={['admin']}>
      <div className="page-wrapper" style={{ direction: dir }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 className="page-title">{t('nav.settings', 'إعدادات النظام')}</h1>
          <p className="page-subtitle">{t('nav.settingsDesc', 'إدارة البيانات والنظام')}</p>
        </div>

        {/* Import message */}
        {importMsg && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: importMsg.type === 'success' ? 'hsl(152 55% 94%)' : 'hsl(4 86% 95%)',
            border: `1px solid ${importMsg.type === 'success' ? 'hsl(152 55% 75%)' : 'hsl(4 86% 80%)'}`,
            color: importMsg.type === 'success' ? 'hsl(152 69% 30%)' : 'hsl(4 86% 40%)',
          }}>
            {importMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{importMsg.text}</span>
            <button onClick={() => setImportMsg(null)} style={{ marginRight: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'inherit' }}>✕</button>
          </div>
        )}

        {/* ── Lists & Taxonomies Master Control ── */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ color: 'hsl(var(--foreground))', margin: 0, fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListFilter size={20} color="#6366f1" />
                <span>إدارة القوائم والتصنيفات (Dropdown Lists)</span>
              </h3>
              <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', margin: '4px 0 0 0' }}>
                تحكم كامل للإدارة في إضافة، حذف، وتعديل خيارات الوظائف، شركات الأمن، والمحافظات عبر النظام بالكامل
              </p>
            </div>
            <button
              onClick={handleResetCurrentList}
              style={{
                background: 'transparent',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--muted-foreground))',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit'
              }}
            >
              <RotateCcw size={13} /> استعادة الافتراضي
            </button>
          </div>

          {/* List Selector Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px' }}>
            {[
              { id: 'positions' as const, label: 'الوظائف (Positions)', icon: Briefcase, count: allPositions.length, color: '#3b82f6' },
              { id: 'companies' as const, label: 'شركات الأمن (Companies)', icon: Building2, count: allCompanies.length, color: '#10b981' },
              { id: 'governorates' as const, label: 'المحافظات (Governorates)', icon: MapPin, count: allGovernorates.length, color: '#f59e0b' },
            ].map(tab => {
              const Icon = tab.icon
              const active = activeListTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveListTab(tab.id)
                    setEditingItem(null)
                    setDeleteConfirm(null)
                    setListSearch('')
                  }}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: active ? `1px solid ${tab.color}` : '1px solid transparent',
                    background: active ? `${tab.color}15` : 'hsl(var(--muted)/0.5)',
                    color: active ? tab.color : 'hsl(var(--foreground))',
                    fontWeight: active ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 7px',
                    borderRadius: '99px',
                    background: active ? tab.color : 'hsl(var(--border))',
                    color: active ? '#ffffff' : 'hsl(var(--foreground))',
                    fontWeight: 700,
                  }}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Add Item & Search Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(200px, 300px)', gap: '12px', marginBottom: '16px' }}>
            {/* Add box */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newListItem}
                onChange={e => setNewListItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddListItem() } }}
                placeholder={`إضافة إلى ${activeListTab === 'positions' ? 'الوظائف' : activeListTab === 'companies' ? 'شركات الأمن' : 'المحافظات'}...`}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                onClick={handleAddListItem}
                className="btn btn-success"
                style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> إضافة جديد
              </button>
            </div>

            {/* Search box */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', top: '11px', [dir === 'rtl' ? 'right' : 'left']: '12px', color: 'hsl(var(--muted-foreground))' }} />
              <input
                type="text"
                value={listSearch}
                onChange={e => setListSearch(e.target.value)}
                placeholder="بحث في عناصر القائمة..."
                className="form-input"
                style={{
                  width: '100%',
                  paddingRight: dir === 'rtl' ? '36px' : '12px',
                  paddingLeft: dir === 'ltr' ? '36px' : '12px',
                }}
              />
            </div>
          </div>

          {/* Items Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '10px',
            maxHeight: '360px',
            overflowY: 'auto',
            padding: '4px',
          }}>
            {filteredItems.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'hsl(var(--muted-foreground))' }}>
                لا توجد عناصر مطابقة
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'hsl(var(--muted)/0.4)',
                    border: '1px solid hsl(var(--border))',
                  }}
                >
                  {editingItem === item ? (
                    <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center' }}>
                      <input
                        type="text"
                        autoFocus
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveEdit(item)
                          if (e.key === 'Escape') setEditingItem(null)
                        }}
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: '13px', flex: 1 }}
                      />
                      <button onClick={() => handleSaveEdit(item)} className="btn btn-success btn-sm" style={{ padding: '4px 8px' }}>✓</button>
                      <button onClick={() => setEditingItem(null)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>✕</button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'hsl(var(--foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        {deleteConfirm === item ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              onClick={() => handleDeleteListItem(item)}
                              style={{ padding: '3px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                            >
                              حذف
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{ padding: '3px 6px', background: 'transparent', color: 'hsl(var(--muted-foreground))', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingItem(item); setEditingValue(item) }}
                              title="تعديل الاسم"
                              style={{ background: 'transparent', border: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', padding: '4px' }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(item)}
                              title="حذف من القائمة"
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Export / Import ── */}
        <div style={card}>
          <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '20px', fontSize: '16px', fontWeight: 700 }}>
            📦 {t('settings.importExport', 'استيراد وتصدير البيانات')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Candidates */}
            <div style={{ background: 'hsl(var(--muted))', borderRadius: '10px', padding: '18px' }}>
              <div style={{ fontWeight: 700, color: 'hsl(var(--foreground))', marginBottom: '6px' }}>{t('nav.candidates', 'المرشحون')}</div>
              <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '14px' }}>
                {t('settings.candidatesCount', '{{count}} مرشح في النظام', { count: candidates.length })}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => exportJSON(candidates, `candidates_${new Date().toISOString().split('T')[0]}.json`)}
                  style={btn('#1e293b')}
                >
                  <Download size={14} /> {t('settings.exportJSON', 'تصدير JSON')}
                </button>
                <button onClick={() => candidatesRef.current?.click()} style={btn('#3b82f6')}>
                  <Upload size={14} /> {t('settings.importJSON', 'استيراد JSON')}
                </button>
                <input ref={candidatesRef} type="file" accept=".json" onChange={handleImportCandidates} style={{ display: 'none' }} />
              </div>
            </div>

            {/* Saved candidates */}
            <div style={{ background: 'hsl(var(--muted))', borderRadius: '10px', padding: '18px' }}>
              <div style={{ fontWeight: 700, color: 'hsl(var(--foreground))', marginBottom: '6px' }}>{t('nav.database', 'قاعدة البيانات')}</div>
              <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '14px' }}>
                {t('settings.savedCount', '{{count}} سجل محفوظ', { count: savedCandidates.length })}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => exportJSON(savedCandidates, `saved_candidates_${new Date().toISOString().split('T')[0]}.json`)}
                  style={btn('#1e293b')}
                >
                  <Download size={14} /> {t('settings.exportJSON', 'تصدير JSON')}
                </button>
                <button onClick={() => savedRef.current?.click()} style={btn('#3b82f6')}>
                  <Upload size={14} /> {t('settings.importJSON', 'استيراد JSON')}
                </button>
                <input ref={savedRef} type="file" accept=".json" onChange={handleImportSaved} style={{ display: 'none' }} />
              </div>
            </div>

          </div>

          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'hsl(217 91% 95%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(217 91% 35%)' }}>
            💡 {t('settings.exportTip', 'ملف JSON المُصدَّر يمكن استيراده مرة أخرى في أي نسخة من النظام')}
          </div>
        </div>

        {/* ── System info ── */}
        <div style={card}>
          <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '20px', fontSize: '16px', fontWeight: 700 }}>
            ℹ️ {t('settings.systemInfo', 'معلومات النظام')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { label: t('settings.systemVersion', 'إصدار النظام'),       value: systemInfo.version },
              { label: t('settings.lastUpdate', 'آخر تحديث'),          value: systemInfo.lastUpdate },
              { label: t('users.totalUsers', 'إجمالي المستخدمين'), value: systemInfo.totalUsers },
              { label: t('settings.systemStatus', 'حالة النظام'),        value: t('settings.online', '🟢 متصل') },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'hsl(var(--muted))', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>{r.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Current user ── */}
        <div style={card}>
          <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '20px', fontSize: '16px', fontWeight: 700 }}>
            👤 {t('settings.currentUserInfo', 'معلومات المستخدم الحالي')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { label: t('profile.name', 'الاسم'),             value: currentUser?.name },
              { label: t('profile.email', 'البريد الإلكتروني'), value: currentUser?.email },
              { label: t('profile.department', 'القسم'),             value: currentUser?.department },
              { label: t('dashboard.accountInfo.role', 'الصلاحية'),          value: currentUser?.userType === 'admin' ? t('dashboard.roles.admin') : currentUser?.userType === 'interview_manager' ? t('dashboard.roles.interviewManager') : t('dashboard.roles.securityEmployee') },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'hsl(var(--muted))', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>{r.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Reset ── */}
        <div style={card}>
          <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '16px', fontSize: '16px', fontWeight: 700 }}>
            ⚠️ {t('settings.dangerZone', 'منطقة الخطر')}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'hsl(4 86% 97%)', borderRadius: '10px', border: '1px solid hsl(4 86% 88%)' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'hsl(4 86% 40%)', marginBottom: '4px' }}>{t('settings.resetData', 'إعادة تعيين البيانات')}</div>
              <div style={{ fontSize: '13px', color: 'hsl(4 60% 55%)' }}>{t('settings.resetDataDesc', 'حذف جميع البيانات وإعادة النظام للحالة الأولية - لا يمكن التراجع')}</div>
            </div>
            <button onClick={() => setShowResetConfirm(true)} style={btn('#ef4444')}>
              <AlertTriangle size={14} /> {t('settings.resetData', 'إعادة تعيين')}
            </button>
          </div>
        </div>

        {/* Reset confirm modal */}
        {showResetConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'hsl(var(--card))', padding: '32px', borderRadius: '14px', maxWidth: '400px', width: '90%', textAlign: 'center', direction: dir }}>
              <AlertTriangle size={40} color="#ef4444" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: 'hsl(4 86% 50%)', marginBottom: '12px' }}>{t('settings.confirmResetTitle', 'تأكيد إعادة التعيين')}</h3>
              <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>
                {t('settings.confirmResetWarning', 'هذا الإجراء سيمحو جميع المرشحين والبيانات. لا يمكن التراجع عنه.')}
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={handleResetData} style={btn('#ef4444')}>{t('settings.confirmReset', 'تأكيد الحذف')}</button>
                <button onClick={() => setShowResetConfirm(false)} style={btn('#64748b')}>{t('actions.cancel', 'إلغاء')}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedLayout>
  )
}

export default SettingsPage
