import React, { useEffect, useState } from 'react'
import { RotateCcw, X, Clock } from 'lucide-react'
import type { AuditEntry } from '../hooks/useAuditLog'

interface UndoToastProps {
  entry: AuditEntry
  onUndo: (entry: AuditEntry) => void
  onDismiss: () => void
  durationMs?: number
}

const UndoToast: React.FC<UndoToastProps> = ({
  entry,
  onUndo,
  onDismiss,
  durationMs = 30000,
}) => {
  const [progress, setProgress] = useState(100)
  const [visible, setVisible] = useState(false)

  // أنيميشن دخول
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  // شريط التقدم
  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / durationMs) * 100)
      setProgress(pct)
      if (pct === 0) {
        clearInterval(interval)
        onDismiss()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [durationMs, onDismiss])

  const actionLabels: Record<string, string> = {
    update_status: '🔄 تم تغيير الحالة',
    update_candidate: '✏️ تم تعديل البيانات',
    delete_candidate: '🗑️ تم الحذف',
    bulk_edit: '📋 تم التعديل الجماعي',
    add_candidate: '➕ تم الإضافة',
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '80px'})`,
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
        zIndex: 2000,
        minWidth: '320px',
        maxWidth: '90vw',
        background: 'hsl(262 72% 20%)',
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.3)',
        overflow: 'hidden',
        direction: 'rtl',
      }}
    >
      {/* شريط التقدم */}
      <div style={{
        height: '3px',
        background: 'rgba(255,255,255,0.12)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, right: 0,
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, hsl(280 70% 65%), hsl(262 72% 70%))',
          transition: 'width 0.1s linear',
          borderRadius: '3px',
        }} />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
      }}>
        {/* أيقونة */}
        <div style={{
          width: '36px', height: '36px',
          borderRadius: '10px',
          background: 'rgba(139,92,246,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Clock size={16} color="#c4b5fd" />
        </div>

        {/* النص */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#e9d5ff', marginBottom: '2px' }}>
            {actionLabels[entry.action] || 'تم الإجراء'}
          </div>
          <div style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.6)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {entry.description}
          </div>
        </div>

        {/* زرار التراجع */}
        {entry.before && (
          <button
            onClick={() => { onUndo(entry); onDismiss() }}
            style={{
              background: 'linear-gradient(135deg, hsl(262 72% 55%), hsl(280 70% 60%))',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(139,92,246,0.4)',
              flexShrink: 0,
            }}
          >
            <RotateCcw size={13} />
            تراجع
          </button>
        )}

        {/* إغلاق */}
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

export default UndoToast
