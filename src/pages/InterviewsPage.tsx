import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const InterviewsPage: React.FC = () => {
  const { 
    currentUser, 
    interviews, 
    candidates,
    addInterview, 
    updateInterview, 
    deleteInterview 
  } = useStore()
  
  const { t } = useTranslation()
  const [showAddForm, setShowAddForm] = useState(false)
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
    setShowAddForm(false)
    alert(t('interviews.scheduleSuccess', 'تم جدولة المقابلة بنجاح'))
  }

  const handleUpdateInterview = (id: string, status: string) => {
    updateInterview(id, { status: status as any })
    alert(t('interviews.updateSuccess', 'تم تحديث حالة المقابلة بنجاح'))
  }

  const handleDeleteInterview = (id: string) => {
    if (window.confirm(t('interviews.deleteConfirm', 'هل أنت متأكد من حذف هذه المقابلة؟'))) {
      deleteInterview(id)
      alert(t('interviews.deleteSuccess', 'تم حذف المقابلة بنجاح'))
    }
  }

  const canAddInterview = currentUser?.userType === 'interview_manager' || currentUser?.userType === 'admin'
  const canDelete = currentUser?.userType === 'admin'

  return (
    <ProtectedLayout requiredPermissions={['interview_manager', 'admin']}>
      <div className="page-wrapper" style={{ direction: 'rtl' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 className="page-title">{t('interviews.title', 'المقابلات')}</h1>
            <p className="page-subtitle">{t('interviews.subtitle', '{{count}} مقابلة مسجلة', { count: interviews.length })}</p>
          </div>
          {canAddInterview && (
            <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
              <Plus size={16} />
              {t('interviews.schedule', 'جدولة مقابلة')}
            </button>
          )}
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="section-card" style={{ marginBottom: '20px' }}>
            <div className="section-card-header">
              <h3>{t('interviews.scheduleNew', 'جدولة مقابلة جديدة')}</h3>
              <button onClick={() => setShowAddForm(false)} className="btn btn-ghost btn-sm">{t('actions.cancel', 'إلغاء')}</button>
            </div>
            <div className="section-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">{t('candidates.columns.name', 'اسم المرشح')} *</label>
                  <select
                    value={newInterview.candidateId}
                    onChange={(e) => {
                      const sel = candidates.find(c => c.id === e.target.value)
                      setNewInterview({ ...newInterview, candidateId: e.target.value, candidateName: sel?.name || '' })
                    }}
                    className="form-input"
                  >
                    <option value="">{t('actions.selectType', { type: t('candidates.columns.name', 'المرشح') })}</option>
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.governorate}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('candidates.columns.position', 'المنصب')} *</label>
                  <input type="text" value={newInterview.position} onChange={(e) => setNewInterview({...newInterview, position: e.target.value})} className="form-input" placeholder={t('interviews.positionPlaceholder', 'أدخل المنصب')} />
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
                <div>
                  <label className="form-label">{t('database.columns.notes', 'ملاحظات')}</label>
                  <textarea value={newInterview.notes} onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})} className="form-input" style={{ height: '42px', resize: 'none' }} placeholder={t('database.columns.notesPlaceholder', 'ملاحظات إضافية')} />
                </div>
              </div>
              <button onClick={handleAddInterview} className="btn btn-success">
                <CheckCircle size={15} />
                {t('interviews.schedule', 'جدولة المقابلة')}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="section-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('candidates.columns.name', 'المرشح')}</th>
                  <th>{t('candidates.columns.position', 'المنصب')}</th>
                  <th>{t('interviews.date', 'التاريخ')}</th>
                  <th>{t('interviews.time', 'الوقت')}</th>
                  <th>{t('candidates.columns.status', 'الحالة')}</th>
                  <th>{t('candidates.columns.actions', 'الإجراءات')}</th>
                  {canDelete && <th>{t('actions.delete', 'حذف')}</th>}
                </tr>
              </thead>
              <tbody>
                {interviews.map(interview => (
                  <tr key={interview.id}>
                    <td style={{ fontWeight: 600 }}>{interview.candidateName}</td>
                    <td>{interview.position}</td>
                    <td style={{ color: 'hsl(215 16% 52%)' }}>{interview.date}</td>
                    <td style={{ color: 'hsl(215 16% 52%)' }}>{interview.time}</td>
                    <td>
                      <span className={
                        interview.status === 'مكتملة' ? 'badge badge-success' :
                        interview.status === 'ملغاة'  ? 'badge badge-danger'  : 'badge badge-info'
                      }>
                        {t(`status.${interview.status === 'مكتملة' ? 'completed' : interview.status === 'ملغاة' ? 'cancelled' : 'scheduled'}`, interview.status)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleUpdateInterview(interview.id, 'مكتملة')} className="btn btn-success btn-sm">
                          <CheckCircle size={13} /> {t('status.completed', 'مكتملة')}
                        </button>
                        <button onClick={() => handleUpdateInterview(interview.id, 'ملغاة')} className="btn btn-danger btn-sm">
                          <XCircle size={13} /> {t('actions.cancel', 'إلغاء')}
                        </button>
                      </div>
                    </td>
                    {canDelete && (
                      <td>
                        <button onClick={() => handleDeleteInterview(interview.id)} className="btn btn-ghost btn-sm" style={{ color: 'hsl(4 86% 58%)' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {interviews.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'hsl(215 16% 52%)', fontSize: '14px' }}>
              {t('interviews.noResults', 'لا توجد مقابلات مجدولة حتى الآن')}
            </div>
          )}
        </div>

      </div>
    </ProtectedLayout>
  )
}

export default InterviewsPage
