/**
 * useAuditLog — سجل التعديلات والقرارات مع إمكانية التراجع
 * يخزّن في sessionStorage (يمسح عند إغلاق التاب، لا يحتاج قاعدة بيانات)
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export type AuditAction =
  | 'add_candidate'
  | 'update_status'
  | 'update_candidate'
  | 'delete_candidate'
  | 'bulk_edit'

export interface AuditEntry {
  id: string
  timestamp: string         // ISO
  action: AuditAction
  entityId: string          // candidate id
  entityName: string        // اسم المرشح
  performedBy: string       // اسم المستخدم
  before?: Record<string, any>   // البيانات قبل التعديل
  after?: Record<string, any>    // البيانات بعد التعديل
  description: string       // وصف بالعربي
}

const STORAGE_KEY = 'Marassi_audit_log'
const MAX_ENTRIES = 200     // محدش يحتاج أكتر من كده per-session
const UNDO_WINDOW_MS = 30_000  // 30 ثانية فترة التراجع

function loadLog(): AuditEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLog(entries: AuditEntry[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch { /* storage full — ignore */ }
}

export function useAuditLog() {
  const [log, setLog] = useState<AuditEntry[]>(loadLog)
  const [undoEntry, setUndoEntry] = useState<AuditEntry | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // مزامنة مع sessionStorage عند التغيير
  useEffect(() => {
    saveLog(log)
  }, [log])

  /** تسجيل إجراء جديد */
  const record = useCallback((
    entry: Omit<AuditEntry, 'id' | 'timestamp'>
  ): AuditEntry => {
    const full: AuditEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    }
    setLog(prev => [full, ...prev])

    // عرض نافذة التراجع إذا كان الإجراء قابل للتراجع
    if (['update_status', 'delete_candidate', 'update_candidate', 'bulk_edit'].includes(entry.action)) {
      setUndoEntry(full)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      undoTimerRef.current = setTimeout(() => setUndoEntry(null), UNDO_WINDOW_MS)
    }

    return full
  }, [])

  /** إخفاء نافذة التراجع يدوياً */
  const dismissUndo = useCallback(() => {
    setUndoEntry(null)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }, [])

  /** مسح السجل بالكامل */
  const clearLog = useCallback(() => {
    setLog([])
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return { log, record, undoEntry, dismissUndo, clearLog }
}

/** Singleton للاستخدام خارج الـ hooks (في الـ store مثلاً) */
let _externalRecord: ReturnType<typeof useAuditLog>['record'] | null = null
export function setExternalRecorder(fn: ReturnType<typeof useAuditLog>['record']) {
  _externalRecord = fn
}
export function auditRecord(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  _externalRecord?.(entry)
}
