import React, { useMemo } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import {
  Users, Calendar, CheckCircle2, XCircle, Clock, UserPlus,
  ArrowRight, TrendingUp, Sparkles, Building2, Briefcase,
  AlertTriangle, MessageCircle, Phone, ArrowUpRight, BarChart3, ChevronLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { WhatsAppHelper } from '../utils/whatsappHelper'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { currentUser, candidates, interviews } = useStore()

  // ── Computations ──────────────────────────────────────────
  const totalCandidates = candidates.length
  const acceptedCandidates = useMemo(() => candidates.filter(c => c.offerResult === 'مقبول'), [candidates])
  const rejectedCandidates = useMemo(() => candidates.filter(c => c.offerResult === 'مرفوض'), [candidates])
  const excludedCandidates = useMemo(() => candidates.filter(c => c.offerResult === 'مستبعد'), [candidates])
  const pendingCandidates = useMemo(() => candidates.filter(c => !c.offerResult || c.offerResult === 'في انتظار'), [candidates])

  const acceptanceRate = totalCandidates > 0 ? Math.round((acceptedCandidates.length / totalCandidates) * 100) : 0
  const rejectionRate = totalCandidates > 0 ? Math.round((rejectedCandidates.length / totalCandidates) * 100) : 0

  const recentCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 6)
  }, [candidates])

  const upcomingInterviews = useMemo(() => {
    return interviews
      .filter(i => i.status === 'مجدولة')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }, [interviews])

  // Top positions breakdown
  const positionStats = useMemo(() => {
    const counts: Record<string, number> = {}
    candidates.forEach(c => {
      if (c.position) counts[c.position] = (counts[c.position] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        pct: totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0,
      }))
  }, [candidates, totalCandidates])

  // Top companies breakdown
  const companyStats = useMemo(() => {
    const counts: Record<string, number> = {}
    candidates.forEach(c => {
      if (c.securityCompany) counts[c.securityCompany] = (counts[c.securityCompany] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        pct: totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0,
      }))
  }, [candidates, totalCandidates])

  // Greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء الخير'

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Top Hero Greeting & Action Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)/0.6) 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '99px',
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#6366f1',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={13} /> نظام إدارة الأمن الداخلي (Marassi 2.0)
              </span>
              <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'hsl(var(--foreground))', margin: 0 }}>
              {greeting}، {currentUser?.name || 'مرحباً بك'} 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: '6px 0 0 0' }}>
              إليك ملخص مؤشرات التوظيف والمقابلات وأداء الشركات اليوم
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/candidates')}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              }}
            >
              <Users size={16} /> إدارة المرشحين
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="btn btn-ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--card))',
              }}
            >
              <BarChart3 size={16} color="#6366f1" /> التحليلات المتقدمة
            </button>
          </div>
        </div>

        {/* ── KPI Metric Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          {/* Total Candidates */}
          <div style={{
            background: 'hsl(var(--card))',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: '3px', background: '#3b82f6' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>إجمالي المرشحين</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>{totalCandidates}</div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
              <span style={{ color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
                <TrendingUp size={13} /> {acceptanceRate}%
              </span>
              <span>معدل القبول العام</span>
            </div>
          </div>

          {/* Pending Interviews */}
          <div style={{
            background: 'hsl(var(--card))',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: '3px', background: '#f59e0b' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>في انتظار المقابلة</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{pendingCandidates.length}</div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
              <span>{upcomingInterviews.length} مقابلات مجدولة قريباً</span>
            </div>
          </div>

          {/* Accepted / Hired */}
          <div style={{
            background: 'hsl(var(--card))',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: '3px', background: '#10b981' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>المقبولون (تم التوظيف)</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{acceptedCandidates.length}</div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
              <span>جاهزون للتعيين واستخراج الكارنيهات</span>
            </div>
          </div>

          {/* Rejected / Excluded */}
          <div style={{
            background: 'hsl(var(--card))',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: '3px', background: '#ef4444' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>المرفوضون والمستبعدون</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                  {rejectedCandidates.length + excludedCandidates.length}
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
              <span>{rejectedCandidates.length} مرفوض • {excludedCandidates.length} مستبعد</span>
            </div>
          </div>
        </div>

        {/* ── Recruitment Pipeline Funnel ── */}
        <div style={{
          background: 'hsl(var(--card))',
          padding: '22px 24px',
          borderRadius: '16px',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#6366f1" /> مسار التوظيف (Recruitment Funnel)
            </h3>
            <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
              نسب التحويل بين مراحل المقابلة
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Stage 1 */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.07)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600 }}>1. إجمالي المتقدمين</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'hsl(var(--foreground))', marginTop: '4px' }}>{totalCandidates}</div>
              <div style={{ height: '4px', background: '#6366f1', borderRadius: '99px', marginTop: '8px' }} />
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '6px' }}>100% قاعدة البيانات</div>
            </div>

            {/* Stage 2 */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.07)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>2. قيد المراجعة والانتظار</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'hsl(var(--foreground))', marginTop: '4px' }}>{pendingCandidates.length}</div>
              <div style={{ height: '4px', background: '#f59e0b', borderRadius: '99px', marginTop: '8px', width: `${totalCandidates > 0 ? (pendingCandidates.length / totalCandidates) * 100 : 0}%` }} />
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '6px' }}>
                {totalCandidates > 0 ? Math.round((pendingCandidates.length / totalCandidates) * 100) : 0}% من الإجمالي
              </div>
            </div>

            {/* Stage 3 */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.07)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>3. تم القبول والتوظيف</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'hsl(var(--foreground))', marginTop: '4px' }}>{acceptedCandidates.length}</div>
              <div style={{ height: '4px', background: '#10b981', borderRadius: '99px', marginTop: '8px', width: `${acceptanceRate}%` }} />
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '6px' }}>
                {acceptanceRate}% نسبة النجاح
              </div>
            </div>

            {/* Stage 4 */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.07)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>4. تم الرفض والاستبعاد</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'hsl(var(--foreground))', marginTop: '4px' }}>{rejectedCandidates.length + excludedCandidates.length}</div>
              <div style={{ height: '4px', background: '#ef4444', borderRadius: '99px', marginTop: '8px', width: `${rejectionRate}%` }} />
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '6px' }}>
                {rejectionRate}% نسبة الاستبعاد
              </div>
            </div>
          </div>
        </div>

        {/* ── Two Columns: Top Positions/Companies + Recent Activity ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>

          {/* Left: Distribution Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Top Positions */}
            <div className="section-card" style={{ padding: '20px', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={16} color="#3b82f6" /> أعلى الوظائف طلباً
                </h3>
                <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>توزيع المرشحين</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {positionStats.map(pos => (
                  <div key={pos.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{pos.name}</span>
                      <span style={{ color: 'hsl(var(--muted-foreground))' }}>{pos.count} مرشح ({pos.pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'hsl(var(--muted))', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', width: `${pos.pct}%`, borderRadius: '99px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Companies */}
            <div className="section-card" style={{ padding: '20px', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} color="#10b981" /> أكثر شركات الأمن نشاطاً
                </h3>
                <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>حسب عدد المرشحين</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {companyStats.map(comp => (
                  <div key={comp.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{comp.name}</span>
                      <span style={{ color: 'hsl(var(--muted-foreground))' }}>{comp.count} ({comp.pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'hsl(var(--muted))', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', width: `${comp.pct}%`, borderRadius: '99px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Live Feed of Recent Candidates */}
          <div className="section-card" style={{ padding: '20px', margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                  آخر المرشحين المسجلين
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                  أحدث الإضافات والتحديثات
                </p>
              </div>
              <button
                onClick={() => navigate('/candidates')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '12.5px', color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                عرض الكل <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {recentCandidates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'hsl(var(--muted-foreground))', fontSize: '13px' }}>
                  لا يوجد مرشحون مسجلون بعد
                </div>
              ) : (
                recentCandidates.map(c => (
                  <div
                    key={c.id}
                    onClick={() => navigate('/candidates')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'hsl(var(--muted)/0.4)',
                      border: '1px solid hsl(var(--border)/0.6)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        background: 'hsl(var(--primary)/0.15)',
                        color: 'hsl(var(--primary))',
                        fontWeight: 700,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {c.name?.charAt(0) || 'م'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'hsl(var(--foreground))' }}>{c.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'hsl(var(--muted-foreground))' }}>
                          {c.position || 'بدون وظيفة'} • {c.governorate || 'المحافظة'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${c.offerResult === 'مقبول' ? 'badge-success' :
                          c.offerResult === 'مرفوض' ? 'badge-danger' :
                            c.offerResult === 'مستبعد' ? 'badge-muted' : 'badge-warning'
                        }`}>
                        {c.offerResult || 'في انتظار'}
                      </span>
                      {c.phone && (
                        <a
                          href={WhatsAppHelper.getDirectChatUrl(c.phone, WhatsAppHelper.getGeneralFollowUpMessage(c.name))}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            padding: '4px',
                            color: '#25D366',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="واتساب"
                        >
                          <MessageCircle size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </ProtectedLayout>
  )
}

export default DashboardPage
