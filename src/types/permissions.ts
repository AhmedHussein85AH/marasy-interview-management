// ══════════════════════════════════════════════════════════════
//  User Permissions – مصفوفة الصلاحيات الشاملة والدقيقة للنظام
// ══════════════════════════════════════════════════════════════

export interface UserPermissions {
  // ── المرشحون والملفات ──
  canViewCandidates: boolean          // عرض قائمة المرشحين
  canAddCandidates: boolean           // إضافة مرشح جديد
  canEditCandidates: boolean          // تعديل بيانات المرشح
  canDeleteCandidates: boolean        // حذف مرشح
  canApproveCandidates: boolean       // اتخاذ قرار المقابلة (قبول / رفض / استبعاد)
  canBulkEditCandidates: boolean      // التعديل الجماعي للمرشحين
  canUploadPhotos: boolean            // رفع وتعديل الصور الشخصية
  canUploadCV: boolean                // رفع وتنزيل السير الذاتية
  canPrintCards: boolean              // طباعة ومشاركة كروت الهوية الرقمية
  canScanQR: boolean                  // استخدام ماسح كروت الـ QR بالكاميرا
  canExportCandidatesExcel: boolean   // تصدير كشوفات المرشحين Excel

  // ── المقابلات والمواعيد ──
  canManageInterviews: boolean        // إدارة ومتابعة جدول المقابلات
  canScheduleInterviews: boolean      // جدولة المقابلات وتعيين اللجان

  // ── قاعدة البيانات والأرشيف ──
  canViewDatabase: boolean            // عرض الأرشيف وقاعدة البيانات المعتمدة
  canDeleteFromDatabase: boolean      // حذف سجلات من قاعدة البيانات
  canExcludeFromDatabase: boolean     // تسجيل استبعاد / استقالة موظف
  canRemoveDuplicates: boolean        // إزالة وتنظيف السجلات المكررة
  canExportDatabase: boolean          // تصدير بيانات الأرشيف Excel

  // ── الرفع الجماعي ──
  canBulkUpload: boolean              // رفع وتحديث شيتات Excel الجماعية
  canBulkUploadPhotos: boolean        // الرفع الجماعي لمجلدات الصور
  canExportData: boolean              // تصدير واستخراج النسخ الاحتياطية

  // ── التقارير والذكاء الاصطناعي ──
  canViewAnalytics: boolean           // عرض الإحصائيات ولوحة التحليلات
  canExportReports: boolean           // تصدير وطباعة التقارير الإحصائية
  canUseAIAssistant: boolean          // استخدام المساعد الذكي Marassi AI

  // ── الإدارة والأمان ──
  canManageUsers: boolean             // إنشاء وتعديل المستخدمين
  canAccessSettings: boolean          // الوصول للإعدادات وتخصيص القوائم
  canViewSecurity: boolean            // مراقبة سجلات الدخول والأمان (Audit Logs)
}

// ── الصلاحيات الافتراضية لكل دور (Role Defaults) ───────────────────────
export const DEFAULT_PERMISSIONS: Record<string, UserPermissions> = {
  admin: {
    // المرشحون
    canViewCandidates: true,
    canAddCandidates: true,
    canEditCandidates: true,
    canDeleteCandidates: true,
    canApproveCandidates: true,
    canBulkEditCandidates: true,
    canUploadPhotos: true,
    canUploadCV: true,
    canPrintCards: true,
    canScanQR: true,
    canExportCandidatesExcel: true,
    // المقابلات
    canManageInterviews: true,
    canScheduleInterviews: true,
    // قاعدة البيانات
    canViewDatabase: true,
    canDeleteFromDatabase: true,
    canExcludeFromDatabase: true,
    canRemoveDuplicates: true,
    canExportDatabase: true,
    // الرفع والبيانات
    canBulkUpload: true,
    canBulkUploadPhotos: true,
    canExportData: true,
    // التقارير والـ AI
    canViewAnalytics: true,
    canExportReports: true,
    canUseAIAssistant: true,
    // الإدارة
    canManageUsers: true,
    canAccessSettings: true,
    canViewSecurity: true,
  },

  interview_manager: {
    // المرشحون
    canViewCandidates: true,
    canAddCandidates: false,
    canEditCandidates: false,
    canDeleteCandidates: false,
    canApproveCandidates: true,
    canBulkEditCandidates: false,
    canUploadPhotos: true,
    canUploadCV: true,
    canPrintCards: true,
    canScanQR: true,
    canExportCandidatesExcel: true,
    // المقابلات
    canManageInterviews: true,
    canScheduleInterviews: true,
    // قاعدة البيانات
    canViewDatabase: true,
    canDeleteFromDatabase: false,
    canExcludeFromDatabase: true,
    canRemoveDuplicates: false,
    canExportDatabase: true,
    // الرفع والبيانات
    canBulkUpload: false,
    canBulkUploadPhotos: false,
    canExportData: true,
    // التقارير والـ AI
    canViewAnalytics: true,
    canExportReports: true,
    canUseAIAssistant: true,
    // الإدارة
    canManageUsers: false,
    canAccessSettings: false,
    canViewSecurity: false,
  },

  security_employee: {
    // المرشحون
    canViewCandidates: true,
    canAddCandidates: true,
    canEditCandidates: true,
    canDeleteCandidates: false,
    canApproveCandidates: false,
    canBulkEditCandidates: true,
    canUploadPhotos: true,
    canUploadCV: true,
    canPrintCards: true,
    canScanQR: true,
    canExportCandidatesExcel: false,
    // المقابلات
    canManageInterviews: false,
    canScheduleInterviews: false,
    // قاعدة البيانات
    canViewDatabase: true,
    canDeleteFromDatabase: false,
    canExcludeFromDatabase: false,
    canRemoveDuplicates: false,
    canExportDatabase: false,
    // الرفع والبيانات
    canBulkUpload: true,
    canBulkUploadPhotos: true,
    canExportData: false,
    // التقارير والـ AI
    canViewAnalytics: true,
    canExportReports: false,
    canUseAIAssistant: true,
    // الإدارة
    canManageUsers: false,
    canAccessSettings: false,
    canViewSecurity: false,
  },
}

