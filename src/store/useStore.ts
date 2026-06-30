import { create } from 'zustand'
import { supabase } from '../integrations/supabase/client'
import { Database } from '../integrations/supabase/types'
import type { UserPermissions } from '../types/permissions'
import { queryClient } from '../lib/queryClient'

type Tables = Database['public']['Tables']

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

// حالة التطبيق
export interface AppState {
  // بيانات المستخدمين
  users: User[]
  currentUser: User | null
  
  // بيانات المرشحين
  candidates: Candidate[]
  
  // قاعدة البيانات المحفوظة
  savedCandidates: SavedCandidate[]
  
  // الإشعارات
  notifications: Notification[]
  
  // بيانات المقابلات
  interviews: Interview[]
  
  // إحصائيات
  stats: DashboardStats
  
  // حالة الواجهة
  isLoading: boolean
  isInitialized: boolean
  
  // الإجراءات
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  // New: login via Supabase and set current user directly
  loginWithSupabase: (email: string) => Promise<boolean>
  addCandidate: (candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void
  updateCandidateStatus: (id: string, status: Candidate['status'], offerResult: Candidate['offerResult'], notes?: string, workShift?: 'نهار' | 'ليل') => void
  updateCandidate: (id: string, data: Partial<Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'offerResult'>>) => Promise<void>
  deleteCandidate: (id: string) => void
  saveCandidateToDatabase: (candidate: Candidate, finalResult: 'مقبول' | 'مرفوض' | 'مستبعد' | 'استقالة', notes?: string, workShift?: 'نهار' | 'ليل', exclusionReason?: string, resignationReason?: string) => Promise<void>
  addInterview: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateInterview: (id: string, updates: Partial<Interview>) => void
  deleteInterview: (id: string) => void
  getCandidatesByStatus: (status: Candidate['status']) => Candidate[]
  searchCandidates: (query: string) => Candidate[]
  searchSavedCandidates: (query: string) => SavedCandidate[]
  searchSavedCandidatesByCompany: (company: string) => SavedCandidate[]
  getSavedCandidatesByResult: (result: 'مقبول' | 'مرفوض' | 'مستبعد' | 'استقالة') => SavedCandidate[]
  deleteSavedCandidate: (id: string) => Promise<void>
  deleteMultipleSavedCandidates: (ids: string[]) => Promise<void>
  removeDuplicateSavedCandidates: () => Promise<number>
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationAsRead: (id: string) => void
  getUnreadNotifications: () => Notification[]
  checkRejectedBefore: (nationalId: string) => { isRejected: boolean; date?: string }
  initializeDemoData: () => void
  resetData: () => void
  restoreUserSession: () => boolean
  saveUserSession: (user: User) => void
  bulkAddCandidates: (candidates: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'status'>[]) => Promise<{ success: number; failed: number; errors: string[] }>
  bulkAddSavedCandidates: (candidates: Omit<SavedCandidate, 'id' | 'createdAt'>[]) => Promise<{ success: number; failed: number; errors: string[] }>
  loadDataFromSupabase: () => Promise<void>
  set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void
  // إدارة المستخدمين من Supabase
  loadUsersFromSupabase: () => Promise<void>
  addUserToSupabase: (user: { name: string; email: string; password: string; userType: UserType; department: string }) => Promise<void>
  updateUserRoleInSupabase: (id: string, userType: UserType) => Promise<void>
  updateUserInSupabase: (id: string, data: { name?: string; department?: string; userType?: UserType }) => Promise<void>
  deleteUserFromSupabase: (id: string) => Promise<void>
  toggleUserStatus: (id: string, isActive: boolean) => Promise<void>
  updateUserPermissions: (id: string, permissions: UserPermissions) => Promise<void>
  // إعداد الاشتراكات التلقائية
  setupRealtimeSubscriptions: () => void
  cleanupRealtimeSubscriptions: () => void
  // سجلات تسجيل الدخول
  loginLogs: LoginLog[]
  logLogin: (userId: string, userEmail: string, userName: string) => Promise<string>
  logLogout: (sessionId: string) => Promise<void>
  loadLoginLogs: () => Promise<void>
  getActiveSessions: () => LoginLog[]

  }

// متغيرات لتخزين الاشتراكات
let candidatesSubscription: any = null
let savedCandidatesSubscription: any = null
let interviewsSubscription: any = null
let notificationsSubscription: any = null
let usersSubscription: any = null
let loginLogsSubscription: any = null

// إنشاء المتجر - بدون تخزين محلي
export const useStore = create<AppState>()(
  (set, get) => ({
      // البيانات الأولية
      users: [],
      currentUser: null,
      candidates: [],
      savedCandidates: [],
      notifications: [],
      interviews: [],
      loginLogs: [],
      stats: {
        totalCandidates: 0,
        pendingInterviews: 0,
        completedInterviews: 0,
        hiredCandidates: 0,
        rejectedCandidates: 0
      },
      isLoading: false,
      isInitialized: false,

      // تسجيل الدخول
      login: async (email: string, password: string) => {
        console.log('🔐 [STORE] بدء تسجيل الدخول...')
        console.log('📧 [STORE] البريد الإلكتروني:', email)
        console.log('🔑 [STORE] كلمة المرور:', password)
        
        const { users } = get()
        console.log('👥 [STORE] المستخدمون المتاحون:', users.map(u => u.email))
        
        // البحث عن المستخدم
        const user = users.find(u => u.email === email)
        console.log('✅ [STORE] تم العثور على المستخدم:', !!user)
        
        if (!user) {
          console.log('❌ [STORE] المستخدم غير موجود')
          return false
        }
        
        // التحقق من حالة الحساب (نشط/معطل)
        if (user.isActive === false) {
          console.log('❌ [STORE] الحساب معطل')
          return false
        }
        
        // قائمة كلمات المرور المحددة - محمية بمتغيرات البيئة
        const passwords: { [key: string]: string } = {
          'security@company.com': import.meta.env.VITE_SECURITY_EMPLOYEE_PASSWORD || 'Sec@135$',
          'interview@company.com': import.meta.env.VITE_INTERVIEW_MANAGER_PASSWORD || 'Man@135$',
          'admin@company.com': import.meta.env.VITE_ADMIN_PASSWORD || 'Adm@135$'
        }
        
        const expectedPassword = passwords[email]
        console.log('🔐 [STORE] كلمة المرور المتوقعة:', expectedPassword)
        console.log('🔐 [STORE] كلمة المرور المدخلة:', password)
        console.log('✅ [STORE] تطابق كلمة المرور:', expectedPassword === password)
        
        // التحقق من كلمة المرور
        if (expectedPassword === password) {
          console.log('🚀 [STORE] حفظ المستخدم في الحالة...')
          set({ currentUser: user })
          // حفظ الجلسة في localStorage
          get().saveUserSession(user)
          // تسجيل الدخول في السجلات
          await get().logLogin(user.id, user.email, user.name)
          console.log('🎉 [STORE] تم تسجيل الدخول بنجاح!')
          console.log('👤 [STORE] المستخدم:', user.name)
          console.log('🏢 [STORE] القسم:', user.department)
          return true
        }
        
        console.log('❌ [STORE] فشل تسجيل الدخول - كلمة مرور خاطئة')
        return false
      },

      // تسجيل الخروج
      logout: async () => {
        const { currentUser } = get()
        // الحصول على sessionId من localStorage قبل الحذف
        const sessionId = localStorage.getItem('currentSessionId')
        
        // تنظيف الاشتراكات قبل تسجيل الخروج
        get().cleanupRealtimeSubscriptions()
        set({ currentUser: null })
        
        // تسجيل الخروج في السجلات
        if (sessionId) {
          await get().logLogout(sessionId)
        }
        
        // حذف الجلسة من localStorage
        localStorage.removeItem('currentUser')
        localStorage.removeItem('currentSessionId')
        try {
          // محاولة تسجيل الخروج من Supabase إن وُجدت جلسة
          supabase.auth.signOut()
        } catch {}
      },

      // تسجيل دخول عبر Supabase (بعد نجاح المصادقة هناك)
      loginWithSupabase: async (email: string) => {
        try {
          // جلب بيانات المستخدم من جدول users في Supabase (بدون حساسية الأحرف)
          const { data, error } = await supabase
            .from('users')
            .select('id, name, email, user_type, department, created_at, is_active, permissions')
            .ilike('email', email.trim())
            .maybeSingle()

          if (error) {
            console.error('❌ [STORE] خطأ في جلب بيانات المستخدم:', error)
            throw new Error(`خطأ في الاتصال بقاعدة البيانات: ${error.message}`)
          }

          if (!data) {
            throw new Error('المستخدم غير موجود في قاعدة البيانات. يرجى التواصل مع المدير لإضافة المستخدم.')
          }

          if (data.is_active === false) {
            throw new Error('الحساب معطل. يرجى التواصل مع المدير لإعادة تفعيل الحساب.')
          }
          
          const mappedUser: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            userType: data.user_type as UserType,
            department: data.department,
            createdAt: data.created_at,
            isActive: data.is_active ?? true,
            permissions: data.permissions ? (data.permissions as any) : undefined,
          }

          set({ currentUser: mappedUser })
          get().saveUserSession(mappedUser)
          const existing = get().users.find(u => u.email === mappedUser.email)
          if (!existing) {
            set(state => ({ users: [...state.users, mappedUser] }))
          }
          await get().logLogin(mappedUser.id, mappedUser.email, mappedUser.name)
          return true
        } catch (e: any) {
          console.error('❌ [STORE] خطأ في تسجيل الدخول:', e)
          if (e?.message) {
            throw e
          }
          return false
        }
      },

      // إضافة مرشح
      addCandidate: async (candidateData) => {
        const { currentUser, savedCandidates, candidates } = get()
        if (!currentUser) return

        try {
          // فحص التكرار من الحالة المحلية أولاً (بدون طلب DB)
          if (candidates.some(c => c.nationalId === candidateData.nationalId)) {
            throw new Error(`المرشح برقم قومي ${candidateData.nationalId} موجود مسبقاً في قاعدة البيانات`)
          }

          // فحص المرفوضين من الحالة المحلية أولاً
          let rejectedBefore = savedCandidates.find(
            saved => saved.nationalId === candidateData.nationalId && saved.finalResult === 'مرفوض'
          )

          // الفحص من DB فقط لو مش موجود local
          if (!rejectedBefore) {
            const { data: rejectedInDB } = await supabase
              .from('saved_candidates')
              .select('decision_date')
              .eq('national_id', candidateData.nationalId)
              .eq('final_result', 'مرفوض')
              .maybeSingle()

            if (rejectedInDB) {
              // تحويل البيانات فوراً بدون refetch
              rejectedBefore = {
                nationalId: candidateData.nationalId,
                decisionDate: rejectedInDB.decision_date,
              } as any
            }
          }

          const newCandidate = {
            name: candidateData.name,
            national_id: candidateData.nationalId,
            birth_date: candidateData.birthDate,
            governorate: candidateData.governorate,
            qualification: candidateData.qualification,
            marital_status: candidateData.maritalStatus,
            security_company: candidateData.securityCompany,
            position: candidateData.position || null,
            phone: candidateData.phone || null,
            offer_date: candidateData.offerDate,
            offer_result: candidateData.offerResult || 'في انتظار',
            status: 'جديد' as const,
            created_by: currentUser.name,
            notes: candidateData.notes || null,
            is_rejected_before: !!rejectedBefore,
            previous_rejection_date: rejectedBefore?.decisionDate || null
          }

          console.log('إضافة مرشح جديد:', newCandidate.name)

          // إضافة المرشح إلى Supabase
          const { data, error } = await supabase
            .from('candidates')
            .insert([newCandidate])
            .select()
            .single()

          if (error) {
            console.error('خطأ في إضافة المرشح:', error)
            console.error('تفاصيل الخطأ:', error.message)
            console.error('كود الخطأ:', error.code)
            throw error
          }

          // إشعارات مرشح جديد (دفعة واحدة)
          const notificationsToInsert: any[] = [{
            type: 'new_candidate',
            title: 'مرشح جديد',
            message: `تم إضافة مرشح جديد: ${candidateData.name}`,
            candidate_id: data.id,
            candidate_name: candidateData.name,
            is_read: false
          }]

          if (rejectedBefore) {
            notificationsToInsert.push({
              type: 'rejected_before',
              title: 'مرشح مرفوض من قبل',
              message: `تم تسجيل مرشح جديد (${candidateData.name}) تم رفضه من قبل في ${rejectedBefore.decisionDate}`,
              candidate_id: data.id,
              candidate_name: candidateData.name,
              is_read: false
            })
          }

          await supabase.from('notifications').insert(notificationsToInsert)

          // تحويل البيانات من snake_case إلى camelCase
          const transformedCandidate: Candidate = {
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
            isRejectedBefore: data.is_rejected_before,
            previousRejectionDate: data.previous_rejection_date,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          }

          // تحديث الحالة المحلية
          set(state => ({
            candidates: state.candidates.some(c => c.id === transformedCandidate.id)
              ? state.candidates.map(c => c.id === transformedCandidate.id ? transformedCandidate : c)
              : [...state.candidates, transformedCandidate],
            stats: {
              ...state.stats,
              totalCandidates: state.candidates.some(c => c.id === transformedCandidate.id)
                ? state.stats.totalCandidates
                : state.stats.totalCandidates + 1
            }
          }))

          console.log('تم إضافة المرشح بنجاح إلى قاعدة البيانات')
          
          // تسجيل النشاط
          get().logAction('إضافة', 'مرشح', candidateData.name, `تم إضافة مرشح جديد برقم قومي: ${candidateData.nationalId}`)
        } catch (error) {
          console.error('خطأ في إضافة المرشح:', error)
          throw error
        }
      },

      // تحديث بيانات المرشح
      updateCandidate: async (id, data) => {
        const { currentUser } = get()
        if (!currentUser || !['security_employee', 'admin'].includes(currentUser.userType)) return

        try {
          const updateData: any = { updated_at: new Date().toISOString() }
          if (data.name           !== undefined) updateData.name             = data.name
          if (data.nationalId     !== undefined) updateData.national_id      = data.nationalId
          if (data.birthDate      !== undefined) updateData.birth_date       = data.birthDate
          if (data.governorate    !== undefined) updateData.governorate      = data.governorate
          if (data.qualification  !== undefined) updateData.qualification    = data.qualification
          if (data.maritalStatus  !== undefined) updateData.marital_status   = data.maritalStatus
          if (data.securityCompany!== undefined) updateData.security_company = data.securityCompany
          if (data.position       !== undefined) updateData.position         = data.position || null
          if (data.phone          !== undefined) updateData.phone            = data.phone || null
          if (data.offerDate      !== undefined) updateData.offer_date       = data.offerDate || null
          if ((data as any).workShift !== undefined) updateData.work_shift   = (data as any).workShift || null
          if ((data as any).notes     !== undefined) updateData.notes        = (data as any).notes || null

          const { error } = await supabase.from('candidates').update(updateData).eq('id', id)
          if (error) throw error

          set(state => ({
            candidates: state.candidates.map(c =>
              c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
            )
          }))
        } catch (error) {
          console.error('خطأ في تحديث بيانات المرشح:', error)
          throw error
        }
      },

      // تحديث حالة المرشح
      updateCandidateStatus: async (id, status, offerResult, notes?, workShift?) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType === 'security_employee') return

        try {
          // تحديث في Supabase - تحديث notes و workShift أيضاً
          const updateData: any = {
            status,
            offer_result: offerResult,
            updated_at: new Date().toISOString()
          }

          // إضافة الملاحظات إذا كانت موجودة
          if (notes !== undefined) {
            updateData.notes = notes || null
          }

          // إضافة الوردية إذا كانت موجودة
          if (workShift !== undefined) {
            updateData.work_shift = workShift || null
          }

          const { error } = await supabase
            .from('candidates')
            .update(updateData)
            .eq('id', id)

          if (error) {
            console.error('خطأ في تحديث حالة المرشح:', error)
            throw error
          }

          // تحديث الحالة المحلية
          set(state => ({
            candidates: state.candidates.map(candidate =>
              candidate.id === id
                ? { 
                    ...candidate, 
                    status, 
                    offerResult, 
                    notes: notes !== undefined ? notes : candidate.notes,
                    workShift: workShift !== undefined ? workShift : candidate.workShift,
                    updatedAt: new Date().toISOString() 
                  }
                : candidate
            )
          }))

          // حفظ في قاعدة البيانات إذا كان القرار نهائي
          if (offerResult && ['مقبول', 'مرفوض', 'مستبعد'].includes(offerResult)) {
            const candidate = get().candidates.find(c => c.id === id)
            if (candidate) {
              await get().saveCandidateToDatabase(
                candidate, 
                offerResult as 'مقبول' | 'مرفوض' | 'مستبعد',
                notes,
                workShift
              )
              
              // تسجيل النشاط للقرار
              get().logAction(
                offerResult === 'مقبول' ? 'قبول' : offerResult === 'مرفوض' ? 'رفض' : 'استبعاد',
                'مرشح',
                candidate.name,
                `القرار: ${offerResult} - الملاحظات: ${notes || 'لا يوجد'}`
              )
            }
          }
        } catch (error) {
          console.error('خطأ في تحديث حالة المرشح:', error)
          throw error
        }
      },

      // حذف مرشح
      deleteCandidate: async (id) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        try {
          // حذف من Supabase
          const { error } = await supabase
            .from('candidates')
            .delete()
            .eq('id', id)

          if (error) {
            console.error('خطأ في حذف المرشح:', error)
            throw error
          }

          // تحديث الحالة المحلية
          set(state => ({
            candidates: state.candidates.filter(candidate => candidate.id !== id),
            stats: {
              ...state.stats,
              totalCandidates: Math.max(0, state.stats.totalCandidates - 1)
            }
          }))

          const deletedCandidate = get().candidates.find(c => c.id === id)
          if (deletedCandidate) {
            get().logAction('حذف', 'مرشح', deletedCandidate.name, 'تم حذف بيانات المرشح نهائياً')
          }
        } catch (error) {
          console.error('خطأ في حذف المرشح:', error)
          throw error
        }
      },

      // إضافة مقابلة
      addInterview: async (interviewData) => {
        const { currentUser } = get()
        if (!currentUser) return

        try {
          const newInterview = {
            candidate_id: interviewData.candidateId,
            candidate_name: interviewData.candidateName,
            position: interviewData.position,
            date: interviewData.date,
            time: interviewData.time,
            status: interviewData.status || 'مجدولة',
            notes: interviewData.notes || null,
            interviewer: currentUser.name
          }

          // إضافة إلى Supabase
          const { data, error } = await supabase
            .from('interviews')
            .insert([newInterview])
            .select()
            .single()

          if (error) {
            console.error('خطأ في إضافة المقابلة:', error)
            throw error
          }

          // تحديث الحالة المحلية
          set(state => ({
            interviews: [...state.interviews, data]
          }))
        } catch (error) {
          console.error('خطأ في إضافة المقابلة:', error)
          throw error
        }
      },

      // تحديث مقابلة
      updateInterview: async (id, updates) => {
        try {
          const updateData: any = { updated_at: new Date().toISOString() }
          if (updates.candidateId !== undefined) updateData.candidate_id = updates.candidateId
          if (updates.candidateName !== undefined) updateData.candidate_name = updates.candidateName
          if (updates.position !== undefined) updateData.position = updates.position
          if (updates.date !== undefined) updateData.date = updates.date
          if (updates.time !== undefined) updateData.time = updates.time
          if (updates.status !== undefined) updateData.status = updates.status
          if (updates.notes !== undefined) updateData.notes = updates.notes
          if (updates.interviewer !== undefined) updateData.interviewer = updates.interviewer

          const { error } = await supabase
            .from('interviews')
            .update(updateData)
            .eq('id', id)

          if (error) {
            console.error('خطأ في تحديث المقابلة:', error)
            throw error
          }

          set(state => ({
            interviews: state.interviews.map(interview =>
              interview.id === id
                ? { ...interview, ...updates, updatedAt: new Date().toISOString() }
                : interview
            )
          }))
        } catch (error) {
          console.error('خطأ في تحديث المقابلة:', error)
          throw error
        }
      },

      // حذف مقابلة
      deleteInterview: async (id) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        try {
          const { error } = await supabase
            .from('interviews')
            .delete()
            .eq('id', id)

          if (error) {
            console.error('خطأ في حذف المقابلة:', error)
            throw error
          }

          set(state => ({
            interviews: state.interviews.filter(interview => interview.id !== id)
          }))
        } catch (error) {
          console.error('خطأ في حذف المقابلة:', error)
          throw error
        }
      },

      // الحصول على المرشحين حسب الحالة
      getCandidatesByStatus: (status) => {
        const { candidates } = get()
        return candidates.filter(candidate => candidate.status === status)
      },

      // البحث في المرشحين
      searchCandidates: (query) => {
        const { candidates } = get()
        const lowercaseQuery = query.toLowerCase()
        return candidates.filter(candidate =>
          candidate.name.toLowerCase().includes(lowercaseQuery) ||
          candidate.nationalId.includes(query) ||
          candidate.governorate.toLowerCase().includes(lowercaseQuery) ||
          candidate.qualification.toLowerCase().includes(lowercaseQuery)
        )
      },

      // حفظ مرشح في قاعدة البيانات
      saveCandidateToDatabase: async (candidate, finalResult, notes, workShift?, exclusionReason?, resignationReason?) => {
        const { currentUser, savedCandidates } = get()
        if (!currentUser) return

        try {
          // فحص التكرار من الحالة المحلية أولاً (بدون طلب DB)
          const localExisting = savedCandidates.find(
            saved => saved.nationalId === candidate.nationalId
          )

          // لو مش موجود local، نفحص من DB
          let existingInDB = null
          if (!localExisting) {
            const { data } = await supabase
              .from('saved_candidates')
              .select('id')
              .eq('national_id', candidate.nationalId)
              .maybeSingle()
            existingInDB = data
          }

          if (localExisting || existingInDB) {
            const existingId = existingInDB?.id || localExisting?.id
            // تحديث السجل الموجود بدلاً من إنشاء سجل جديد
            const updatedCandidate = {
              name: candidate.name,
              national_id: candidate.nationalId,
              birth_date: candidate.birthDate,
              governorate: candidate.governorate,
              qualification: candidate.qualification,
              marital_status: candidate.maritalStatus,
              security_company: candidate.securityCompany,
              position: candidate.position || null,
              offer_date: candidate.offerDate,
              final_result: finalResult,
              decision_date: new Date().toISOString(),
              decision_by: currentUser.name,
              notes: notes || null,
              work_shift: workShift || null,
              exclusion_reason: exclusionReason || null,
              resignation_reason: resignationReason || null,
              is_rejected_before: candidate.isRejectedBefore || false,
              previous_rejection_date: candidate.previousRejectionDate || null
            }

            // تحديث في Supabase
            const { data, error } = await supabase
              .from('saved_candidates')
              .update(updatedCandidate)
              .eq('id', existingId)
              .select()
              .single()

            if (error) {
              console.error('خطأ في تحديث المرشح:', error)
              throw error
            }

            // تحديث الحالة المحلية - تحويل من snake_case إلى camelCase
            const transformedData: SavedCandidate = {
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
              createdAt: data.created_at
            }
            
            set(state => ({
              savedCandidates: state.savedCandidates.some(s => s.id === transformedData.id)
                ? state.savedCandidates.map(saved =>
                    saved.id === transformedData.id ? transformedData : saved
                  )
                : [...state.savedCandidates, transformedData]
            }))

            console.log('تم تحديث المرشح الموجود بدلاً من إنشاء سجل جديد')
          } else {
            // إنشاء سجل جديد إذا لم يكن موجوداً
            const savedCandidate = {
              name: candidate.name,
              national_id: candidate.nationalId,
              birth_date: candidate.birthDate,
              governorate: candidate.governorate,
              qualification: candidate.qualification,
              marital_status: candidate.maritalStatus,
              security_company: candidate.securityCompany,
              position: candidate.position || null,
              offer_date: candidate.offerDate,
              final_result: finalResult,
              decision_date: new Date().toISOString(),
              decision_by: currentUser.name,
              notes: notes || null,
              work_shift: workShift || null,
              exclusion_reason: exclusionReason || null,
              resignation_reason: resignationReason || null,
              is_rejected_before: candidate.isRejectedBefore || false,
              previous_rejection_date: candidate.previousRejectionDate || null
            }

            // إضافة إلى Supabase
            const { data, error } = await supabase
              .from('saved_candidates')
              .insert([savedCandidate])
              .select()
              .single()

            if (error) {
              console.error('خطأ في حفظ المرشح:', error)
              throw error
            }

            // تحديث الحالة المحلية - تحويل من snake_case إلى camelCase
            const transformedData: SavedCandidate = {
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
              createdAt: data.created_at
            }
            
            set(state => ({
              savedCandidates: [...state.savedCandidates, transformedData]
            }))

            console.log('تم إنشاء سجل جديد للمرشح')
          }
        } catch (error) {
          console.error('خطأ في حفظ المرشح:', error)
          throw error
        }
      },

      // البحث في قاعدة البيانات المحفوظة
      searchSavedCandidates: (query) => {
        const { savedCandidates } = get()
        const lowercaseQuery = query.toLowerCase()
        return savedCandidates.filter(candidate =>
          candidate.name.toLowerCase().includes(lowercaseQuery) ||
          candidate.nationalId.includes(query) ||
          candidate.governorate.toLowerCase().includes(lowercaseQuery) ||
          candidate.qualification.toLowerCase().includes(lowercaseQuery) ||
          candidate.securityCompany.toLowerCase().includes(lowercaseQuery)
        )
      },

      // البحث في قاعدة البيانات المحفوظة حسب الشركة
      searchSavedCandidatesByCompany: (company) => {
        const { savedCandidates } = get()
        const lowercaseCompany = company.toLowerCase()
        return savedCandidates.filter(candidate =>
          candidate.securityCompany.toLowerCase().includes(lowercaseCompany)
        )
      },

      // حذف مرشح من قاعدة البيانات المحفوظة
      deleteSavedCandidate: async (id) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        try {
          // حذف من Supabase
          const { error } = await supabase
            .from('saved_candidates')
            .delete()
            .eq('id', id)

          if (error) {
            console.error('خطأ في حذف المرشح المحفوظ:', error)
            throw error
          }

          // تحديث الحالة المحلية
          set(state => ({
            savedCandidates: state.savedCandidates.filter(candidate => candidate.id !== id)
          }))

          console.log('تم حذف المرشح من قاعدة البيانات المحفوظة')
        } catch (error) {
          console.error('خطأ في حذف المرشح المحفوظ:', error)
          throw error
        }
      },

      // حذف عدة مرشحين من قاعدة البيانات المحفوظة
      deleteMultipleSavedCandidates: async (ids) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        try {
          // حذف من Supabase
          const { error } = await supabase
            .from('saved_candidates')
            .delete()
            .in('id', ids)

          if (error) {
            console.error('خطأ في حذف المرشحين المحفوظين:', error)
            throw error
          }

          // تحديث الحالة المحلية
          set(state => ({
            savedCandidates: state.savedCandidates.filter(candidate => !ids.includes(candidate.id))
          }))

          console.log(`تم حذف ${ids.length} مرشح من قاعدة البيانات المحفوظة`)
        } catch (error) {
          console.error('خطأ في حذف المرشحين المحفوظين:', error)
          throw error
        }
      },

      // حذف البيانات المكررة من قاعدة البيانات المحفوظة
      removeDuplicateSavedCandidates: async () => {
        const { currentUser, savedCandidates } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        try {
          console.log('بدء حذف البيانات المكررة...')
          
          // تجميع المرشحين حسب الرقم القومي
          const candidatesByNationalId = new Map<string, SavedCandidate[]>()
          
          savedCandidates.forEach(candidate => {
            if (!candidatesByNationalId.has(candidate.nationalId)) {
              candidatesByNationalId.set(candidate.nationalId, [])
            }
            candidatesByNationalId.get(candidate.nationalId)!.push(candidate)
          })

          // العثور على المرشحين المكررين
          const duplicatesToRemove: string[] = []
          
          candidatesByNationalId.forEach((candidates, nationalId) => {
            if (candidates.length > 1) {
              console.log(`تم العثور على ${candidates.length} سجل مكرر للرقم القومي: ${nationalId}`)
              
              // ترتيب المرشحين حسب تاريخ الإنشاء (الأحدث أولاً)
              candidates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              
              // الاحتفاظ بأحدث سجل وحذف الباقي
              const keepCandidate = candidates[0]
              const removeCandidates = candidates.slice(1)
              
              console.log(`الاحتفاظ بالسجل الأحدث: ${keepCandidate.name} (${keepCandidate.id})`)
              console.log(`حذف ${removeCandidates.length} سجل مكرر`)
              
              removeCandidates.forEach(candidate => {
                duplicatesToRemove.push(candidate.id)
              })
            }
          })

          if (duplicatesToRemove.length > 0) {
            // حذف البيانات المكررة من Supabase
            const { error } = await supabase
              .from('saved_candidates')
              .delete()
              .in('id', duplicatesToRemove)

            if (error) {
              console.error('خطأ في حذف البيانات المكررة:', error)
              throw error
            }

            // تحديث الحالة المحلية
            set(state => ({
              savedCandidates: state.savedCandidates.filter(candidate => !duplicatesToRemove.includes(candidate.id))
            }))

            console.log(`تم حذف ${duplicatesToRemove.length} سجل مكرر بنجاح`)
            return duplicatesToRemove.length
          } else {
            console.log('لا توجد بيانات مكررة للحذف')
            return 0
          }
        } catch (error) {
          console.error('خطأ في حذف البيانات المكررة:', error)
          throw error
        }
      },

      // الحصول على المرشحين المحفوظين حسب النتيجة
      getSavedCandidatesByResult: (result) => {
        const { savedCandidates } = get()
        return savedCandidates.filter(candidate => candidate.finalResult === result)
      },

      // إضافة إشعار
      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }

        set(state => ({
          notifications: [...state.notifications, notification]
        }))
      },

      // تمييز الإشعار كمقروء
      markNotificationAsRead: async (id) => {
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

          if (error) {
            console.error('خطأ في تحديث الإشعار:', error)
            throw error
          }

          set(state => ({
            notifications: state.notifications.map(notification =>
              notification.id === id ? { ...notification, isRead: true } : notification
            )
          }))
        } catch (error) {
          console.error('خطأ في تحديث الإشعار:', error)
          throw error
        }
      },

      // الحصول على الإشعارات غير المقروءة
      getUnreadNotifications: () => {
        const { notifications } = get()
        return notifications.filter(notification => !notification.isRead)
      },

      // فحص إذا كان مرشح مرفوض من قبل
      checkRejectedBefore: (nationalId) => {
        const { savedCandidates } = get()
        const rejected = savedCandidates.find(
          candidate => candidate.nationalId === nationalId && candidate.finalResult === 'مرفوض'
        )
        return {
          isRejected: !!rejected,
          date: rejected?.decisionDate
        }
      },

      // تحميل البيانات من Supabase
      loadDataFromSupabase: async () => {
        try {
          // التحقق من وجود بيانات حديثة في TanStack Query cache
          const freshData = queryClient.getQueryData(['candidates'])
          if (freshData) {
            // البيانات موجودة في cache ومحدثة — نستخدمها
            return
          }

          // دالة مساعدة لجلب كل البيانات بتخطي حد الـ 1000
          const fetchAll = async (table: string) => {
            let allData: any[] = []
            let from = 0
            const limit = 1000
            let hasMore = true

            while (hasMore) {
              const { data, error } = await supabase
                .from(table)
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, from + limit - 1)
              
              if (error) {
                console.error(`خطأ في تحميل ${table}:`, error)
                return { data: null, error }
              }
              
              if (data && data.length > 0) {
                allData = [...allData, ...data]
                from += limit
                if (data.length < limit) hasMore = false
              } else {
                hasMore = false
              }
            }
            return { data: allData, error: null }
          }

          // تحميل المرشحين
          const { data: candidates, error: candidatesError } = await fetchAll('candidates')
          if (candidatesError) console.error('خطأ في تحميل المرشحين:', candidatesError.message)

          // تحميل المقابلات
          const { data: interviews, error: interviewsError } = await fetchAll('interviews')
          if (interviewsError) console.error('خطأ في تحميل المقابلات:', interviewsError.message)

          // تحميل المرشحين المحفوظين
          const { data: savedCandidates, error: savedError } = await fetchAll('saved_candidates')
          if (savedError) console.error('خطأ في تحميل المرشحين المحفوظين:', savedError.message)

          // تحميل الإشعارات
          const { data: notifications, error: notificationsError } = await fetchAll('notifications')
          if (notificationsError) console.error('خطأ في تحميل الإشعارات:', notificationsError.message)

          // حساب الإحصائيات
          const stats: DashboardStats = {
            totalCandidates: candidates?.length || 0,
            pendingInterviews: interviews?.filter(i => i.status === 'مجدولة').length || 0,
            completedInterviews: interviews?.filter(i => i.status === 'مكتملة').length || 0,
            hiredCandidates: candidates?.filter(c => c.offer_result === 'مقبول').length || 0,
            rejectedCandidates: candidates?.filter(c => c.offer_result === 'مرفوض').length || 0
          }

          // تحويل البيانات من snake_case إلى camelCase للواجهة الأمامية
          const transformedCandidates = (candidates || []).map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            nationalId: candidate.national_id,
            birthDate: candidate.birth_date,
            governorate: candidate.governorate,
            qualification: candidate.qualification,
            maritalStatus: candidate.marital_status,
            securityCompany: candidate.security_company,
            position: candidate.position,
            offerDate: candidate.offer_date,
            offerResult: candidate.offer_result,
            status: candidate.status,
            createdBy: candidate.created_by,
            notes: candidate.notes,
            workShift: candidate.work_shift as 'نهار' | 'ليل' | undefined,
            isRejectedBefore: candidate.is_rejected_before,
            previousRejectionDate: candidate.previous_rejection_date,
            createdAt: candidate.created_at,
            updatedAt: candidate.updated_at
          }))

          const transformedInterviews = (interviews || []).map(interview => ({
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
            updatedAt: interview.updated_at
          }))

          const transformedSavedCandidates = (savedCandidates || []).map(saved => ({
            id: saved.id,
            name: saved.name,
            nationalId: saved.national_id,
            birthDate: saved.birth_date,
            governorate: saved.governorate,
            qualification: saved.qualification,
            maritalStatus: saved.marital_status,
            securityCompany: saved.security_company,
            position: saved.position,
            offerDate: saved.offer_date,
            finalResult: saved.final_result,
            decisionDate: saved.decision_date,
            decisionBy: saved.decision_by,
            notes: saved.notes,
            workShift: saved.work_shift,
            exclusionReason: saved.exclusion_reason,
            resignationReason: saved.resignation_reason,
            isRejectedBefore: saved.is_rejected_before,
            previousRejectionDate: saved.previous_rejection_date,
            createdAt: saved.created_at
          }))

          // تحويل الإشعارات من snake_case إلى camelCase
          const transformedNotifications: Notification[] = (notifications || []).map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            candidateId: n.candidate_id,
            candidateName: n.candidate_name,
            isRead: n.is_read,
            createdAt: n.created_at
          }))

          set({
            candidates: transformedCandidates,
            interviews: transformedInterviews,
            savedCandidates: transformedSavedCandidates,
            notifications: transformedNotifications,
            stats,
            isInitialized: true
          })

          // تخزين البيانات في TanStack Query cache للمكالمات المستقبلية
          queryClient.setQueryData(['candidates'], transformedCandidates)
          queryClient.setQueryData(['interviews'], transformedInterviews)
          queryClient.setQueryData(['saved-candidates'], transformedSavedCandidates)
          queryClient.setQueryData(['notifications'], transformedNotifications)

          // console.log('تم تحميل البيانات من Supabase بنجاح')
        } catch (error) {
          console.error('خطأ في تحميل البيانات:', error)
        }
      },

      // إعادة تعيين البيانات
      resetData: () => {
        set({
          candidates: [],
          savedCandidates: [],
          notifications: [],
          interviews: [],
          stats: {
            totalCandidates: 0,
            pendingInterviews: 0,
            completedInterviews: 0,
            hiredCandidates: 0,
            rejectedCandidates: 0
          }
        })
        console.log('تم إعادة تعيين البيانات')
      },

      // استعادة حالة المستخدم من localStorage
      restoreUserSession: () => {
        try {
          const savedUser = localStorage.getItem('currentUser')
          if (savedUser) {
            const user = JSON.parse(savedUser)
            set({ currentUser: user })
            console.log('تم استعادة جلسة المستخدم:', user.name)
            return true
          }
        } catch (error) {
          console.error('خطأ في استعادة جلسة المستخدم:', error)
          localStorage.removeItem('currentUser')
        }
        return false
      },

      // حفظ حالة المستخدم في localStorage
      saveUserSession: (user: User) => {
        try {
          localStorage.setItem('currentUser', JSON.stringify(user))
          console.log('تم حفظ جلسة المستخدم:', user.name)
        } catch (error) {
          console.error('خطأ في حفظ جلسة المستخدم:', error)
        }
      },

      // تهيئة البيانات التجريبية
      initializeDemoData: async () => {
        // console.log('بدء تهيئة البيانات التجريبية...')
        
        // محاولة استعادة جلسة المستخدم أولاً
        const sessionRestored = get().restoreUserSession()
        if (sessionRestored) {
          // console.log('تم استعادة جلسة المستخدم بنجاح')
        }
        
        // إنشاء المستخدمين التجريبيين دائماً
        const demoUsers: User[] = [
          {
            id: '1',
            name: 'مدير الأمن - مسئول مقابلات',
            email: 'interview@company.com',
            userType: 'interview_manager',
            department: 'إدارة أمن اعمار مراسي',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'أدمن شركة الأمن - موظف',
            email: 'security@company.com',
            userType: 'security_employee',
            department: 'إدارة أمن اعمار مراسي',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'أحمد حسين - الأدمن',
            email: 'admin@company.com',
            userType: 'admin',
            department: 'إدارة أمن اعمار مراسي',
            createdAt: new Date().toISOString()
          }
        ]

        // console.log('إنشاء المستخدمين التجريبيين:', demoUsers.map(u => u.email))

        // تحديث المستخدمين
        set({
          users: demoUsers,
          isInitialized: true
        })

        // تحميل البيانات من Supabase (متوازي)
        await Promise.all([
          get().loadDataFromSupabase(),
          get().loadUsersFromSupabase()
        ])

        // تحديث بيانات المستخدم الحالي من قائمة المستخدمين المحملة حديثاً من قاعدة البيانات لضمان تحديث الصلاحيات والحالة النشطة
        const currentRestoredUser = get().currentUser
        if (currentRestoredUser) {
          const freshUser = get().users.find(u => u.email.toLowerCase() === currentRestoredUser.email.toLowerCase())
          if (freshUser) {
            if (freshUser.isActive === false) {
              console.log('الحساب معطل، جاري تسجيل الخروج تلقائياً')
              await get().logout()
            } else {
              set({ currentUser: freshUser })
              get().saveUserSession(freshUser)
            }
          }
        }

        // إعداد الاشتراكات التلقائية
        get().setupRealtimeSubscriptions()

        // console.log('تم تهيئة البيانات التجريبية بنجاح')
        // console.log('المستخدمون المتاحون:', demoUsers.map(u => u.email))
      },

      // تحميل المستخدمين من Supabase
      loadUsersFromSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, name, email, user_type, department, created_at, is_active, permissions')
            .order('created_at', { ascending: false })
          
          if (!error && data) {
            const mapped: User[] = data.map(u => ({
              id: u.id,
              name: u.name,
              email: u.email,
              userType: u.user_type as UserType,
              department: u.department,
              createdAt: u.created_at,
              isActive: u.is_active ?? true, // افتراضياً نشط إذا كانت القيمة null
              permissions: u.permissions ? (u.permissions as any) : undefined
            }))
            set({ users: mapped })
          }
        } catch (error) {
          console.error('خطأ في تحميل المستخدمين:', error)
        }
      },

      // إضافة مستخدم إلى Supabase
      addUserToSupabase: async (user) => {
        // استخدام دالة Postgres (RPC) لإنشاء المستخدم لتخطي مشاكل الـ Edge Functions و الـ CORS
        const { data, error } = await supabase.rpc('create_user_admin', {
          email: user.email,
          password: user.password || 'TempPass@123',
          name: user.name,
          department: user.department,
          user_type: user.userType
        })

        if (error) {
          console.error('خطأ في إنشاء المستخدم عبر RPC:', error)
          throw new Error(error.message || 'فشل في إنشاء المستخدم')
        }

        // تحديث القائمة المحلية
        await get().loadUsersFromSupabase()
        get().logAction('إضافة', 'مستخدم', user.name, `نوع المستخدم: ${user.userType}`)
      },

      // تحديث دور المستخدم
      updateUserRoleInSupabase: async (id, userType) => {
        const { error } = await supabase
          .from('users')
          .update({ user_type: userType })
          .eq('id', id)
        
        if (error) throw error
        
        set(state => ({ 
          users: state.users.map(u => 
            u.id === id ? { ...u, userType } : u
          ) 
        }))
      },

      // تحديث بيانات المستخدم (الاسم، القسم، الدور)
      updateUserInSupabase: async (id, data) => {
        const updateData: any = {}
        if (data.userType !== undefined) updateData.user_type = data.userType
        if (data.name !== undefined) updateData.name = data.name
        if (data.department !== undefined) updateData.department = data.department

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', id)

        if (error) throw error

        set(state => ({
          users: state.users.map(u =>
            u.id === id ? { ...u, ...data } : u
          )
        }))
      },

      // حذف مستخدم من Supabase
      deleteUserFromSupabase: async (id) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') {
          throw new Error('غير مصرح لك بحذف المستخدمين')
        }

        // منع حذف المستخدم الحالي
        if (currentUser.id === id) {
          throw new Error('لا يمكنك حذف حسابك الخاص')
        }

        try {
          // حذف من Supabase
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)

          if (error) {
            console.error('خطأ في حذف المستخدم:', error)
            throw error
          }

          // تحديث الحالة المحلية
          const deletedUser = get().users.find(u => u.id === id)
          set(state => ({
            users: state.users.filter(u => u.id !== id)
          }))

          console.log('تم حذف المستخدم بنجاح')
          if (deletedUser) {
            get().logAction('حذف', 'مستخدم', deletedUser.name, 'تم حذف حساب المستخدم')
          }
        } catch (error) {
          console.error('خطأ في حذف المستخدم:', error)
          throw error
        }
      },

      // تعطيل/تفعيل حساب مستخدم
      toggleUserStatus: async (id, isActive) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') {
          throw new Error('غير مصرح لك بتعطيل/تفعيل المستخدمين')
        }

        // منع تعطيل حساب المستخدم الحالي
        if (currentUser.id === id && !isActive) {
          throw new Error('لا يمكنك تعطيل حسابك الخاص')
        }

        try {
          // تحديث في Supabase
          const { error } = await supabase
            .from('users')
            .update({ is_active: isActive })
            .eq('id', id)

          if (error) {
            console.error('خطأ في تحديث حالة المستخدم:', error)
            throw error
          }

          // تحديث الحالة المحلية
          set(state => ({
            users: state.users.map(u =>
              u.id === id ? { ...u, isActive } : u
            )
          }))

          // إذا تم تعطيل المستخدم وكان مسجل دخول، تسجيل خروجه
          if (!isActive) {
            const user = get().users.find(u => u.id === id)
            if (user && get().currentUser?.id === id) {
              await get().logout()
            }
          }

          console.log(`تم ${isActive ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`)
        } catch (error) {
          console.error('خطأ في تحديث حالة المستخدم:', error)
          throw error
        }
      },

      // تحديث صلاحيات مستخدم
      updateUserPermissions: async (id, permissions) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') {
          throw new Error('غير مصرح لك بتعديل الصلاحيات')
        }
        try {
          const { error } = await supabase
            .from('users')
            .update({ permissions: permissions as any })
            .eq('id', id)
          if (error) throw error
          set(state => {
            const updatedUsers = state.users.map(u => u.id === id ? { ...u, permissions } : u)
            const isSelf = state.currentUser?.id === id
            const updatedCurrentUser = isSelf && state.currentUser
              ? { ...state.currentUser, permissions }
              : state.currentUser

            if (isSelf && updatedCurrentUser) {
              localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser))
            }

            return {
              users: updatedUsers,
              currentUser: updatedCurrentUser
            }
          })
        } catch (error) {
          console.error('خطأ في تحديث الصلاحيات:', error)
          throw error
        }
      },


  bulkAddCandidates: async (candidates: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'status'>[]) => {
    const { currentUser } = get()
    if (!currentUser || (currentUser.userType !== 'admin' && currentUser.userType !== 'security_employee')) return { success: 0, failed: 0, errors: [] }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    try {
      if (candidates.length === 0) {
        return { success: 0, failed: 0, errors: [] }
      }

      // جمع جميع الأرقام القومية للفحص الجماعي
      const nationalIds = candidates.map(c => c.nationalId).filter(id => id)
      
      // فحص التكرار من قاعدة البيانات (جميع الأرقام القومية دفعة واحدة)
      const { data: existingInDB } = await supabase
        .from('candidates')
        .select('national_id')
        .in('national_id', nationalIds)

      const existingNationalIdsInDB = new Set(existingInDB?.map(c => c.national_id) || [])

      // فحص أيضاً من الحالة المحلية
      const existingCandidates = get().candidates
      const existingNationalIdsLocal = new Set(existingCandidates.map(c => c.nationalId))

      // فحص التكرار داخل الملف نفسه
      const nationalIdCounts = new Map<string, number>()
      candidates.forEach(c => {
        const count = nationalIdCounts.get(c.nationalId) || 0
        nationalIdCounts.set(c.nationalId, count + 1)
      })

      // تصفية المرشحين المكررين
      const candidatesToAdd: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'status'>[] = []
      
      candidates.forEach((candidateData, index) => {
        // فحص التكرار داخل الملف
        if ((nationalIdCounts.get(candidateData.nationalId) || 0) > 1) {
          errors.push(`المرشح ${candidateData.name} (الرقم القومي: ${candidateData.nationalId}) مكرر داخل الملف`)
          failedCount++
          return
        }

        // فحص التكرار من قاعدة البيانات أو الحالة المحلية
        if (existingNationalIdsInDB.has(candidateData.nationalId) || existingNationalIdsLocal.has(candidateData.nationalId)) {
          errors.push(`المرشح ${candidateData.name} (الرقم القومي: ${candidateData.nationalId}) موجود مسبقاً في النظام`)
          failedCount++
          return
        }

        candidatesToAdd.push(candidateData)
      })

      // فحص المرشحين المرفوضين مسبقاً (جميع الأرقام القومية دفعة واحدة)
      const candidateNationalIds = candidatesToAdd.map(c => c.nationalId)
      const { data: rejectedCandidates } = await supabase
        .from('saved_candidates')
        .select('national_id, decision_date')
        .in('national_id', candidateNationalIds)
        .eq('final_result', 'مرفوض')

      const rejectedMap = new Map<string, string>()
      rejectedCandidates?.forEach(rc => {
        rejectedMap.set(rc.national_id, rc.decision_date)
      })

      // فحص أيضاً من الحالة المحلية
      const savedCandidates = get().savedCandidates
      savedCandidates.forEach(sc => {
        if (sc.finalResult === 'مرفوض' && candidateNationalIds.includes(sc.nationalId)) {
          rejectedMap.set(sc.nationalId, sc.decisionDate)
        }
      })

      // إعداد البيانات للإدراج الجماعي
      const { currentUser } = get()
      const candidatesToInsert = candidatesToAdd.map(candidateData => ({
        name: candidateData.name,
        national_id: candidateData.nationalId,
        birth_date: candidateData.birthDate,
        governorate: candidateData.governorate,
        qualification: candidateData.qualification,
        marital_status: candidateData.maritalStatus,
        security_company: candidateData.securityCompany,
        position: candidateData.position || null,
        offer_date: candidateData.offerDate,
        offer_result: candidateData.offerResult || 'في انتظار',
        status: 'جديد' as const,
        created_by: currentUser?.name || 'نظام',
        notes: candidateData.notes || null,
        is_rejected_before: rejectedMap.has(candidateData.nationalId),
        previous_rejection_date: rejectedMap.get(candidateData.nationalId) || null
      }))

      // إدراج جميع المرشحين دفعة واحدة
      if (candidatesToInsert.length > 0) {
        const { data: insertedData, error: insertError } = await supabase
          .from('candidates')
          .insert(candidatesToInsert)
          .select()

        if (insertError) {
          // إذا فشل الإدراج الجماعي، حاول إدراجهم واحداً تلو الآخر
          console.warn('فشل الإدراج الجماعي، جاري المحاولة واحداً تلو الآخر:', insertError)
          for (const candidateData of candidatesToAdd) {
            try {
              await get().addCandidate(candidateData)
              successCount++
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error)
              errors.push(`خطأ في إضافة ${candidateData.name}: ${errorMessage}`)
              failedCount++
            }
          }
        } else {
          // نجح الإدراج الجماعي
          successCount = insertedData?.length || 0
          
          // تحديث الحالة المحلية
          if (insertedData) {
            const transformedCandidates: Candidate[] = insertedData.map(data => ({
              id: data.id,
              name: data.name,
              nationalId: data.national_id,
              birthDate: data.birth_date,
              governorate: data.governorate,
              qualification: data.qualification,
              maritalStatus: data.marital_status as 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل',
              securityCompany: data.security_company,
              position: data.position || undefined,
              offerDate: data.offer_date,
              offerResult: data.offer_result as 'مقبول' | 'مرفوض' | 'مستبعد' | 'في انتظار',
              status: data.status as 'جديد' | 'قيد المراجعة' | 'تم التوظيف' | 'مرفوض',
              createdBy: data.created_by,
              notes: data.notes || undefined,
              workShift: data.work_shift as 'نهار' | 'ليل' | undefined,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              isRejectedBefore: data.is_rejected_before,
              previousRejectionDate: data.previous_rejection_date || undefined
            }))

            set(state => ({
              candidates: [...state.candidates, ...transformedCandidates]
            }))
          }
        }
      }

      return { success: successCount, failed: failedCount, errors }
    } catch (error) {
      console.error('خطأ في إضافة المرشحين:', error)
      throw error
    }
  },

  // إضافة عدة مرشحين محفوظين من ملف Excel
  bulkAddSavedCandidates: async (candidates: Omit<SavedCandidate, 'id' | 'createdAt'>[]) => {
    const { currentUser } = get()
    if (!currentUser || currentUser.userType !== 'admin') return { success: 0, failed: 0, errors: [] }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    try {
      if (candidates.length === 0) {
        return { success: 0, failed: 0, errors: [] }
      }

      // جمع جميع الأرقام القومية للفحص الجماعي
      const nationalIds = candidates.map(c => c.nationalId).filter(id => id)
      
      // فحص التكرار من قاعدة البيانات (جميع الأرقام القومية دفعة واحدة)
      const { data: existingInDB } = await supabase
        .from('saved_candidates')
        .select('national_id')
        .in('national_id', nationalIds)

      const existingNationalIdsInDB = new Set(existingInDB?.map(c => c.national_id) || [])

      // فحص أيضاً من الحالة المحلية
      const existingSavedCandidates = get().savedCandidates
      const existingNationalIdsLocal = new Set(existingSavedCandidates.map(c => c.nationalId))

      // فحص التكرار داخل الملف نفسه
      const nationalIdCounts = new Map<string, number>()
      candidates.forEach(c => {
        const count = nationalIdCounts.get(c.nationalId) || 0
        nationalIdCounts.set(c.nationalId, count + 1)
      })

      // تصفية المرشحين المكررين
      const candidatesToAdd: Omit<SavedCandidate, 'id' | 'createdAt'>[] = []
      
      candidates.forEach((candidateData) => {
        // فحص التكرار داخل الملف
        if ((nationalIdCounts.get(candidateData.nationalId) || 0) > 1) {
          errors.push(`المرشح المحفوظ ${candidateData.name} (الرقم القومي: ${candidateData.nationalId}) مكرر داخل الملف`)
          failedCount++
          return
        }

        // فحص التكرار من قاعدة البيانات أو الحالة المحلية
        if (existingNationalIdsInDB.has(candidateData.nationalId) || existingNationalIdsLocal.has(candidateData.nationalId)) {
          errors.push(`المرشح المحفوظ ${candidateData.name} (الرقم القومي: ${candidateData.nationalId}) موجود مسبقاً في النظام`)
          failedCount++
          return
        }

        candidatesToAdd.push(candidateData)
      })

      // إعداد البيانات للإدراج الجماعي
      const candidatesToInsert = candidatesToAdd.map(candidateData => ({
        name: candidateData.name,
        national_id: candidateData.nationalId,
        birth_date: candidateData.birthDate,
        governorate: candidateData.governorate,
        qualification: candidateData.qualification,
        marital_status: candidateData.maritalStatus,
        security_company: candidateData.securityCompany,
        position: candidateData.position || null,
        offer_date: candidateData.offerDate,
        final_result: candidateData.finalResult,
        decision_date: candidateData.decisionDate,
        decision_by: candidateData.decisionBy,
        notes: candidateData.notes || null,
        work_shift: candidateData.workShift || null,
        exclusion_reason: candidateData.exclusionReason || null,
        resignation_reason: candidateData.resignationReason || null,
        is_rejected_before: candidateData.isRejectedBefore,
        previous_rejection_date: candidateData.previousRejectionDate || null
      }))

      // إدراج جميع المرشحين المحفوظين دفعة واحدة
      if (candidatesToInsert.length > 0) {
        const { data: insertedData, error: insertError } = await supabase
          .from('saved_candidates')
          .insert(candidatesToInsert)
          .select()

        if (insertError) {
          // إذا فشل الإدراج الجماعي، حاول إدراجهم واحداً تلو الآخر
          console.warn('فشل الإدراج الجماعي للمرشحين المحفوظين، جاري المحاولة واحداً تلو الآخر:', insertError)
          for (const candidateData of candidatesToAdd) {
            try {
              const { data, error } = await supabase
                .from('saved_candidates')
                .insert([{
                  name: candidateData.name,
                  national_id: candidateData.nationalId,
                  birth_date: candidateData.birthDate,
                  governorate: candidateData.governorate,
                  qualification: candidateData.qualification,
                  marital_status: candidateData.maritalStatus,
                  security_company: candidateData.securityCompany,
                  position: candidateData.position || null,
                  offer_date: candidateData.offerDate,
                  final_result: candidateData.finalResult,
                  decision_date: candidateData.decisionDate,
                  decision_by: candidateData.decisionBy,
                  notes: candidateData.notes || null,
                  work_shift: candidateData.workShift || null,
                  exclusion_reason: candidateData.exclusionReason || null,
                  resignation_reason: candidateData.resignationReason || null,
                  is_rejected_before: candidateData.isRejectedBefore,
                  previous_rejection_date: candidateData.previousRejectionDate || null
                }])
                .select()
                .single()

              if (error) {
                errors.push(`خطأ في إضافة ${candidateData.name}: ${error.message}`)
                failedCount++
                continue
              }

              // تحديث الحالة المحلية
              const transformedData: SavedCandidate = {
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
                createdAt: data.created_at
              }
              
              set(state => ({
                savedCandidates: [...state.savedCandidates, transformedData]
              }))

              successCount++
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error)
              errors.push(`خطأ في إضافة ${candidateData.name}: ${errorMessage}`)
              failedCount++
            }
          }
        } else {
          // نجح الإدراج الجماعي
          successCount = insertedData?.length || 0
          
          // تحديث الحالة المحلية
          if (insertedData) {
            const transformedCandidates: SavedCandidate[] = insertedData.map(data => ({
              id: data.id,
              name: data.name,
              nationalId: data.national_id,
              birthDate: data.birth_date,
              governorate: data.governorate,
              qualification: data.qualification,
              maritalStatus: data.marital_status as 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل',
              securityCompany: data.security_company,
              position: data.position || undefined,
              offerDate: data.offer_date,
              finalResult: data.final_result as 'مقبول' | 'مرفوض' | 'مستبعد',
              decisionDate: data.decision_date,
              decisionBy: data.decision_by,
              notes: data.notes || undefined,
              workShift: data.work_shift as 'نهار' | 'ليل' | undefined,
              exclusionReason: data.exclusion_reason || undefined,
              resignationReason: data.resignation_reason || undefined,
              isRejectedBefore: data.is_rejected_before,
              previousRejectionDate: data.previous_rejection_date || undefined,
              createdAt: data.created_at
            }))

            set(state => ({
              savedCandidates: [...state.savedCandidates, ...transformedCandidates]
            }))
          }
        }
      }

      return { success: successCount, failed: failedCount, errors }
    } catch (error) {
      console.error('خطأ في إضافة المرشحين المحفوظين:', error)
      throw error
    }
  },

      // إعداد الاشتراكات التلقائية من Supabase
      setupRealtimeSubscriptions: () => {
        // console.log('🔔 إعداد الاشتراكات التلقائية...')
        
        // تنظيف الاشتراكات السابقة
        get().cleanupRealtimeSubscriptions()

        // اشتراك في تحديثات المرشحين
        candidatesSubscription = supabase
          .channel('candidates_changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'candidates' },
            (payload) => {
              console.log('📊 تحديث في المرشحين:', payload.eventType)
              queryClient.invalidateQueries({ queryKey: ['candidates'] })
            }
          )
          .subscribe()

        // اشتراك في تحديثات المرشحين المحفوظين
        savedCandidatesSubscription = supabase
          .channel('saved_candidates_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'saved_candidates' },
            (payload) => {
              console.log('💾 تحديث في المرشحين المحفوظين:', payload.eventType)
              queryClient.invalidateQueries({ queryKey: ['saved-candidates'] })
            }
          )
          .subscribe()

        // اشتراك في تحديثات المقابلات
        interviewsSubscription = supabase
          .channel('interviews_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'interviews' },
            (payload) => {
              console.log('📅 تحديث في المقابلات:', payload.eventType)
              queryClient.invalidateQueries({ queryKey: ['interviews'] })
            }
          )
          .subscribe()

        // اشتراك في تحديثات الإشعارات
        notificationsSubscription = supabase
          .channel('notifications_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'notifications' },
            (payload) => {
              console.log('🔔 تحديث في الإشعارات:', payload.eventType)
              queryClient.invalidateQueries({ queryKey: ['notifications'] })
            }
          )
          .subscribe()

        // اشتراك في تحديثات المستخدمين
        usersSubscription = supabase
          .channel('users_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'users' },
            (payload) => {
              console.log('👤 تحديث في المستخدمين:', payload.eventType)
              queryClient.invalidateQueries({ queryKey: ['users'] })

              // تحديث جلسة المستخدم الحالي إذا تم تعديلها مباشرة
              const { currentUser, users } = get()
              if (currentUser && payload.new && 'id' in payload.new && payload.new.id === currentUser.id) {
                const updatedUser = users.find(u => u.id === currentUser.id)
                if (updatedUser) {
                  if (updatedUser.isActive === false) {
                    console.log('تم تعطيل الحساب الحالي، سيتم تسجيل الخروج')
                    get().logout()
                  } else {
                    set({ currentUser: updatedUser })
                    get().saveUserSession(updatedUser)
                  }
                }
              }
            }
          )
          .subscribe()

        // اشتراك في تحديثات سجلات الدخول
        loginLogsSubscription = supabase
          .channel('login_logs_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'login_logs' },
            (payload) => {
              console.log('🔐 تحديث في سجلات الدخول:', payload.eventType)
              queryClient.invalidateQueries({ queryKey: ['login-logs'] })
              // تحديث مباشر للحالة المحلية
              if (payload.eventType === 'INSERT' && payload.new) {
                const newLog = payload.new as any
                const transformed: LoginLog = {
                  id: newLog.id, userId: newLog.user_id,
                  userEmail: newLog.user_email, userName: newLog.user_name,
                  loginTime: newLog.login_time, logoutTime: newLog.logout_time,
                  ipAddress: newLog.ip_address, userAgent: newLog.user_agent,
                  deviceType: newLog.device_type, browser: newLog.browser,
                  os: newLog.os, country: newLog.country, city: newLog.city,
                  latitude: newLog.latitude, longitude: newLog.longitude,
                  isActive: newLog.is_active, sessionId: newLog.session_id,
                  createdAt: newLog.created_at,
                }
                set(state => ({ loginLogs: [transformed, ...state.loginLogs] }))
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                const updated = payload.new as any
                set(state => ({
                  loginLogs: state.loginLogs.map(log =>
                    log.id === updated.id ? { ...log, isActive: updated.is_active, logoutTime: updated.logout_time } : log
                  )
                }))
              }
            }
          )
          .subscribe()

        // console.log('✅ تم إعداد الاشتراكات التلقائية بنجاح')
      },

      // تنظيف الاشتراكات
      cleanupRealtimeSubscriptions: () => {
        // console.log('🧹 تنظيف الاشتراكات...')
        
        if (candidatesSubscription) {
          supabase.removeChannel(candidatesSubscription)
          candidatesSubscription = null
        }
        
        if (savedCandidatesSubscription) {
          supabase.removeChannel(savedCandidatesSubscription)
          savedCandidatesSubscription = null
        }
        
        if (interviewsSubscription) {
          supabase.removeChannel(interviewsSubscription)
          interviewsSubscription = null
        }
        
        if (notificationsSubscription) {
          supabase.removeChannel(notificationsSubscription)
          notificationsSubscription = null
        }
        
        if (usersSubscription) {
          supabase.removeChannel(usersSubscription)
          usersSubscription = null
        }
        
        if (loginLogsSubscription) {
          supabase.removeChannel(loginLogsSubscription)
          loginLogsSubscription = null
        }
        
        // console.log('✅ تم تنظيف الاشتراكات')
      },

      // دالة للحصول على معلومات الجهاز والموقع (مع caching)
      getDeviceInfo: (() => {
        let cached: ReturnType<typeof getDeviceInfo> | null = null
        return async function getDeviceInfo() {
          if (cached) return cached

          try {
            const userAgent = navigator.userAgent
            const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'موبايل' : 'كمبيوتر'
            
            let browser = 'غير معروف'
            if (userAgent.includes('Chrome')) browser = 'Chrome'
            else if (userAgent.includes('Firefox')) browser = 'Firefox'
            else if (userAgent.includes('Safari')) browser = 'Safari'
            else if (userAgent.includes('Edge')) browser = 'Edge'

            let os = 'غير معروف'
            if (userAgent.includes('Windows')) os = 'Windows'
            else if (userAgent.includes('Mac')) os = 'macOS'
            else if (userAgent.includes('Linux')) os = 'Linux'
            else if (userAgent.includes('Android')) os = 'Android'
            else if (userAgent.includes('iOS')) os = 'iOS'

            // محاولة الحصول على IP والموقع (غير blocking)
            let ipAddress = 'غير معروف'
            let country = 'غير معروف'
            let city = 'غير معروف'
            let latitude: number | null = null
            let longitude: number | null = null
            
            try {
              const ipResponse = await fetch('https://api.ipify.org?format=json')
              const ipData = await ipResponse.json()
              ipAddress = ipData.ip
              
              try {
                const locationResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`)
                const locationData = await locationResponse.json()
                country = locationData.country_name || 'غير معروف'
                city = locationData.city || 'غير معروف'
                latitude = locationData.latitude || null
                longitude = locationData.longitude || null
              } catch (e) {
                // فشل الحصول على الموقع - مش مشكلة
              }
            } catch (e) {
              // فشل الحصول على IP - مش مشكلة
            }

            cached = { ipAddress, userAgent, deviceType, browser, os, country, city, latitude, longitude }
            return cached
          } catch (error) {
            console.error('خطأ في الحصول على معلومات الجهاز:', error)
            return {
              ipAddress: 'غير معروف',
              userAgent: navigator.userAgent,
              deviceType: 'غير معروف',
              browser: 'غير معروف',
              os: 'غير معروف',
              country: 'غير معروف',
              city: 'غير معروف',
              latitude: null,
              longitude: null
            }
          }
        }
      })(),

      // تسجيل الدخول في السجلات
      logLogin: async (userId, userEmail, userName) => {
        try {
          const deviceInfo = await get().getDeviceInfo()
          const sessionId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          // حفظ sessionId في localStorage
          localStorage.setItem('currentSessionId', sessionId)

          const loginLog = {
            user_id: userId,
            user_email: userEmail,
            user_name: userName,
            ip_address: deviceInfo.ipAddress,
            user_agent: deviceInfo.userAgent,
            device_type: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            country: deviceInfo.country,
            city: deviceInfo.city,
            latitude: deviceInfo.latitude,
            longitude: deviceInfo.longitude,
            is_active: true,
            session_id: sessionId
          }

          const { data, error } = await supabase
            .from('login_logs')
            .insert([loginLog])
            .select()
            .single()

          if (error) {
            console.error('خطأ في تسجيل الدخول:', error)
            return sessionId
          }

          // تحديث الحالة المحلية
          if (data) {
            const transformedLog: LoginLog = {
              id: data.id,
              userId: data.user_id,
              userEmail: data.user_email,
              userName: data.user_name,
              loginTime: data.login_time,
              logoutTime: data.logout_time,
              ipAddress: data.ip_address,
              userAgent: data.user_agent,
              deviceType: data.device_type,
              browser: data.browser,
              os: data.os,
              country: data.country,
              city: data.city,
              latitude: data.latitude,
              longitude: data.longitude,
              isActive: data.is_active,
              sessionId: data.session_id,
              createdAt: data.created_at
            }
            set(state => ({
              loginLogs: [transformedLog, ...state.loginLogs]
            }))
          }

          return sessionId
        } catch (error) {
          console.error('خطأ في تسجيل الدخول:', error)
          return `${userId}-${Date.now()}`
        }
      },

      // تسجيل الخروج في السجلات
      logLogout: async (sessionId) => {
        try {
          const { error } = await supabase
            .from('login_logs')
            .update({
              logout_time: new Date().toISOString(),
              is_active: false
            })
            .eq('session_id', sessionId)

          if (error) {
            console.error('خطأ في تسجيل الخروج:', error)
            return
          }

          // تحديث الحالة المحلية
          set(state => ({
            loginLogs: state.loginLogs.map(log =>
              log.sessionId === sessionId
                ? { ...log, logoutTime: new Date().toISOString(), isActive: false }
                : log
            )
          }))
        } catch (error) {
          console.error('خطأ في تسجيل الخروج:', error)
        }
      },

      // تحميل سجلات تسجيل الدخول
      loadLoginLogs: async () => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        try {
          const { data, error } = await supabase
            .from('login_logs')
            .select('*')
            .order('login_time', { ascending: false })
            .limit(1000)

          if (error) {
            console.error('خطأ في تحميل سجلات الدخول:', error)
            return
          }

          const transformedLogs: LoginLog[] = (data || []).map(log => ({
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
            createdAt: log.created_at
          }))

          set({ loginLogs: transformedLogs })
        } catch (error) {
          console.error('خطأ في تحميل سجلات الدخول:', error)
        }
      },

      // الحصول على الجلسات النشطة (حسب حالة is_active في DB)
      getActiveSessions: () => {
        const { loginLogs } = get()
        return loginLogs.filter(log => log.isActive)
      },

      // إنهاء الجلسات القديمة (تُنادى عند فتح التطبيق وكل 5 دقايق)
      expireStaleSessions: async () => {
        const { loginLogs, currentUser } = get()
        if (!currentUser) return
        const now = Date.now()
        const timeout = 30 * 60 * 1000 // 30 دقيقة
        const currentSessionId = localStorage.getItem('currentSessionId')
        
        const staleLogs = loginLogs.filter(log => {
          if (!log.isActive) return false
          // لا تنهي جلسة المستخدم الحالي
          if (currentSessionId && log.sessionId === currentSessionId) return false
          const loginTime = new Date(log.loginTime).getTime()
          return now - loginTime > timeout
        })

        if (staleLogs.length === 0) return

        // تحديث في Supabase للجلسات القديمة
        const staleIds = staleLogs.map(log => log.id)
        await supabase
          .from('login_logs')
          .update({ is_active: false, logout_time: new Date().toISOString() })
          .in('id', staleIds)

        // تحديث الحالة المحلية
        set(state => ({
          loginLogs: state.loginLogs.map(log =>
            staleIds.includes(log.id)
              ? { ...log, isActive: false, logoutTime: new Date().toISOString() }
              : log
          )
        }))
      },

      // تحميل سجلات الأنشطة (معطل)
      loadAuditLogs: async () => {},

      // تسجيل نشاط جديد (معطل)
      logAction: async () => {},

      // إضافة وظيفة set للوصول المباشر
      set: set
    })
)