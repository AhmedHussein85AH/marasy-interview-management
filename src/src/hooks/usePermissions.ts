import { useStore } from '../store/useStore'
import { DEFAULT_PERMISSIONS, UserPermissions } from '../types/permissions'

export const usePermissions = (): UserPermissions => {
  const { currentUser } = useStore()

  if (!currentUser) {
    // كل الصلاحيات مغلقة لو مفيش يوزر
    return Object.fromEntries(
      Object.keys(DEFAULT_PERMISSIONS.security_employee).map(k => [k, false])
    ) as UserPermissions
  }

  // لو عنده custom permissions استخدمها، غير كده استخدم الـ defaults
  if (currentUser.permissions) {
    return currentUser.permissions
  }

  return DEFAULT_PERMISSIONS[currentUser.userType] ?? DEFAULT_PERMISSIONS.security_employee
}