// ── المسميات العربية الدقيقة لكل صلاحية ──────────────────────────────
export const PERMISSION_LABELS: Record<keyof UserPermissions, string> = {
  // المرشحون
  canViewCandidates:        'عرض قائمة المرشحين',
  canAddCandidates:         'إضافة مرشحين جدد',
  canEditCandidates:        'تعديل بيانات المرشحين',
  canDeleteCandidates:      'حذف مرشحين',
  canApproveCandidates:     'اتخاذ قرار المقابلة (قبول / رفض / استبعاد)',
  canBulkEditCandidates:    'التعديل الجماعي للمرشحين',
  canUploadPhotos:          'رفع وتعديل الصور الشخصية',
  canUploadCV:              'رفع وتنزيل السير الذاتية (CV)',
  canPrintCards:            'طباعة ومشاركة كروت الهوية الرقمية',
  canScanQR:                'فحص وسكان كروت الـ QR بالكاميرا',
  canExportCandidatesExcel: 'تصدير كشوف المرشحين Excel',

  // المقابلات
  canManageInterviews:      'إدارة ومتابعة المقابلات',
  canScheduleInterviews:    'جدولة المقابلات وتعيين اللجان',

  // قاعدة البيانات
  canViewDatabase:          'عرض قاعدة البيانات والأرشيف',
  canDeleteFromDatabase:    'حذف سجلات من قاعدة البيانات',
  canExcludeFromDatabase:   'تسجيل استبعاد أو استقالة موظف',
  canRemoveDuplicates:      'إزالة وتنظيف السجلات المكررة',
  canExportDatabase:        'تصدير بيانات الأرشيف Excel',

  // الرفع والبيانات
  canBulkUpload:            'رفع وتحديث شيتات Excel',
  canBulkUploadPhotos:      'الرفع الجماعي لمجلدات الصور',
  canExportData:            'تصدير واستخراج النسخ الاحتياطية',

  // التقارير والـ AI
  canViewAnalytics:         'عرض الإحصائيات ولوحة التحليلات',
  canExportReports:         'تصدير وطباعة التقارير الإحصائية',
  canUseAIAssistant:        'استخدام المساعد الذكي Marassi AI',

  // الإدارة
  canManageUsers:           'إدارة المستخدمين وحسابات الدخول',
  canAccessSettings:        'الوصول للإعدادات وتخصيص القوائم',
  canViewSecurity:          'مراقبة سجلات الأمان والنشاطات (Audit Logs)',
}

// ── تجميع الصلاحيات في مجموعات منظمة ───────────────────────────
export const PERMISSION_GROUPS: { label: string; keys: (keyof UserPermissions)[] }[] = [
  {
    label: '📋 إدارة المرشحين والملفات',
    keys: [
      'canViewCandidates',
      'canAddCandidates',
      'canEditCandidates',
      'canDeleteCandidates',
      'canApproveCandidates',
      'canBulkEditCandidates',
      'canUploadPhotos',
      'canUploadCV',
      'canPrintCards',
      'canScanQR',
      'canExportCandidatesExcel',
    ],
  },
  {
    label: '📅 المقابلات والجدولة',
    keys: ['canManageInterviews', 'canScheduleInterviews'],
  },
  {
    label: '🗄️ قاعدة البيانات والأرشيف',
    keys: [
      'canViewDatabase',
      'canDeleteFromDatabase',
      'canExcludeFromDatabase',
      'canRemoveDuplicates',
      'canExportDatabase',
    ],
  },
  {
    label: '📤 الرفع الجماعي والنسخ الاحتياطي',
    keys: ['canBulkUpload', 'canBulkUploadPhotos', 'canExportData'],
  },
  {
    label: '📊 التقارير والذكاء الاصطناعي',
    keys: ['canViewAnalytics', 'canExportReports', 'canUseAIAssistant'],
  },
  {
    label: '🛡️ الإدارة والأمان والرقابة',
    keys: ['canManageUsers', 'canAccessSettings', 'canViewSecurity'],
  },
]
