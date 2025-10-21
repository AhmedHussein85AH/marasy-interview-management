import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'

const SettingsPage: React.FC = () => {
  const { currentUser, users, resetData } = useStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleResetData = () => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      resetData()
      alert('تم إعادة تعيين جميع البيانات بنجاح')
      setShowResetConfirm(false)
    }
  }

  const getSystemInfo = () => {
    return {
      version: '2.0.0',
      lastUpdate: new Date().toLocaleDateString('en-GB'),
      totalUsers: users.length,
      systemStatus: 'متصل'
    }
  }

  const systemInfo = getSystemInfo()

  return (
    <ProtectedLayout requiredPermissions={['admin']}>
      <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 60px)' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>
          إعدادات النظام
        </h1>

        {/* معلومات النظام */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            معلومات النظام
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <strong>إصدار النظام:</strong> {systemInfo.version}
            </div>
            <div>
              <strong>آخر تحديث:</strong> {systemInfo.lastUpdate}
            </div>
            <div>
              <strong>إجمالي المستخدمين:</strong> {systemInfo.totalUsers}
            </div>
            <div>
              <strong>حالة النظام:</strong> 
              <span style={{
                color: '#2ecc71',
                marginLeft: '10px',
                fontWeight: 'bold'
              }}>
                {systemInfo.systemStatus}
              </span>
            </div>
          </div>
        </div>

        {/* معلومات المستخدم الحالي */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            معلومات المستخدم الحالي
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <strong>الاسم:</strong> {currentUser?.name}
            </div>
            <div>
              <strong>البريد الإلكتروني:</strong> {currentUser?.email}
            </div>
            <div>
              <strong>القسم:</strong> {currentUser?.department}
            </div>
            <div>
              <strong>نوع المستخدم:</strong> 
              <span style={{
                color: currentUser?.userType === 'admin' ? '#e74c3c' : 
                       currentUser?.userType === 'interview_manager' ? '#f39c12' : '#3498db',
                marginLeft: '10px',
                fontWeight: 'bold'
              }}>
                {currentUser?.userType === 'admin' ? 'مدير النظام' :
                 currentUser?.userType === 'interview_manager' ? 'مسئول المقابلات' :
                 'موظف شركة الأمن'}
              </span>
            </div>
          </div>
        </div>

        {/* قائمة المستخدمين */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            قائمة المستخدمين
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {users.map(user => (
              <div key={user.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                    {user.name}
                  </div>
                  <div style={{ color: '#7f8c8d', fontSize: '14px' }}>
                    {user.email} - {user.department}
                  </div>
                </div>
                <div>
                  <span style={{
                    backgroundColor: user.userType === 'admin' ? '#e74c3c' : 
                                   user.userType === 'interview_manager' ? '#f39c12' : '#3498db',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px'
                  }}>
                    {user.userType === 'admin' ? 'مدير النظام' :
                     user.userType === 'interview_manager' ? 'مسئول المقابلات' :
                     'موظف شركة الأمن'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* إعدادات النظام */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            إعدادات النظام
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  إعادة تعيين البيانات
                </div>
                <div style={{ color: '#7f8c8d', fontSize: '14px' }}>
                  حذف جميع البيانات وإعادة تعيين النظام للحالة الأولية
                </div>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>

        {/* تأكيد إعادة التعيين */}
        {showResetConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#e74c3c', marginBottom: '20px' }}>
                تأكيد إعادة التعيين
              </h3>
              <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                هل أنت متأكد من إعادة تعيين جميع البيانات؟ 
                هذا الإجراء سيمحو جميع المرشحين والمقابلات والبيانات الأخرى.
                لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={handleResetData}
                  style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  تأكيد الحذف
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* معلومات إضافية */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            معلومات إضافية
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <strong>نظام التشغيل:</strong> Windows
            </div>
            <div>
              <strong>المتصفح:</strong> Chrome/Firefox/Safari
            </div>
            <div>
              <strong>اللغة:</strong> العربية
            </div>
            <div>
              <strong>المنطقة الزمنية:</strong> GMT+2
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

export default SettingsPage
