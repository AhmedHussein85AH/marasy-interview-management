import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { useTranslation } from 'react-i18next'
import { Save, X, Eye, EyeOff } from 'lucide-react'
import { usePermissions } from '../hooks/usePermissions'
import { PERMISSION_LABELS, PERMISSION_GROUPS } from '../types/permissions'
import { supabase } from '../integrations/supabase/client'

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserRoleInSupabase, users } = useStore()
  const { t, i18n } = useTranslation()
  const dir = i18n.language === 'en' ? 'ltr' : 'rtl'
  const perms = usePermissions()

  const [editName, setEditName] = useState(currentUser?.name || '')
  const [editDepartment, setEditDepartment] = useState(currentUser?.department || '')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  if (!currentUser) return null

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateUserRoleInSupabase(currentUser.id, currentUser.userType)
      alert('تم تحديث الملف الشخصي')
      setIsEditing(false)
    } catch {
      alert('فشل في تحديث الملف الشخصي')
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('يرجى ملء جميع الحقول')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمة المرور الجديدة غير متطابقة')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordSuccess('تم تغيير كلمة المرور بنجاح')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      setPasswordError(e.message || 'فشل في تغيير كلمة المرور')
    }
    setChangingPassword(false)
  }

  const activePermissions = Object.entries(perms)
    .filter(([, v]) => v === true)
    .map(([k]) => PERMISSION_LABELS[k as keyof typeof PERMISSION_LABELS])

  const ROLE_LABELS: Record<string, string> = {
    admin: 'مدير النظام',
    interview_manager: 'مسئول المقابلات',
    security_employee: 'موظف شركة الأمن',
  }

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
      <div className="page-wrapper" style={{ direction: dir }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('profile.title', 'الملف الشخصي')}</h1>
            <p className="page-subtitle">{t('profile.subtitle', 'عرض وتعديل بياناتك الشخصية')}</p>
          </div>
          {!isEditing && (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              {t('profile.edit', 'تعديل الملف')}
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Personal info */}
          <div className="section-card">
            <div className="section-card-header">
              <h3>{t('profile.personalInfo', 'البيانات الشخصية')}</h3>
            </div>
            <div className="section-card-body">
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="form-label">{t('profile.name', 'الاسم')}</label>
                    <input className="form-input" type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">{t('profile.department', 'القسم')}</label>
                    <input className="form-input" type="text" value={editDepartment} onChange={e => setEditDepartment(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn btn-success" onClick={handleSaveProfile} disabled={saving}>
                      <Save size={14} /> {saving ? 'جاري الحفظ...' : t('profile.save', 'حفظ')}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                      <X size={14} /> {t('profile.cancel', 'إلغاء')}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: t('profile.name', 'الاسم'), value: currentUser.name },
                    { label: t('profile.email', 'البريد الإلكتروني'), value: currentUser.email },
                    { label: t('profile.department', 'القسم'), value: currentUser.department },
                    { label: t('profile.role', 'الدور'), value: ROLE_LABELS[currentUser.userType] || currentUser.userType },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{row.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Change password */}
          <div className="section-card">
            <div className="section-card-header">
              <h3>{t('profile.changePassword', 'تغيير كلمة المرور')}</h3>
            </div>
            <div className="section-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">{t('profile.oldPassword', 'كلمة المرور الحالية')}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPassword ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="********" />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="form-label">{t('profile.newPassword', 'كلمة المرور الجديدة')}</label>
                  <input className="form-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="6 أحرف على الأقل" />
                </div>
                <div>
                  <label className="form-label">{t('profile.confirmPassword', 'تأكيد كلمة المرور')}</label>
                  <input className="form-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="أعد إدخال كلمة المرور" />
                </div>
                {passwordError && <div style={{ color: '#ef4444', fontSize: '13px' }}>{passwordError}</div>}
                {passwordSuccess && <div style={{ color: '#22c55e', fontSize: '13px' }}>{passwordSuccess}</div>}
                <button className="btn btn-primary" onClick={handleChangePassword} disabled={changingPassword}>
                  <Save size={14} /> {changingPassword ? 'جاري التغيير...' : t('profile.updatePassword', 'تغيير كلمة المرور')}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Permissions */}
        <div className="section-card" style={{ marginTop: '16px' }}>
          <div className="section-card-header">
            <h3>{t('profile.permissions', 'الصلاحيات الحالية')}</h3>
          </div>
          <div className="section-card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {activePermissions.map(p => (
                <span key={p} className="badge badge-primary">{p}</span>
              ))}
              {activePermissions.length === 0 && (
                <span className="muted">{t('profile.noPermissions', 'لا توجد صلاحيات')}</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </ProtectedLayout>
  )
}

export default ProfilePage
