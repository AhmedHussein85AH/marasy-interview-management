import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/Layout'
import ProtectedLayout from './components/ProtectedLayout'

// Lazy-loaded pages for fast initial bundle and optimal code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CandidatesPage = lazy(() => import('./pages/CandidatesPage'))
const InterviewsPage = lazy(() => import('./pages/InterviewsPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const DatabasePage = lazy(() => import('./pages/DatabasePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const Users = lazy(() => import('./pages/Users'))
const BulkUploadPage = lazy(() => import('./pages/BulkUploadPage'))
const SecurityPage = lazy(() => import('./pages/SecurityPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

// Elegant fallback spinner during page transitions
const PageLoadingFallback: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
    color: '#64748b'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(59, 130, 246, 0.2)',
      borderTopColor: '#2563eb',
      borderRadius: '50%',
      animation: 'appPageSpin 0.8s linear infinite'
    }} />
    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>جاري التحميل...</span>
    <style>{`
      @keyframes appPageSpin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

const App: React.FC = () => {
  const { currentUser, initializeDemoData, cleanupRealtimeSubscriptions } = useStore()

  useEffect(() => {
    // تهيئة البيانات التجريبية دائماً عند بدء التطبيق
    initializeDemoData()
    
    // تنظيف الاشتراكات عند إلغاء التثبيت
    return () => {
      cleanupRealtimeSubscriptions()
    }
  }, [initializeDemoData, cleanupRealtimeSubscriptions])

  // إذا لم يكن هناك مستخدم مسجل دخول، عرض صفحة تسجيل الدخول
  if (!currentUser) {
    return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    )
  }

  // إذا كان هناك مستخدم مسجل دخول، عرض التطبيق الرئيسي
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
                <DashboardPage />
              </ProtectedLayout>
            } />
            <Route path="/candidates" element={
              <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
                <CandidatesPage />
              </ProtectedLayout>
            } />
            <Route path="/interviews" element={
              <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
                <InterviewsPage />
              </ProtectedLayout>
            } />
            <Route path="/analytics" element={
              <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
                <AnalyticsPage />
              </ProtectedLayout>
            } />
            <Route path="/database" element={
              <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
                <DatabasePage />
              </ProtectedLayout>
            } />
            <Route path="/users" element={
              <ProtectedLayout requiredPermissionKey="canManageUsers">
                <Users />
              </ProtectedLayout>
            } />
            <Route path="/bulk-upload" element={
              <ProtectedLayout requiredPermissionKey="canBulkUpload">
                <BulkUploadPage />
              </ProtectedLayout>
            } />
            <Route path="/settings" element={
              <ProtectedLayout requiredPermissionKey="canAccessSettings">
                <SettingsPage />
              </ProtectedLayout>
            } />
            <Route path="/security" element={
              <ProtectedLayout requiredPermissionKey="canViewSecurity">
                <SecurityPage />
              </ProtectedLayout>
            } />
            <Route path="/profile" element={
              <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
                <ProfilePage />
              </ProtectedLayout>
            } />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  )
}

export default App