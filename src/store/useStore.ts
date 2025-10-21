import { create } from 'zustand'

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
      addCandidate: (candidateData) => {
        const { currentUser, savedCandidates, candidates } = get()
        if (!currentUser) return

        // فحص إذا كان المرشح مرفوض من قبل
        const rejectedBefore = savedCandidates.find(
          saved => saved.nationalId === candidateData.nationalId && saved.finalResult === 'مرفوض'
        )

        const newCandidate: Candidate = {
          ...candidateData,
          id: Date.now().toString(),
          status: 'جديد',
          createdBy: currentUser.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isRejectedBefore: !!rejectedBefore,
          previousRejectionDate: rejectedBefore?.decisionDate
        }

        console.log('إضافة مرشح جديد:', newCandidate.name)
        console.log('Length before:', candidates.length)

        // إضافة إشعار إذا كان مرفوض من قبل
        if (rejectedBefore) {
          const notification: Notification = {
            id: Date.now().toString() + '_notification',
            type: 'rejected_before',
            title: 'مرشح مرفوض من قبل',
            message: `تم تسجيل مرشح جديد (${candidateData.name}) تم رفضه من قبل في ${rejectedBefore.decisionDate}`,
            candidateId: newCandidate.id,
            candidateName: candidateData.name,
            isRead: false,
            createdAt: new Date().toISOString()
          }
          
          set(state => ({
            candidates: [...state.candidates, newCandidate],
            notifications: [...state.notifications, notification],
            stats: {
              ...state.stats,
              totalCandidates: state.candidates.length + 1
            }
          }))
        } else {
          set(state => ({
            candidates: [...state.candidates, newCandidate],
            stats: {
              ...state.stats,
              totalCandidates: state.candidates.length + 1
            }
          }))
        }

        console.log('تم إضافة المرشح بنجاح')
        console.log('Length after:', get().candidates.length)
      },

      // تحديث حالة المرشح
      updateCandidateStatus: (id, status, offerResult) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType === 'security_employee') return

        set(state => ({
          candidates: state.candidates.map(candidate =>
            candidate.id === id
              ? { ...candidate, status, offerResult, updatedAt: new Date().toISOString() }
              : candidate
          )
        }))
      },

      // حذف مرشح
      deleteCandidate: (id) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        set(state => ({
          candidates: state.candidates.filter(candidate => candidate.id !== id),
          stats: {
            ...state.stats,
            totalCandidates: Math.max(0, state.stats.totalCandidates - 1)
          }
        }))
      },

      // إضافة مقابلة
      addInterview: (interviewData) => {
        const { currentUser } = get()
        if (!currentUser) return

        const newInterview: Interview = {
          ...interviewData,
          id: Date.now().toString(),
          interviewer: currentUser.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        set(state => ({
          interviews: [...state.interviews, newInterview]
        }))
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
      saveCandidateToDatabase: (candidate, finalResult, notes) => {
        const { currentUser, savedCandidates } = get()
        if (!currentUser) return

        const savedCandidate: SavedCandidate = {
          id: Date.now().toString(),
          name: candidate.name,
          nationalId: candidate.nationalId,
          birthDate: candidate.birthDate,
          governorate: candidate.governorate,
          qualification: candidate.qualification,
          maritalStatus: candidate.maritalStatus,
          securityCompany: candidate.securityCompany,
          offerDate: candidate.offerDate,
          finalResult,
          decisionDate: new Date().toISOString(),
          decisionBy: currentUser.name,
          notes,
          isRejectedBefore: candidate.isRejectedBefore || false,
          previousRejectionDate: candidate.previousRejectionDate,
          createdAt: new Date().toISOString()
        }

        set(state => ({
          savedCandidates: [...state.savedCandidates, savedCandidate]
        }))
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

      // تهيئة البيانات التجريبية
      initializeDemoData: () => {
        console.log('بدء تهيئة البيانات التجريبية...')
        
        const currentState = get()
        
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

        // إنشاء المرشحين التجريبيين - فقط إذا لم تكن موجودة
        const demoCandidates: Candidate[] = currentState.candidates.length > 0 ? currentState.candidates : [
          {
            id: '1',
            name: 'خالد عبدالله',
            nationalId: '12345678901234',
            birthDate: '1990-05-15',
            governorate: 'القاهرة',
            qualification: 'دبلوم تجارة',
            maritalStatus: 'متزوج',
            securityCompany: 'شركة الأمن المتقدم',
            offerDate: '2024-01-10',
            offerResult: 'في انتظار',
            status: 'جديد',
            createdBy: 'مدير الأمن - مسئول مقابلات',
            createdAt: '2024-01-08T10:00:00Z',
            updatedAt: '2024-01-08T10:00:00Z'
          },
          {
            id: '2',
            name: 'فاطمة حسن',
            nationalId: '23456789012345',
            birthDate: '1988-12-20',
            governorate: 'الجيزة',
            qualification: 'بكالوريوس إدارة أعمال',
            maritalStatus: 'أعزب',
            securityCompany: 'شركة الأمن المتقدم',
            offerDate: '2024-01-12',
            offerResult: 'في انتظار',
            status: 'جديد',
            createdBy: 'مدير الأمن - مسئول مقابلات',
            createdAt: '2024-01-09T14:30:00Z',
            updatedAt: '2024-01-09T14:30:00Z'
          }
        ]

        // إنشاء المقابلات التجريبية - فقط إذا لم تكن موجودة
        const demoInterviews: Interview[] = currentState.interviews.length > 0 ? currentState.interviews : [
          {
            id: '1',
            candidateId: '1',
            candidateName: 'خالد عبدالله',
            position: 'أمن',
            date: '2024-01-15',
            time: '10:00',
            status: 'مجدولة',
            notes: 'مقابلة أولية',
            interviewer: 'سارة أحمد - مسئول مقابلات',
            createdAt: '2024-01-10T09:00:00Z',
            updatedAt: '2024-01-10T09:00:00Z'
          }
        ]

        // حساب الإحصائيات
        const stats: DashboardStats = {
          totalCandidates: demoCandidates.length,
          pendingInterviews: demoInterviews.filter(i => i.status === 'مجدولة').length,
          completedInterviews: demoInterviews.filter(i => i.status === 'مكتملة').length,
          hiredCandidates: demoCandidates.filter(c => c.offerResult === 'مقبول').length,
          rejectedCandidates: demoCandidates.filter(c => c.offerResult === 'مرفوض').length
        }

        // تحديث البيانات مع الحفاظ على البيانات الموجودة
        set({
          users: demoUsers,
          candidates: demoCandidates,
          interviews: demoInterviews,
          stats,
          isInitialized: true,
          // الحفاظ على البيانات الموجودة
          savedCandidates: currentState.savedCandidates || [],
          notifications: currentState.notifications || []
        })

        console.log('تم تهيئة البيانات التجريبية بنجاح')
        console.log('المستخدمون المتاحون:', demoUsers.map(u => u.email))
        console.log('المرشحون المتاحون:', demoCandidates.length)
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