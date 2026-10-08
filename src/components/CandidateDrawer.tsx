import React from 'react'
import {
  X, Phone, MessageCircle, Calendar, MapPin, Briefcase,
  Building2, GraduationCap, Heart, Clock, Sparkles,
  Edit2, Trash2, Printer, CheckCircle, XCircle, AlertTriangle, Shield, FileText, Download
} from 'lucide-react'
import { WhatsAppHelper } from '../utils/whatsappHelper'
import { MarassiAI } from '../utils/aiAnalyzer'

interface CandidateDrawerProps {
  candidate: any | null
  isOpen: boolean
  onClose: () => void
  onEdit: (candidate: any) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, result: 'مقبول' | 'مرفوض' | 'مستبعد') => void
  onPrintCard: (candidate: any) => void
  canEdit: boolean
  canDelete: boolean
  canUpdateStatus: boolean
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  candidate,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onPrintCard,
  canEdit,
  canDelete,
  canUpdateStatus,
}) => {
  if (!isOpen || !candidate) return null

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    'مقبول': { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: '#10b981' },
    'مرفوض': { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: '#ef4444' },
    'مستبعد': { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: '#f59e0b' },
    'في انتظار': { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: '#3b82f6' },
  }

  const currentStatus = candidate.offerResult || 'في انتظار'
  const statusStyle = statusColors[currentStatus] || statusColors['في انتظار']

  const aiRec = MarassiAI.analyzeCandidate({
    ...candidate,
    experienceYears: candidate.experienceYears || 0,
    educationLevel: candidate.qualification,
  })

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1050,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(3px)',
      transition: 'opacity 0.25s ease',
    }}>
      {/* Backdrop click to close */}
      <div style={{ flex: 1 }} onClick={onClose} />

      {/* Drawer content */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        height: '100%',
        boxShadow: '-8px 0 25px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        borderLeft: '1px solid hsl(var(--border))',
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid hsl(var(--border))',
          background: 'linear-gradient(180deg, hsl(var(--muted)/0.5) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {candidate.photoBase64 ? (
              <img
                src={candidate.photoBase64}
                alt={candidate.name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  border: '2px solid hsl(var(--primary))',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                flexShrink: 0,
              }}>
                {candidate.name?.charAt(0) || 'م'}
              </div>
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                {candidate.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '99px',
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.text,
                  border: `1px solid ${statusStyle.border}`,
                }}>
                  {currentStatus}
                </span>
                <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                  {candidate.nationalId || 'بدون رقم قومي'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'hsl(var(--muted-foreground))',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Quick Bar */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid hsl(var(--border))',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          background: 'hsl(var(--muted)/0.25)',
        }}>
          {candidate.phone && (
            <>
              <a
                href={WhatsAppHelper.getDirectChatUrl(candidate.phone, WhatsAppHelper.getGeneralFollowUpMessage(candidate.name))}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#25D366',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <MessageCircle size={15} /> واتساب
              </a>
              <a
                href={`tel:${candidate.phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <Phone size={15} /> اتصال
              </a>
            </>
          )}

          <button
            onClick={() => onPrintCard(candidate)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            <Printer size={15} /> كارنيه
          </button>

          {canEdit && (
            <button
              onClick={() => onEdit(candidate)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              <Edit2 size={14} /> تعديل
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(candidate.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              <Trash2 size={14} /> حذف
            </button>
          )}
        </div>

        {/* Status Decision Quick Transition */}
        {canUpdateStatus && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid hsl(var(--border))' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}>
              تحديث قرار المقابلة:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => onStatusChange(candidate.id, 'مقبول')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: currentStatus === 'مقبول' ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                  color: currentStatus === 'مقبول' ? 'white' : '#10b981',
                  border: '1px solid #10b981',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle size={15} /> قبول
              </button>
              <button
                onClick={() => onStatusChange(candidate.id, 'مرفوض')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: currentStatus === 'مرفوض' ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                  color: currentStatus === 'مرفوض' ? 'white' : '#ef4444',
                  border: '1px solid #ef4444',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                <XCircle size={15} /> رفض
              </button>
              <button
                onClick={() => onStatusChange(candidate.id, 'مستبعد')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: currentStatus === 'مستبعد' ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
                  color: currentStatus === 'مستبعد' ? 'white' : '#f59e0b',
                  border: '1px solid #f59e0b',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                <AlertTriangle size={15} /> استبعاد
              </button>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Recommendation Card */}
          {aiRec && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} /> تحليل Marassi AI الذكي
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '99px',
                  background: aiRec.score >= 80 ? '#10b981' : aiRec.score >= 60 ? '#f59e0b' : '#ef4444',
                  color: 'white',
                }}>
                  {aiRec.score}% مطابقة
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                {aiRec.recommendation}
              </p>
            </div>
          )}

          {/* Job Details Section */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={16} color="#3b82f6" /> بيانات التقديم والوظيفة
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'hsl(var(--muted)/0.4)', border: '1px solid hsl(var(--border))' }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>الوظيفة</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px' }}>{candidate.position || 'غير محدد'}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'hsl(var(--muted)/0.4)', border: '1px solid hsl(var(--border))' }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>شركة الأمن</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px' }}>{candidate.securityCompany || 'غير محدد'}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'hsl(var(--muted)/0.4)', border: '1px solid hsl(var(--border))' }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>الوردية</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px' }}>{candidate.workShift || 'بدون وردية'}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'hsl(var(--muted)/0.4)', border: '1px solid hsl(var(--border))' }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>تاريخ العرض</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px' }}>{candidate.offerDate || 'غير مسجل'}</div>
              </div>
              {((candidate as any).workLocation || (candidate as any).location || (candidate.notes && candidate.notes.includes('الموقع:'))) && (
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'hsl(var(--muted)/0.4)', border: '1px solid hsl(var(--border))', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>الموقع / المنشأة</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px', color: '#10b981' }}>
                    {(candidate as any).workLocation || (candidate as any).location || candidate.notes?.match(/الموقع:\s*([^|]+)/)?.[1]?.trim() || '—'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Details Section */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} color="#10b981" /> البيانات الشخصية
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'hsl(var(--muted)/0.4)', border: '1px solid hsl(var(--border))' }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>المحافظة</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px' }}>{candidate.governorate || 'غير مسجل'}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'hsl(var(--muted)/0.4)', border: '1px solid hsl(var(--border))' }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>المؤهل</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px' }}>{candidate.qualification || 'غير مسجل'}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'hsl(var(--muted)/0.4)', border: '1px solid hsl(var(--border))' }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>تاريخ الميلاد</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px' }}>{candidate.birthDate || 'غير مسجل'}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'hsl(var(--muted)/0.4)', border: '1px solid hsl(var(--border))' }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>الحالة الاجتماعية</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px' }}>{candidate.maritalStatus || 'غير مسجل'}</div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {candidate.notes && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))', margin: '0 0 8px 0' }}>
                📝 ملاحظات وسجل القرار
              </h4>
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'hsl(var(--muted)/0.5)',
                border: '1px solid hsl(var(--border))',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'hsl(var(--foreground))',
              }}>
                {candidate.notes}
              </div>
            </div>
          )}

          {/* CV Section */}
          {candidate.cvBase64 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} color="#6366f1" /> السيرة الذاتية (CV)
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(168,85,247,0.07) 100%)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={20} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {candidate.cvFileName || 'السيرة الذاتية'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>اضغط لتحميل أو معاينة الملف</div>
                </div>
                <a
                  href={candidate.cvBase64}
                  download={candidate.cvFileName || 'cv.pdf'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    background: '#6366f1',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  <Download size={13} /> تحميل
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default CandidateDrawer
