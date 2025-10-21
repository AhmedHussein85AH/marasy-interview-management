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
  offerDate: string
  offerResult: 'مقبول' | 'مرفوض' | 'مستبعد' | 'في انتظار'
  status: 'جديد' | 'قيد المراجعة' | 'تم التوظيف' | 'مرفوض'
  createdBy: string
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
  offerDate: string
  finalResult: 'مقبول' | 'مرفوض' | 'مستبعد'
  decisionDate: string
  decisionBy: string
  notes?: string
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
  addCandidate: (candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void
  updateCandidateStatus: (id: string, status: Candidate['status'], offerResult: Candidate['offerResult']) => void
  deleteCandidate: (id: string) => void
  saveCandidateToDatabase: (candidate: Candidate, finalResult: 'مقبول' | 'مرفوض' | 'مستبعد', notes?: string) => void
  addInterview: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateInterview: (id: string, updates: Partial<Interview>) => void
  deleteInterview: (id: string) => void
  getCandidatesByStatus: (status: Candidate['status']) => Candidate[]
  searchCandidates: (query: string) => Candidate[]
  searchSavedCandidates: (query: string) => SavedCandidate[]
  getSavedCandidatesByResult: (result: 'مقبول' | 'مرفوض' | 'مستبعد') => SavedCandidate[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationAsRead: (id: string) => void
  getUnreadNotifications: () => Notification[]
  checkRejectedBefore: (nationalId: string) => { isRejected: boolean; date?: string }
  initializeDemoData: () => void
  resetData: () => void
}

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
          console.log('🎉 [STORE] تم تسجيل الدخول بنجاح!')
          console.log('👤 [STORE] المستخدم:', user.name)
          console.log('🏢 [STORE] القسم:', user.department)
          return true
        }
        
        console.log('❌ [STORE] فشل تسجيل الدخول - كلمة مرور خاطئة')
        return false
      },

      // تسجيل الخروج
      logout: () => {
        set({ currentUser: null })
      },

      // إضافة مرشح
      addCandidate: async (candidateData) => {
        const { currentUser, savedCandidates, candidates } = get()
        if (!currentUser) return

        try {
          // فحص إذا كان المرشح مرفوض من قبل
          const rejectedBefore = savedCandidates.find(
            saved => saved.nationalId === candidateData.nationalId && saved.finalResult === 'مرفوض'
          )

          const newCandidate = {
            ...candidateData,
            status: 'جديد' as const,
            created_by: currentUser.name,
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

          // تحديث الحالة المحلية
          set(state => ({
            candidates: [...state.candidates, data],
            stats: {
              ...state.stats,
              totalCandidates: state.stats.totalCandidates + 1
            }
          }))

          console.log('تم إضافة المرشح بنجاح إلى قاعدة البيانات')
        } catch (error) {
          console.error('خطأ في إضافة المرشح:', error)
          throw error
        }
      },

      // تحديث حالة المرشح
      updateCandidateStatus: async (id, status, offerResult) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType === 'security_employee') return

        try {
          // تحديث في Supabase
          const { error } = await supabase
            .from('candidates')
            .update({
              status,
              offer_result: offerResult,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)

          if (error) {
            console.error('خطأ في تحديث حالة المرشح:', error)
            throw error
          }

          // تحديث الحالة المحلية
          set(state => ({
            candidates: state.candidates.map(candidate =>
              candidate.id === id
                ? { ...candidate, status, offerResult, updatedAt: new Date().toISOString() }
                : candidate
            )
          }))

          // حفظ في قاعدة البيانات إذا كان القرار نهائي
          if (offerResult && ['مقبول', 'مرفوض', 'مستبعد'].includes(offerResult)) {
            const candidate = get().candidates.find(c => c.id === id)
            if (candidate) {
              await get().saveCandidateToDatabase({
                ...candidate,
                finalResult: offerResult as 'مقبول' | 'مرفوض' | 'مستبعد',
                decisionDate: new Date().toISOString(),
                decisionBy: currentUser.name,
                notes: ''
              })
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
            ...interviewData,
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
      saveCandidateToDatabase: async (candidateData) => {
        const { currentUser } = get()
        if (!currentUser) return

        try {
          const savedCandidate = {
            name: candidateData.name,
            national_id: candidateData.nationalId,
            birth_date: candidateData.birthDate,
            governorate: candidateData.governorate,
            qualification: candidateData.qualification,
            marital_status: candidateData.maritalStatus,
            security_company: candidateData.securityCompany,
            offer_date: candidateData.offerDate,
            final_result: candidateData.finalResult,
            decision_date: candidateData.decisionDate,
            decision_by: candidateData.decisionBy,
            notes: candidateData.notes || null,
            is_rejected_before: candidateData.isRejectedBefore || false,
            previous_rejection_date: candidateData.previousRejectionDate || null
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

          // تحديث الحالة المحلية
          set(state => ({
            savedCandidates: [...state.savedCandidates, data]
          }))
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
          candidate.qualification.toLowerCase().includes(lowercaseQuery)
        )
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

          // تحميل المرشحين
          const { data: candidates, error: candidatesError } = await supabase
            .from('candidates')
            .select('*')
            .order('created_at', { ascending: false })

          if (candidatesError) {
            console.error('خطأ في تحميل المرشحين:', candidatesError)
          }

          // تحميل المقابلات
          const { data: interviews, error: interviewsError } = await supabase
            .from('interviews')
            .select('*')
            .order('created_at', { ascending: false })

          if (interviewsError) {
            console.error('خطأ في تحميل المقابلات:', interviewsError)
          }

          // تحميل المرشحين المحفوظين
          const { data: savedCandidates, error: savedError } = await supabase
            .from('saved_candidates')
            .select('*')
            .order('created_at', { ascending: false })

          if (savedError) {
            console.error('خطأ في تحميل المرشحين المحفوظين:', savedError)
          }

          // تحميل الإشعارات
          const { data: notifications, error: notificationsError } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })

          if (notificationsError) {
            console.error('خطأ في تحميل الإشعارات:', notificationsError)
          }

          // حساب الإحصائيات
          const stats: DashboardStats = {
            totalCandidates: candidates?.length || 0,
            pendingInterviews: interviews?.filter(i => i.status === 'مجدولة').length || 0,
            completedInterviews: interviews?.filter(i => i.status === 'مكتملة').length || 0,
            hiredCandidates: candidates?.filter(c => c.offer_result === 'مقبول').length || 0,
            rejectedCandidates: candidates?.filter(c => c.offer_result === 'مرفوض').length || 0
          }

          set({
            candidates: candidates || [],
            interviews: interviews || [],
            savedCandidates: savedCandidates || [],
            notifications: notifications || [],
            stats,
            isInitialized: true
          })

          console.log('تم تحميل البيانات من Supabase بنجاح')
        } catch (error) {
          console.error('خطأ في تحميل البيانات:', error)
        }
      },

      // تهيئة البيانات التجريبية
      initializeDemoData: async () => {
        console.log('بدء تهيئة البيانات التجريبية...')
        
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

        console.log('تم تهيئة البيانات التجريبية بنجاح')
        console.log('المستخدمون المتاحون:', demoUsers.map(u => u.email))
      },

      // إعادة تعيين البيانات
      resetData: () => {
        console.log('🔄 [STORE] إعادة تعيين البيانات...')
        
        set({
          users: [],
          currentUser: null,
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
          },
          isInitialized: false
        })
        
        console.log('✅ [STORE] تم مسح جميع البيانات وإعادة التعيين')
      }
    })
)