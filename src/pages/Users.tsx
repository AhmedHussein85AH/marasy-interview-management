import React, { useState } from 'react'
import { useStore, UserType } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { DEFAULT_PERMISSIONS, PERMISSION_GROUPS, PERMISSION_LABELS, UserPermissions } from '../types/permissions'
import { Plus, Edit, Trash2, Ban, CheckCircle, Shield, ChevronDown, ChevronUp, Save, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid hsl(var(--border))', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', outline: 'none' } as const
const btnStyle = (bg: string, text = 'white') => ({ backgroundColor: bg, color: text, padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' } as const)

const ROLE_LABELS: Record<string, string> = {
  admin: 'مدير النظام',
  interview_manager: 'مسئول المقابلات',
  security_employee: 'موظف شركة الأمن',
}
const ROLE_COLORS: Record<string, string> = {
  admin: '#ef4444',
  interview_manager: '#f59e0b',
  security_employee: '#3b82f6',
}

export default function Users() {
  const { users, currentUser, addUserToSupabase, updateUserRoleInSupabase, deleteUserFromSupabase, toggleUserStatus, updateUserPermissions } = useStore()
  const { t, i18n } = useTranslation()
  const dir = i18n.language === 'en' ? 'ltr' : 'rtl'

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [permissionsId, setPermissionsId] = useState<string | null>(null)
  const [draftPermissions, setDraftPermissions] = useState<UserPermissions | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(PERMISSION_GROUPS.map(g => g.label))
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [newUser, setNewUser] = useState({ name: '', email: '', department: '', userType: 'security_employee' as UserType, password: '' })

  const canManage = currentUser?.userType === 'admin'

  // ── Add user ─────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newUser.name || !newUser.email || !newUser.department) { setError('يرجى ملء جميع الحقول'); return }
    setLoading(true); setError('')
    try {
      await addUserToSupabase(newUser)
      setNewUser({ name: '', email: '', department: '', userType: 'security_employee', password: '' })
      setIsAdding(false)
      alert(`✅ تم إضافة المستخدم "${newUser.name}" بنجاح!`)
    } catch (e: any) { setError(e?.message || 'فشل في إضافة المستخدم') }
    finally { setLoading(false) }
  }

  // ── Update role ──────────────────────────────────────────
  const handleUpdateRole = async (userId: string, role: UserType) => {
    setLoading(true)
    try { await updateUserRoleInSupabase(userId, role); setEditingId(null) }
    catch { setError('فشل في تحديث الدور') }
    finally { setLoading(false) }
  }

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (userId: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف "${name}"؟`)) return
    setDeletingId(userId)
    try { await deleteUserFromSupabase(userId) }
    catch (e: any) { alert(e.message || 'فشل في الحذف') }
    finally { setDeletingId(null) }
  }

  // ── Toggle status ────────────────────────────────────────
  const handleToggle = async (userId: string, name: string, active: boolean) => {
    if (!window.confirm(`هل أنت متأكد من ${active ? 'تعطيل' : 'تفعيل'} حساب "${name}"؟`)) return
    setLoading(true)
    try { await toggleUserStatus(userId, !active) }
    catch (e: any) { alert(e.message || 'فشل') }
    finally { setLoading(false) }
  }

  // ── Permissions ──────────────────────────────────────────
  const openPermissions = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return
    const base = user.permissions || DEFAULT_PERMISSIONS[user.userType] || DEFAULT_PERMISSIONS.security_employee
    setDraftPermissions({ ...base })
    setPermissionsId(userId)
  }

  const handleSavePermissions = async () => {
    if (!permissionsId || !draftPermissions) return
    setLoading(true)
    try {
      await updateUserPermissions(permissionsId, draftPermissions)
      alert('تم حفظ الصلاحيات بنجاح')
      setPermissionsId(null); setDraftPermissions(null)
    } catch { alert('فشل في حفظ الصلاحيات') }
    finally { setLoading(false) }
  }

  const applyPreset = (role: UserType) => {
    setDraftPermissions({ ...DEFAULT_PERMISSIONS[role] })
  }

  const toggleGroup = (label: string) =>
    setExpandedGroups(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label])

  return (
    <ProtectedLayout requiredPermissions={['admin']}>
      <div className="page-wrapper" style={{ direction: dir }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h1 className="page-title">إدارة المستخدمين</h1>
            <p className="page-subtitle">{users.length} مستخدم في النظام</p>
          </div>
          {canManage && (
            <button onClick={() => setIsAdding(true)} style={btnStyle('#3b82f6')}>
              <Plus size={15} /> إضافة مستخدم
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <div key={role} className="section-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: ROLE_COLORS[role] }}>
                {users.filter(u => u.userType === role).length}
              </div>
              <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {isAdding && (
          <div className="section-card" style={{ marginBottom: '20px' }}>
            <div className="section-card-header">
              <h3>إضافة مستخدم جديد</h3>
              <button onClick={() => setIsAdding(false)} style={btnStyle('#94a3b8')}>إلغاء</button>
            </div>
            <div className="section-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div><label className="form-label">الاسم الكامل *</label><input style={inputStyle} value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="الاسم الكامل" /></div>
                <div><label className="form-label">البريد الإلكتروني *</label><input type="email" style={inputStyle} value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="example@company.com" /></div>
                <div><label className="form-label">كلمة المرور *</label><input type="password" style={inputStyle} value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="كلمة مرور قوية" /></div>
                <div><label className="form-label">القسم *</label><input style={inputStyle} value={newUser.department} onChange={e => setNewUser(p => ({ ...p, department: e.target.value }))} placeholder="اسم القسم" /></div>
                <div>
                  <label className="form-label">الدور</label>
                  <select style={inputStyle} value={newUser.userType} onChange={e => setNewUser(p => ({ ...p, userType: e.target.value as UserType }))}>
                    {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '10px' }}>{error}</div>}
              <button onClick={handleAdd} disabled={loading} style={btnStyle('#22c55e')}>
                <Save size={14} /> {loading ? 'جاري الإضافة...' : 'إضافة المستخدم'}
              </button>
            </div>
          </div>
        )}

        {/* Users list */}
        <div className="section-card">
          <div className="section-card-header"><h3>أعضاء الفريق</h3></div>
          <div style={{ padding: '8px 0' }}>
            {users.map(user => (
              <div key={user.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 24px', borderBottom: '1px solid hsl(var(--border))',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--muted)/0.4)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Avatar + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${ROLE_COLORS[user.userType]}, ${ROLE_COLORS[user.userType]}99)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))', fontSize: '14px' }}>
                      {user.name}
                      {user.isActive === false && (
                        <span style={{ marginRight: '8px', fontSize: '11px', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>معطل</span>
                      )}
                      {user.permissions && (
                        <span style={{ marginRight: '6px', fontSize: '11px', background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>صلاحيات مخصصة</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{user.email} · {user.department}</div>
                  </div>
                </div>

                {/* Role + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Role badge / edit */}
                  {editingId === user.id ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select style={{ ...inputStyle, width: 'auto', padding: '6px 10px' }}
                        value={user.userType}
                        onChange={e => handleUpdateRole(user.id, e.target.value as UserType)}>
                        {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}><X size={16} /></button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '99px', background: `${ROLE_COLORS[user.userType]}18`, color: ROLE_COLORS[user.userType] }}>
                      {ROLE_LABELS[user.userType]}
                    </span>
                  )}

                  {canManage && (
                    <>
                      {/* Edit role */}
                      <button onClick={() => setEditingId(user.id)} title="تعديل الدور"
                        style={{ background: 'none', border: '1px solid hsl(var(--border))', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>
                        <Edit size={14} />
                      </button>

                      {/* Permissions */}
                      <button onClick={() => openPermissions(user.id)} title="تعديل الصلاحيات"
                        style={{ background: 'none', border: '1px solid hsl(var(--border))', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: '#7c3aed' }}>
                        <Shield size={14} />
                      </button>

                      {currentUser?.id !== user.id && (
                        <>
                          {/* Toggle status */}
                          <button onClick={() => handleToggle(user.id, user.name, user.isActive ?? true)}
                            title={user.isActive === false ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                            style={{ background: 'none', border: '1px solid hsl(var(--border))', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: user.isActive === false ? '#22c55e' : '#f59e0b' }}>
                            {user.isActive === false ? <CheckCircle size={14} /> : <Ban size={14} />}
                          </button>

                          {/* Delete */}
                          <button onClick={() => handleDelete(user.id, user.name)} disabled={deletingId === user.id}
                            style={{ background: 'none', border: '1px solid #fecaca', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: '#ef4444' }}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Modal */}
        {permissionsId && draftPermissions && (() => {
          const user = users.find(u => u.id === permissionsId)
          return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
              <div style={{ background: 'hsl(var(--card))', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', direction: 'rtl' }}>

                {/* Modal header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'hsl(var(--card))', zIndex: 1 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                      صلاحيات: {user?.name}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                      تخصيص الصلاحيات بشكل مستقل عن الدور
                    </p>
                  </div>
                  <button onClick={() => { setPermissionsId(null); setDraftPermissions(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Presets */}
                <div style={{ padding: '14px 24px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>تطبيق إعدادات:</span>
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <button key={role} onClick={() => applyPreset(role as UserType)}
                      style={{ padding: '4px 12px', borderRadius: '99px', border: `1px solid ${ROLE_COLORS[role]}`, background: 'transparent', color: ROLE_COLORS[role], fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {label}
                    </button>
                  ))}
                  <button onClick={() => setDraftPermissions(Object.fromEntries(Object.keys(draftPermissions).map(k => [k, true])) as UserPermissions)}
                    style={{ padding: '4px 12px', borderRadius: '99px', border: '1px solid #22c55e', background: 'transparent', color: '#22c55e', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    تحديد الكل
                  </button>
                  <button onClick={() => setDraftPermissions(Object.fromEntries(Object.keys(draftPermissions).map(k => [k, false])) as UserPermissions)}
                    style={{ padding: '4px 12px', borderRadius: '99px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    إلغاء الكل
                  </button>
                </div>

                {/* Permission groups */}
                <div style={{ padding: '8px 0' }}>
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.label} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      {/* Group header */}
                      <button onClick={() => toggleGroup(group.label)}
                        style={{ width: '100%', padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>{group.label}</span>
                          <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
                            ({group.keys.filter(k => draftPermissions[k]).length}/{group.keys.length})
                          </span>
                        </div>
                        {expandedGroups.includes(group.label) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {/* Permissions */}
                      {expandedGroups.includes(group.label) && (
                        <div style={{ padding: '4px 24px 12px' }}>
                          {group.keys.map(key => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid hsl(var(--border)/0.5)' }}>
                              <div
                                onClick={() => setDraftPermissions(p => p ? { ...p, [key]: !p[key] } : p)}
                                style={{
                                  width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0, cursor: 'pointer',
                                  background: draftPermissions[key] ? '#3b82f6' : 'hsl(var(--muted))',
                                  border: `2px solid ${draftPermissions[key] ? '#3b82f6' : 'hsl(var(--border))'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {draftPermissions[key] && <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                              </div>
                              <span style={{ fontSize: '13px', color: 'hsl(var(--foreground))', userSelect: 'none' }}>
                                {PERMISSION_LABELS[key]}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid hsl(var(--border))', display: 'flex', gap: '8px', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: 'hsl(var(--card))' }}>
                  <button onClick={() => { setPermissionsId(null); setDraftPermissions(null) }} style={btnStyle('#94a3b8')}>إلغاء</button>
                  <button onClick={handleSavePermissions} disabled={loading} style={btnStyle('#3b82f6')}>
                    <Save size={14} /> {loading ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
                  </button>
                </div>

              </div>
            </div>
          )
        })()}

      </div>
    </ProtectedLayout>
  )
}
