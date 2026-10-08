// ══════════════════════════════════════════════════════════════
//  Store Types – shared interfaces used across all store slices
// ══════════════════════════════════════════════════════════════
import type { UserPermissions } from '../types/permissions'

// أنواع المستخدمين
export type UserType = 'security_employee' | 'interview_manager' | 'admin'

// واجهة المستخدم
export interface User {
  id: string
  name: string
  email: string
  userType: UserType
  department: string
  createdAt: string
  isActive?: boolean
  permissions?: UserPermissions
}

// واجهة المرشح
export interface Candidate {
  id: string
  name: string
  nationalId: string
  birthDate: string
  governorate: string
  qualification: string
  maritalStatus: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل'
  securityCompany: string
  position?: string
  phone?: string
  offerDate: string
  offerResult: 'مقبول' | 'مرفوض' | 'مستبعد' | 'في انتظار'
  status: 'جديد' | 'قيد المراجعة' | 'تم التوظيف' | 'مرفوض'
  createdBy: string
  notes?: string
  workShift?: 'نهار' | 'ليل'
  createdAt: string
  updatedAt: string
  isRejectedBefore?: boolean
  previousRejectionDate?: string
  photoBase64?: string | null
  cvBase64?: string | null
  cvFileName?: string | null
}

// واجهة قاعدة البيانات المحفوظة
export interface SavedCandidate {
  id: string
  name: string
  nationalId: string
  birthDate: string
  governorate: string
  qualification: string
  maritalStatus: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل'
  securityCompany: string
  position?: string
  offerDate: string
  finalResult: 'مقبول' | 'مرفوض' | 'مستبعد' | 'استقالة'
  decisionDate: string
  decisionBy: string
  notes?: string
  workShift?: 'نهار' | 'ليل'
  exclusionReason?: string
  resignationReason?: string
  isRejectedBefore: boolean
  previousRejectionDate?: string
  createdAt: string
}

// واجهة الإشعارات
export interface Notification {
  id: string
  type: 'rejected_before' | 'new_candidate' | 'decision_made'
  title: string
  message: string
  candidateId: string
  candidateName: string
  isRead: boolean
  createdAt: string
}

// واجهة سجل تسجيل الدخول
export interface LoginLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  loginTime: string
  logoutTime?: string
  ipAddress?: string
  userAgent?: string
  deviceType?: string
  browser?: string
  os?: string
  country?: string
  city?: string
  latitude?: number
  longitude?: number
  isActive: boolean
  sessionId?: string
  createdAt: string
}

// واجهة المقابلة
export interface Interview {
  id: string
  candidateId: string
  candidateName: string
  position: string
  date: string
  time: string
  status: 'مجدولة' | 'مكتملة' | 'ملغاة'
  notes: string
  interviewer: string
  createdAt: string
  updatedAt: string
}

// إحصائيات لوحة التحكم
export interface DashboardStats {
  totalCandidates: number
  pendingInterviews: number
  completedInterviews: number
  hiredCandidates: number
  rejectedCandidates: number
}

// ────── Transform helpers (snake_case => camelCase) ────────────

export const transformCandidate = (data: any): Candidate => ({
  id: data.id,
  name: data.name,
  nationalId: data.national_id,
  birthDate: data.birth_date,
  governorate: data.governorate,
  qualification: data.qualification,
  maritalStatus: data.marital_status,
  securityCompany: data.security_company,
  position: data.position,
  phone: data.phone,
  offerDate: data.offer_date,
  offerResult: data.offer_result,
  status: data.status,
  createdBy: data.created_by,
  notes: data.notes,
  workShift: data.work_shift as 'نهار' | 'ليل' | undefined,
  isRejectedBefore: data.is_rejected_before,
  previousRejectionDate: data.previous_rejection_date,
  photoBase64: data.photo_base64,
  cvBase64: data.cv_base64,
  cvFileName: data.cv_file_name,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})

export const transformSavedCandidate = (data: any): SavedCandidate => ({
  id: data.id,
  name: data.name,
  nationalId: data.national_id,
  birthDate: data.birth_date,
  governorate: data.governorate,
  qualification: data.qualification,
  maritalStatus: data.marital_status,
  securityCompany: data.security_company,
  position: data.position,
  offerDate: data.offer_date,
  finalResult: data.final_result,
  decisionDate: data.decision_date,
  decisionBy: data.decision_by,
  notes: data.notes,
  workShift: data.work_shift,
  exclusionReason: data.exclusion_reason,
  resignationReason: data.resignation_reason,
  isRejectedBefore: data.is_rejected_before,
  previousRejectionDate: data.previous_rejection_date,
  createdAt: data.created_at,
})

export const transformLoginLog = (log: any): LoginLog => ({
  id: log.id,
  userId: log.user_id,
  userEmail: log.user_email,
  userName: log.user_name,
  loginTime: log.login_time,
  logoutTime: log.logout_time,
  ipAddress: log.ip_address,
  userAgent: log.user_agent,
  deviceType: log.device_type,
  browser: log.browser,
  os: log.os,
  country: log.country,
  city: log.city,
  latitude: log.latitude,
  longitude: log.longitude,
  isActive: log.is_active,
  sessionId: log.session_id,
  createdAt: log.created_at,
})

export const transformNotification = (n: any): Notification => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  candidateId: n.candidate_id,
  candidateName: n.candidate_name,
  isRead: n.is_read,
  createdAt: n.created_at,
})

export const transformInterview = (interview: any): Interview => ({
  id: interview.id,
  candidateId: interview.candidate_id,
  candidateName: interview.candidate_name,
  position: interview.position,
  date: interview.date,
  time: interview.time,
  status: interview.status,
  notes: interview.notes,
  interviewer: interview.interviewer,
  createdAt: interview.created_at,
  updatedAt: interview.updated_at,
})

