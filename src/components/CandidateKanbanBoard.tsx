import React, { useState } from 'react'
import {
  MessageCircle, Printer, Sparkles, MapPin, Briefcase,
  Building2, MoreVertical, CheckCircle, XCircle, AlertTriangle, ChevronRight, ChevronLeft
} from 'lucide-react'
import { WhatsAppHelper } from '../utils/whatsappHelper'
import { MarassiAI } from '../utils/aiAnalyzer'

interface CandidateKanbanBoardProps {
  candidates: any[]
  onCandidateClick: (candidate: any) => void
  onStatusChange: (id: string, newStatus: 'مقبول' | 'مرفوض' | 'مستبعد' | 'في انتظار') => void
  onPrintCard: (candidate: any) => void
  canUpdateStatus: boolean
}

const COLUMNS = [
  { id: 'في انتظار', title: 'في انتظار (جديد)', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.06)', border: 'rgba(59, 130, 246, 0.25)', icon: '⏳' },
  { id: 'مقبول', title: 'تم القبول (Accepted)', color: '#10b981', bg: 'rgba(16, 185, 129, 0.06)', border: 'rgba(16, 185, 129, 0.25)', icon: '✅' },
  { id: 'مرفوض', title: 'مرفوض (Rejected)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.06)', border: 'rgba(239, 68, 68, 0.25)', icon: '❌' },
  { id: 'مستبعد', title: 'مستبعد (Excluded)', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.06)', border: 'rgba(245, 158, 11, 0.25)', icon: '⚠️' },
] as const

export const CandidateKanbanBoard: React.FC<CandidateKanbanBoardProps> = ({
  candidates,
  onCandidateClick,
  onStatusChange,
  onPrintCard,
  canUpdateStatus,
}) => {
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('candidateId', id)
    setDraggedCandidateId(id)
  }

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    setDragOverColumn(colId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, colId: any) => {
    e.preventDefault()
    setDragOverColumn(null)
    const candidateId = e.dataTransfer.getData('candidateId') || draggedCandidateId
    if (candidateId && colId) {
      onStatusChange(candidateId, colId)
    }
    setDraggedCandidateId(null)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '16px',
      alignItems: 'start',
      minHeight: '600px',
      paddingBottom: '24px',
    }}>
      {COLUMNS.map(col => {
        const columnCandidates = candidates.filter(c => {
          const res = c.offerResult || 'في انتظار'
          return res === col.id
        })

        const isOver = dragOverColumn === col.id

        return (
          <div
            key={col.id}
            onDragOver={e => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.id)}
            style={{
              backgroundColor: isOver ? `${col.color}18` : 'hsl(var(--card))',
              borderRadius: '14px',
              border: `1.5px solid ${isOver ? col.color : 'hsl(var(--border))'}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 220px)',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
            }}
          >
            {/* Column Header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: `2px solid ${col.color}`,
              background: col.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{col.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'hsl(var(--foreground))' }}>
                  {col.title}
                </span>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 800,
                padding: '2px 9px',
                borderRadius: '99px',
                backgroundColor: col.color,
                color: 'white',
              }}>
                {columnCandidates.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div style={{
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflowY: 'auto',
              flex: 1,
            }}>
              {columnCandidates.length === 0 ? (
                <div style={{
                  padding: '30px 10px',
                  textAlign: 'center',
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '13px',
                  border: '1.5px dashed hsl(var(--border))',
                  borderRadius: '10px',
                }}>
                  اسحب المرشحين إلى هنا
                </div>
              ) : (
                columnCandidates.map(c => {
                  const aiRec = MarassiAI.analyzeCandidate({
                    ...c,
                    experienceYears: c.experienceYears || 0,
                    educationLevel: c.qualification,
                  })

                  return (
                    <div
                      key={c.id}
                      draggable={canUpdateStatus}
                      onDragStart={e => handleDragStart(e, c.id)}
                      onClick={() => onCandidateClick(c)}
                      style={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'
                        e.currentTarget.style.borderColor = col.color
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                        e.currentTarget.style.borderColor = 'hsl(var(--border))'
                      }}
                    >
                      {/* Card Header: Name + AI Score */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'hsl(var(--foreground))' }}>
                          {c.name}
                        </div>
                        {aiRec && (
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '99px',
                            background: aiRec.score >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                            color: aiRec.score >= 80 ? '#10b981' : '#6366f1',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}>
                            <Sparkles size={11} /> {aiRec.score}%
                          </span>
                        )}
                      </div>

                      {/* Position and Company Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {c.position && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            background: 'hsl(var(--muted))',
                            color: 'hsl(var(--foreground))',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            <Briefcase size={11} /> {c.position}
                          </span>
                        )}
                        {c.securityCompany && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            background: 'hsl(var(--muted)/0.8)',
                            color: 'hsl(var(--muted-foreground))',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            <Building2 size={11} /> {c.securityCompany}
                          </span>
                        )}
                      </div>

                      {/* Info snippet: Governorate & Phone */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={12} /> {c.governorate || '—'}
                        </span>
                        {c.phone && <span>{c.phone}</span>}
                      </div>

                      {/* Quick Actions Footer */}
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid hsl(var(--border)/0.6)',
                          paddingTop: '6px',
                          marginTop: '2px',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {c.phone && (
                            <a
                              href={WhatsAppHelper.getDirectChatUrl(c.phone, WhatsAppHelper.getGeneralFollowUpMessage(c.name))}
                              target="_blank"
                              rel="noreferrer"
                              title="محادثة واتساب"
                              style={{
                                padding: '4px 6px',
                                borderRadius: '6px',
                                background: '#25D36618',
                                color: '#25D366',
                                display: 'inline-flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                              }}
                            >
                              <MessageCircle size={13} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => onPrintCard(c)}
                            title="طباعة الكارنيه"
                            style={{
                              padding: '4px 6px',
                              borderRadius: '6px',
                              background: 'hsl(var(--muted))',
                              color: 'hsl(var(--foreground))',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <Printer size={13} />
                          </button>
                        </div>

                        {/* Quick status transition dropdown/buttons */}
                        {canUpdateStatus && (
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {col.id !== 'مقبول' && (
                              <button
                                type="button"
                                onClick={() => onStatusChange(c.id, 'مقبول')}
                                title="قبول"
                                style={{
                                  padding: '3px 6px',
                                  borderRadius: '5px',
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  color: '#10b981',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                              >
                                ✓ قبول
                              </button>
                            )}
                            {col.id !== 'مرفوض' && (
                              <button
                                type="button"
                                onClick={() => onStatusChange(c.id, 'مرفوض')}
                                title="رفض"
                                style={{
                                  padding: '3px 6px',
                                  borderRadius: '5px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: '#ef4444',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                              >
                                ✕ رفض
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default CandidateKanbanBoard
