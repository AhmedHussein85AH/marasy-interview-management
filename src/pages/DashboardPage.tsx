import React, { useMemo } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { Users, Calendar, CheckCircle, XCircle, Clock, UserPlus, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { candidates, interviews, stats } = useStore()

  const recentCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  }, [candidates])

  const pendingInterviews = useMemo(() => {
    return interviews.filter(i => i.status === 'مجدولة').length
  }, [interviews])

  const statsCards = [
    { label: 'إجمالي المرشحين', value: stats.totalCandidates || candidates.length, icon: Users, color: '#2980b9' },
    { label: 'مقابلات مجدولة', value: pendingInterviews, icon: Calendar, color: '#f39c12' },
    { label: 'مقابلات مكتملة', value: stats.completedInterviews, icon: CheckCircle, color: '#27ae60' },
    { label: 'مقبولون', value: stats.hiredCandidates, icon: UserPlus, color: '#16a085' },
    { label: 'مرفوضون', value: stats.rejectedCandidates, icon: XCircle, color: '#e74c3c' },
  ]

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={22} /> لوحة التحكم
            </h1>
            <p className="page-subtitle">نظرة عامة على نظام إدارة المقابلات</p>
          </div>
        </div>

        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {statsCards.map(card => (
            <div key={card.label} className="stats-card" style={{ borderTop: `3px solid ${card.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stats-value" style={{ color: card.color }}>{card.value}</div>
                  <div className="stats-label">{card.label}</div>
                </div>
                <card.icon size={28} style={{ opacity: 0.3, color: card.color }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="section-card">
            <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>آخر المرشحين</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/candidates')}>
                عرض الكل <ArrowRight size={14} />
              </button>
            </div>
            <div className="section-card-body">
              {recentCandidates.length === 0 ? (
                <div className="empty-state"><p>لا يوجد مرشحون بعد</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentCandidates.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'hsl(var(--muted) / 0.3)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.6 }}>{c.position || c.governorate}</div>
                      </div>
                      <span className={`badge ${
                        c.offerResult === 'مقبول' ? 'badge-success' :
                        c.offerResult === 'مرفوض' ? 'badge-danger' :
                        c.offerResult === 'مستبعد' ? 'badge-muted' : 'badge-warning'
                      }`}>{c.offerResult}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>المقابلات القادمة</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/candidates')}>
                عرض الكل <ArrowRight size={14} />
              </button>
            </div>
            <div className="section-card-body">
              {interviews.length === 0 ? (
                <div className="empty-state"><p>لا توجد مقابلات بعد</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {interviews.filter(i => i.status === 'مجدولة').slice(0, 5).map(iv => (
                    <div key={iv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'hsl(var(--muted) / 0.3)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{iv.candidateName}</div>
                        <div style={{ fontSize: '12px', opacity: 0.6 }}>{iv.position} — {new Date(iv.date).toLocaleDateString('ar-EG')}</div>
                      </div>
                      <span className="badge badge-warning">{iv.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

export default DashboardPage
