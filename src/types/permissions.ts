// ── كل الصلاحيات المتاحة في النظام ──────────────────────
export interface UserPermissions {
  // المرشحون
  canViewCandidates: boolean
  canAddCandidates: boolean
  canEditCandidates: boolean
  canDeleteCandidates: boolean
  canApproveCandidates: boolean   // قبول / رفض
  canBulkEditCandidates: boolean  // تعديل جماعي

  // قاعدة البيانات
  canViewDatabase: boolean
  canDeleteFromDatabase: boolean
  canExcludeFromDatabase: boolean // استبعاد / استقالة

  // التقارير
  canViewAnalytics: boolean
  canExportReports: boolean

  // رفع الملفات
  canBulkUpload: boolean
  canExportData: boolean

  // المستخدمون
  canManageUsers: boolean

  // الإعدادات
  canAccessSettings: boolean

  // مراقبة الأمان
  canViewSecurity: boolean
}

// ── الصلاحيات الافتراضية لكل role ───────────────────────
export const DEFAULT_PERMISSIONS: Record<string, UserPermissions> = {
  admin: {
    canViewCandidates: true,
    canAddCandidates: true,
    canEditCandidates: true,
    canDeleteCandidates: true,
    canApproveCandidates: true,
    canBulkEditCandidates: true,
    canViewDatabase: true,
    canDeleteFromDatabase: true,
    canExcludeFromDatabase: true,
    canViewAnalytics: true,
    canExportReports: true,
    canBulkUpload: true,
    canExportData: true,
    canManageUsers: true,
    canAccessSettings: true,
    canViewSecurity: true,
  },
  interview_manager: {
    canViewCandidates: true,
    canAddCandidates: false,
    canEditCandidates: false,
    canDeleteCandidates: false,
    canApproveCandidates: true,
    canBulkEditCandidates: false,
    canViewDatabase: true,
    canDeleteFromDatabase: false,
    canExcludeFromDatabase: true,
    canViewAnalytics: true,
    canExportReports: true,
    canBulkUpload: false,
    canExportData: true,
    canManageUsers: false,
    canAccessSettings: false,
    canViewSecurity: false,
  },
  security_employee: {
    canViewCandidates: true,
    canAddCandidates: true,
    canEditCandidates: true,
    canDeleteCandidates: false,
    canApproveCandidates: false,
    canBulkEditCandidates: true,
    canViewDatabase: true,
    canDeleteFromDatabase: false,
    canExcludeFromDatabase: false,
    canViewAnalytics: true,
    canExportReports: false,
    canBulkUpload: true,
    canExportData: false,
    canManageUsers: false,
    canAccessSettings: false,
    canViewSecurity: false,
  },
}

// ── أسماء الصلاحيات بالعربي ──────────────────────────────
export const PERMISSION_LABELS: Record<keyof UserPermissions, string> = {
  canViewCandidates:     'عرض المرشحين',
  canAddCandidates:      'إضافة مرشحين',
  canEditCandidates:     'تعديل بيانات المرشحين',
  canDeleteCandidates:   'حذف المرشحين',
  canApproveCandidates:  'قبول / رفض المرشحين',
  canBulkEditCandidates: 'تعديل جماعي للمرشحين',
  canViewDatabase:       'عرض قاعدة البيانات',
  canDeleteFromDatabase: 'حذف من قاعدة البيانات',
  canExcludeFromDatabase:'استبعاد / استقالة من قاعدة البيانات',
  canViewAnalytics:      'عرض التقارير والإحصائيات',
  canExportReports:      'تصدير التقارير',
  canBulkUpload:         'رفع ملفات Excel / JSON',
  canExportData:         'تصدير البيانات',
  canManageUsers:        'إدارة المستخدمين',
  canAccessSettings:     'الوصول للإعدادات',
  canViewSecurity:       'مراقبة الأمان',
}

// ── تجميع الصلاحيات في مجموعات ───────────────────────────
export const PERMISSION_GROUPS: { label: string; keys: (keyof UserPermissions)[] }[] = [
  {
    label: 'المرشحون',
    keys: ['canViewCandidates','canAddCandidates','canEditCandidates','canDeleteCandidates','canApproveCandidates','canBulkEditCandidates'],
  },
  {
    label: 'قاعدة البيانات',
    keys: ['canViewDatabase','canDeleteFromDatabase','canExcludeFromDatabase'],
  },
  {
    label: 'التقارير والبيانات',
    keys: ['canViewAnalytics','canExportReports','canBulkUpload','canExportData'],
  },
  {
    label: 'الإدارة',
    keys: ['canManageUsers','canAccessSettings','canViewSecurity'],
  },
]
