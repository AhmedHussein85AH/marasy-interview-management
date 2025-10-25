import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import ProtectedLayout from './components/ProtectedLayout'
import DashboardPage from './pages/DashboardPage'
import CandidatesPage from './pages/CandidatesPage'
import InterviewsPage from './pages/InterviewsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import DatabasePage from './pages/DatabasePage'
import SettingsPage from './pages/SettingsPage'
import Users from './pages/Users'
import BulkUploadPage from './pages/BulkUploadPage'

const App: React.FC = () => {
  const { currentUser, initializeDemoData, isInitialized } = useStore()

  useEffect(() => {
    // تهيئة البيانات التجريبية دائماً عند بدء التطبيق
    initializeDemoData()
  }, [initializeDemoData])

  // إذا لم يكن هناك مستخدم مسجل دخول، عرض صفحة تسجيل الدخول
  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    )
  }

  // إذا كان هناك مستخدم مسجل دخول، عرض التطبيق الرئيسي
  return (
    <Router>
      <Layout>
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
            <ProtectedLayout requiredPermissions={['interview_manager', 'admin']}>
              <InterviewsPage />
            </ProtectedLayout>
          } />
          <Route path="/analytics" element={
            <ProtectedLayout requiredPermissions={['security_employee', 'interview_manager', 'admin']}>
              <AnalyticsPage />
            </ProtectedLayout>
          } />
          <Route path="/database" element={
            <ProtectedLayout requiredPermissions={['interview_manager', 'admin']}>
              <DatabasePage />
            </ProtectedLayout>
          } />
          <Route path="/users" element={
            <ProtectedLayout requiredPermissions={['admin']}>
              <Users />
            </ProtectedLayout>
          } />
          <Route path="/bulk-upload" element={
            <ProtectedLayout requiredPermissions={['security_employee', 'admin']}>
              <BulkUploadPage />
            </ProtectedLayout>
          } />
          <Route path="/settings" element={
            <ProtectedLayout requiredPermissions={['admin']}>
              <SettingsPage />
            </ProtectedLayout>
          } />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App