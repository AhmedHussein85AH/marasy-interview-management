import { create } from 'zustand'
import { supabase } from '../integrations/supabase/client'
import { Database } from '../integrations/supabase/types'

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
  isActive?: boolean // حالة الحساب: نشط/معطل
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
  deleteCandidate: (id: string) => void
  saveCandidateToDatabase: (candidate: Candidate, finalResult: 'مقبول' | 'مرفوض' | 'مستبعد' | 'استقالة', notes?: string, workShift?: 'نهار' | 'ليل', exclusionReason?: string, resignationReason?: string) => Promise<void>
  addInterview: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateInterview: (id: string, updates: Partial<Interview>) => void
  deleteInterview: (id: string) => void
  getCandidatesByStatus: (status: Candidate['status']) => Candidate[]
  searchCandidates: (query: string) => Candidate[]
  searchSavedCandidates: (query: string) => SavedCandidate[]
  searchSavedCandidatesByCompany: (company: string) => SavedCandidate[]
  getSavedCandidatesByResult: (result: 'مقبول' | 'مرفوض' | 'مستبعد') => SavedCandidate[]
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
  addUserToSupabase: (user: { name: string; email: string; userType: UserType; department: string }) => Promise<void>
  updateUserRoleInSupabase: (id: string, userType: UserType) => Promise<void>
  deleteUserFromSupabase: (id: string) => Promise<void>
  toggleUserStatus: (id: string, isActive: boolean) => Promise<void>
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
          // جلب بيانات المستخدم من جدول users في Supabase
          const { data, error } = await supabase
            .from('users')
            .select('id, name, email, user_type, department, created_at, is_active')
            .eq('email', email)
            .maybeSingle()

          if (error) throw error

          let mappedUser: User
          if (data) {
            // التحقق من حالة الحساب (نشط/معطل)
            if (data.is_active === false) {
              console.log('❌ [STORE] الحساب معطل')
              return false
            }
            
            mappedUser = {
              id: data.id,
              name: data.name,
              email: data.email,
              userType: data.user_type as UserType,
              department: data.department,
              createdAt: data.created_at,
              isActive: data.is_active ?? true // افتراضياً نشط إذا كانت القيمة null
            }
          } else {
            // في حال عدم وجود صف، ننشئ مستخدماً افتراضياً بحد أدنى من المعلومات
            mappedUser = {
              id: Date.now().toString(),
              name: email.split('@')[0],
              email,
              userType: 'security_employee',
              department: 'General',
              createdAt: new Date().toISOString(),
              isActive: true
            }
          }

          set({ currentUser: mappedUser })
          // حفظ الجلسة في localStorage
          get().saveUserSession(mappedUser)
          // إضافة المستخدم للذاكرة إن لم يكن موجوداً في القائمة الحالية
          const existing = get().users.find(u => u.email === mappedUser.email)
          if (!existing) {
            set(state => ({ users: [...state.users, mappedUser] }))
          }
          // تسجيل الدخول في السجلات
          await get().logLogin(mappedUser.id, mappedUser.email, mappedUser.name)
          return true
        } catch (e) {
          return false
        }
      },

      // إضافة مرشح
      addCandidate: async (candidateData) => {
        const { currentUser, savedCandidates, candidates } = get()
        if (!currentUser) return

        try {
          // فحص التكرار من قاعدة البيانات أولاً
          const { data: existingInDB } = await supabase
            .from('candidates')
            .select('id, national_id')
            .eq('national_id', candidateData.nationalId)
            .maybeSingle()

          if (existingInDB) {
            throw new Error(`المرشح برقم قومي ${candidateData.nationalId} موجود مسبقاً في قاعدة البيانات`)
          }

          // فحص إذا كان المرشح مرفوض من قبل
          const rejectedBefore = savedCandidates.find(
            saved => saved.nationalId === candidateData.nationalId && saved.finalResult === 'مرفوض'
          )
          
          // فحص أيضاً من قاعدة البيانات
          if (!rejectedBefore) {
            const { data: rejectedInDB } = await supabase
              .from('saved_candidates')
              .select('decision_date')
              .eq('national_id', candidateData.nationalId)
              .eq('final_result', 'مرفوض')
              .maybeSingle()
            
            if (rejectedInDB) {
              // إعادة تحميل savedCandidates من قاعدة البيانات
              const { data: savedData } = await supabase
                .from('saved_candidates')
                .select('*')
                .eq('national_id', candidateData.nationalId)
                .eq('final_result', 'مرفوض')
                .single()
              
              if (savedData) {
                const transformed: SavedCandidate = {
                  id: savedData.id,
                  name: savedData.name,
                  nationalId: savedData.national_id,
                  birthDate: savedData.birth_date,
                  governorate: savedData.governorate,
                  qualification: savedData.qualification,
                  maritalStatus: savedData.marital_status,
                  securityCompany: savedData.security_company,
                  position: savedData.position,
                  offerDate: savedData.offer_date,
                  finalResult: savedData.final_result,
                  decisionDate: savedData.decision_date,
                  decisionBy: savedData.decision_by,
                  notes: savedData.notes,
                  workShift: savedData.work_shift,
                  exclusionReason: savedData.exclusion_reason,
                  resignationReason: savedData.resignation_reason,
                  isRejectedBefore: savedData.is_rejected_before,
                  previousRejectionDate: savedData.previous_rejection_date,
                  createdAt: savedData.created_at
                }
                // تحديث الحالة المحلية
                set(state => ({
                  savedCandidates: state.savedCandidates.some(s => s.id === transformed.id)
                    ? state.savedCandidates
                    : [...state.savedCandidates, transformed]
                }))
              }
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

          // إضافة الإشعار إذا كان مرفوض من قبل
          if (rejectedBefore) {
            const notification = {
              type: 'rejected_before' as const,
              title: 'مرشح مرفوض من قبل',
              message: `تم تسجيل مرشح جديد (${candidateData.name}) تم رفضه من قبل في ${rejectedBefore.decisionDate}`,
              candidate_id: data.id,
              candidate_name: candidateData.name,
              is_read: false
            }

            await supabase
              .from('notifications')
              .insert([notification])
          }

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
        } catch (error) {
          console.error('خطأ في إضافة المرشح:', error)
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
      updateInterview: (id, updates) => {
        set(state => ({
          interviews: state.interviews.map(interview =>
            interview.id === id
              ? { ...interview, ...updates, updatedAt: new Date().toISOString() }
              : interview
          )
        }))
      },

      // حذف مقابلة
      deleteInterview: (id) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        set(state => ({
          interviews: state.interviews.filter(interview => interview.id !== id)
        }))
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
          // فحص التكرار من قاعدة البيانات أولاً
          const { data: existingInDB } = await supabase
            .from('saved_candidates')
            .select('*')
            .eq('national_id', candidate.nationalId)
            .maybeSingle()

          // فحص إذا كان المرشح محفوظ مسبقاً بنفس الرقم القومي (من الحالة المحلية أو قاعدة البيانات)
          const existingCandidate = existingInDB ? {
            id: existingInDB.id,
            nationalId: existingInDB.national_id,
            // ... باقي البيانات
          } : savedCandidates.find(
            saved => saved.nationalId === candidate.nationalId
          )

          if (existingCandidate || existingInDB) {
            const existingId = existingInDB?.id || existingCandidate?.id
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
      markNotificationAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        }))
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
          console.log('تحميل البيانات من Supabase...')
          console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
          console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing')

          // تحميل المرشحين
          const { data: candidates, error: candidatesError } = await supabase
            .from('candidates')
            .select('*')
            .order('created_at', { ascending: false })

          if (candidatesError) {
            console.error('خطأ في تحميل المرشحين:', candidatesError)
            console.error('تفاصيل الخطأ:', candidatesError.message)
          }

          // تحميل المقابلات
          const { data: interviews, error: interviewsError } = await supabase
            .from('interviews')
            .select('*')
            .order('created_at', { ascending: false })

          if (interviewsError) {
            console.error('خطأ في تحميل المقابلات:', interviewsError)
            console.error('تفاصيل الخطأ:', interviewsError.message)
          }

          // تحميل المرشحين المحفوظين
          const { data: savedCandidates, error: savedError } = await supabase
            .from('saved_candidates')
            .select('*')
            .order('created_at', { ascending: false })

          if (savedError) {
            console.error('خطأ في تحميل المرشحين المحفوظين:', savedError)
            console.error('تفاصيل الخطأ:', savedError.message)
          }

          // تحميل الإشعارات
          const { data: notifications, error: notificationsError } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })

          if (notificationsError) {
            console.error('خطأ في تحميل الإشعارات:', notificationsError)
            console.error('تفاصيل الخطأ:', notificationsError.message)
          }

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

          set({
            candidates: transformedCandidates,
            interviews: transformedInterviews,
            savedCandidates: transformedSavedCandidates,
            notifications: notifications || [],
            stats,
            isInitialized: true
          })

          console.log('تم تحميل البيانات من Supabase بنجاح')
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
        console.log('بدء تهيئة البيانات التجريبية...')
        
        // محاولة استعادة جلسة المستخدم أولاً
        const sessionRestored = get().restoreUserSession()
        if (sessionRestored) {
          console.log('تم استعادة جلسة المستخدم بنجاح')
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

        console.log('إنشاء المستخدمين التجريبيين:', demoUsers.map(u => u.email))

        // تحديث المستخدمين
        set({
          users: demoUsers,
          isInitialized: true
        })

        // تحميل البيانات من Supabase
        await get().loadDataFromSupabase()
        await get().loadUsersFromSupabase()

        // إعداد الاشتراكات التلقائية
        get().setupRealtimeSubscriptions()

        console.log('تم تهيئة البيانات التجريبية بنجاح')
        console.log('المستخدمون المتاحون:', demoUsers.map(u => u.email))
      },

      // تحميل المستخدمين من Supabase
      loadUsersFromSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, name, email, user_type, department, created_at, is_active')
            .order('created_at', { ascending: false })
          
          if (!error && data) {
            const mapped: User[] = data.map(u => ({
              id: u.id,
              name: u.name,
              email: u.email,
              userType: u.user_type as UserType,
              department: u.department,
              createdAt: u.created_at,
              isActive: u.is_active ?? true // افتراضياً نشط إذا كانت القيمة null
            }))
            set({ users: mapped })
          }
        } catch (error) {
          console.error('خطأ في تحميل المستخدمين:', error)
        }
      },

      // إضافة مستخدم إلى Supabase
      addUserToSupabase: async (user) => {
        const { data, error } = await supabase
          .from('users')
          .insert([{ 
            name: user.name, 
            email: user.email, 
            user_type: user.userType, 
            department: user.department,
            is_active: true // المستخدمون الجدد نشطين افتراضياً
          }])
          .select('id, name, email, user_type, department, created_at, is_active')
          .single()
        
        if (error) throw error
        
        const mapped: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          userType: data.user_type as UserType,
          department: data.department,
          createdAt: data.created_at,
          isActive: data.is_active ?? true
        }
        
        set(state => ({ users: [mapped, ...state.users] }))
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
          set(state => ({
            users: state.users.filter(u => u.id !== id)
          }))

          console.log('تم حذف المستخدم بنجاح')
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

  // إضافة عدة مرشحين من ملف Excel
  bulkAddCandidates: async (candidates: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'status'>[]) => {
    const { currentUser } = get()
    if (!currentUser || currentUser.userType !== 'admin') return { success: 0, failed: 0, errors: [] }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    try {
      for (const candidateData of candidates) {
        try {
          // فحص التكرار من قاعدة البيانات أولاً
          const { data: existingInDB } = await supabase
            .from('candidates')
            .select('id, national_id')
            .eq('national_id', candidateData.nationalId)
            .maybeSingle()

          // فحص أيضاً من الحالة المحلية
          const existingCandidate = get().candidates.find(
            c => c.nationalId === candidateData.nationalId
          )

          if (existingCandidate || existingInDB) {
            errors.push(`المرشح ${candidateData.name} (الرقم القومي: ${candidateData.nationalId}) موجود مسبقاً`)
            failedCount++
            continue
          }

          // إضافة المرشح
          await get().addCandidate(candidateData)
          successCount++
        } catch (error) {
          errors.push(`خطأ في إضافة ${candidateData.name}: ${error}`)
          failedCount++
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
      for (const candidateData of candidates) {
        try {
          // فحص التكرار من قاعدة البيانات أولاً
          const { data: existingInDB } = await supabase
            .from('saved_candidates')
            .select('id, national_id')
            .eq('national_id', candidateData.nationalId)
            .maybeSingle()

          // فحص أيضاً من الحالة المحلية
          const existingCandidate = get().savedCandidates.find(
            c => c.nationalId === candidateData.nationalId
          )

          if (existingCandidate || existingInDB) {
            errors.push(`المرشح المحفوظ ${candidateData.name} (الرقم القومي: ${candidateData.nationalId}) موجود مسبقاً`)
            failedCount++
            continue
          }

          // إضافة المرشح المحفوظ مباشرة إلى Supabase
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

          successCount++
        } catch (error) {
          errors.push(`خطأ في إضافة ${candidateData.name}: ${error}`)
          failedCount++
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
        console.log('🔔 إعداد الاشتراكات التلقائية...')
        
        // تنظيف الاشتراكات السابقة
        get().cleanupRealtimeSubscriptions()

        // اشتراك في تحديثات المرشحين
        candidatesSubscription = supabase
          .channel('candidates_changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'candidates' },
            async (payload) => {
              console.log('📊 تحديث في المرشحين:', payload.eventType)
              // إعادة تحميل البيانات من Supabase
              await get().loadDataFromSupabase()
            }
          )
          .subscribe()

        // اشتراك في تحديثات المرشحين المحفوظين
        savedCandidatesSubscription = supabase
          .channel('saved_candidates_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'saved_candidates' },
            async (payload) => {
              console.log('💾 تحديث في المرشحين المحفوظين:', payload.eventType)
              // إعادة تحميل البيانات من Supabase
              await get().loadDataFromSupabase()
            }
          )
          .subscribe()

        // اشتراك في تحديثات المقابلات
        interviewsSubscription = supabase
          .channel('interviews_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'interviews' },
            async (payload) => {
              console.log('📅 تحديث في المقابلات:', payload.eventType)
              // إعادة تحميل البيانات من Supabase
              await get().loadDataFromSupabase()
            }
          )
          .subscribe()

        // اشتراك في تحديثات الإشعارات
        notificationsSubscription = supabase
          .channel('notifications_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'notifications' },
            async (payload) => {
              console.log('🔔 تحديث في الإشعارات:', payload.eventType)
              // إعادة تحميل البيانات من Supabase
              await get().loadDataFromSupabase()
            }
          )
          .subscribe()

        console.log('✅ تم إعداد الاشتراكات التلقائية بنجاح')
      },

      // تنظيف الاشتراكات
      cleanupRealtimeSubscriptions: () => {
        console.log('🧹 تنظيف الاشتراكات...')
        
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
        
        console.log('✅ تم تنظيف الاشتراكات')
      },

      // دالة للحصول على معلومات الجهاز والموقع
      getDeviceInfo: async () => {
        try {
          // الحصول على IP Address
          const ipResponse = await fetch('https://api.ipify.org?format=json')
          const ipData = await ipResponse.json()
          const ipAddress = ipData.ip

          // الحصول على معلومات الموقع من IP
          let locationData: any = {}
          try {
            const locationResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`)
            locationData = await locationResponse.json()
          } catch (e) {
            console.log('فشل في الحصول على الموقع من ipapi.co')
          }

          // تحليل User Agent
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

          return {
            ipAddress,
            userAgent,
            deviceType,
            browser,
            os,
            country: locationData.country_name || 'غير معروف',
            city: locationData.city || 'غير معروف',
            latitude: locationData.latitude || null,
            longitude: locationData.longitude || null
          }
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
      },

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

      // الحصول على الجلسات النشطة
      getActiveSessions: () => {
        const { loginLogs } = get()
        return loginLogs.filter(log => log.isActive)
      },

      // إضافة وظيفة set للوصول المباشر
      set: set
    })
)