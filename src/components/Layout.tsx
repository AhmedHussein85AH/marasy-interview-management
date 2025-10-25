import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const { currentUser, logout } = useStore()

  const navItems = [
    { path: '/dashboard', label: 'لوحة التحكم', icon: '📊', permissions: ['security_employee', 'interview_manager', 'admin'] },
    { path: '/candidates', label: 'المرشحين', icon: '👥', permissions: ['security_employee', 'interview_manager', 'admin'] },
    { path: '/interviews', label: 'المقابلات', icon: '📅', permissions: ['interview_manager', 'admin'] },
    { path: '/analytics', label: 'التقارير', icon: '📈', permissions: ['security_employee', 'interview_manager', 'admin'] },
    { path: '/database', label: 'قاعدة البيانات', icon: '🗄️', permissions: ['interview_manager', 'admin'] },
    { path: '/bulk-upload', label: 'رفع ملفات Excel', icon: '📤', permissions: ['security_employee', 'admin'] },
    { path: '/users', label: 'إدارة المستخدمين', icon: '👤', permissions: ['admin'] },
    { path: '/settings', label: 'الإعدادات', icon: '⚙️', permissions: ['admin'] }
  ]

  const filteredNavItems = navItems.filter(item => 
    currentUser && item.permissions.includes(currentUser.userType)
  )

  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout()
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* الشريط الجانبي */}
      <div style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px 0',
        minHeight: '100vh',
        overflowY: 'auto',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            نظام إدارة المقابلات
          </h2>
          {currentUser && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#bdc3c7' }}>
              {currentUser.name.split(' - ')[0]}
            </div>
          )}
        </div>

        <nav>
          {filteredNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px 20px',
                color: 'white',
                textDecoration: 'none',
                backgroundColor: location.pathname === item.path ? '#3498db' : 'transparent',
                transition: 'background-color 0.3s ease'
              }}
            >
              <span style={{ marginLeft: '10px', fontSize: '18px' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* زر تسجيل الخروج */}
        <div style={{ padding: '10px 20px 20px 20px', marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div style={{
        flex: 1,
        backgroundColor: '#f0f2f5',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ flex: 1, padding: '20px' }}>
          {children}
        </div>
        
        {/* Footer مع حقوق الطبع والنشر */}
        <footer style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '15px 20px',
          textAlign: 'center',
          fontSize: '12px',
          borderTop: '1px solid #34495e'
        }}>
          <div style={{ marginBottom: '5px', whiteSpace: 'nowrap' }}>
            © 2024 Ahmed Hussein - Security Coordinator. All rights reserved.
          </div>
          <div style={{ color: '#bdc3c7', fontSize: '11px' }}>
            نظام إدارة المقابلات مراسي | Marassi Interview Management System
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout