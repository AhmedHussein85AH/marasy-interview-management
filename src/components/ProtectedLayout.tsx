import React from 'react'
import { usePermissions } from '../hooks/usePermissions'
import { useStore } from '../store/useStore'
import { UserPermissions } from '../types/permissions'

interface ProtectedLayoutProps {
  children: React.ReactNode
  // يمكن تمرير أسماء صلاحيات كـ string[] OR أدوار قديمة كـ fallback
  requiredPermissions?: string[]
  // مفتاح صلاحية واحد (الموصى به)
  requiredPermissionKey?: keyof UserPermissions
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ 
  children, 
  requiredPermissions = [],
  requiredPermissionKey,
}) => {
  const { currentUser } = useStore()
  const permissions = usePermissions()

  // إذا لم يكن هناك مستخدم مسجل دخول
  if (!currentUser) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>
            غير مصرح لك بالوصول
          </h2>
          <p style={{ color: '#7f8c8d' }}>
            يرجى تسجيل الدخول أولاً
          </p>
        </div>
      </div>
    )
  }

  // ── 1. التحقق بمفتاح صلاحية محدد (الطريقة الجديدة) ──
  if (requiredPermissionKey && !permissions[requiredPermissionKey]) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>
            غير مصرح لك بهذا الإجراء
          </h2>
          <p style={{ color: '#7f8c8d' }}>
            لا تملك الصلاحيات المطلوبة للوصول إلى هذه الصفحة
          </p>
        </div>
      </div>
    )
  }

  // ── 2. Fallback: التحقق بالأدوار القديمة (للتوافقية مع الكود الحالي) ──
  if (requiredPermissions.length > 0 && !requiredPermissionKey) {
    const hasRole = requiredPermissions.includes(currentUser.userType)
    if (!hasRole) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>
              غير مصرح لك بهذا الإجراء
            </h2>
            <p style={{ color: '#7f8c8d' }}>
              لا تملك الصلاحيات المطلوبة للوصول إلى هذه الصفحة
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ProtectedLayout
