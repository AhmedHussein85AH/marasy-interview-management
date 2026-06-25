import React from 'react'
import { useStore } from '../store/useStore'

interface ProtectedLayoutProps {
  children: React.ReactNode
  requiredPermissions?: string[]
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ 
  children, 
  requiredPermissions = [] 
}) => {
  const { currentUser } = useStore()

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

  // التحقق من الصلاحيات
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.includes(currentUser.userType)
    if (!hasPermission) {
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
            <p style={{ color: '#95a5a6', fontSize: '14px', marginTop: '10px' }}>
              نوع المستخدم الحالي: {currentUser.userType}
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ProtectedLayout
