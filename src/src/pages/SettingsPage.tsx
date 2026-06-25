import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const candidatesRef = useRef<HTMLInputElement>(null)
  const savedRef = useRef<HTMLInputElement>(null)

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
