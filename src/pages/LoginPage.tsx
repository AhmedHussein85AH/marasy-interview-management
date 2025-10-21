import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, users, initializeDemoData } = useStore()

  useEffect(() => {
    // التأكد من تهيئة البيانات عند تحميل الصفحة
    if (users.length === 0) {
      initializeDemoData()
    }
  }, [users.length, initializeDemoData])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    console.log('🔍 محاولة تسجيل الدخول من الصفحة...')
    console.log('📧 البريد الإلكتروني:', email)
    console.log('🔑 كلمة المرور:', password)
    console.log('👥 المستخدمون المتاحون:', users.map(u => u.email))

    // التحقق المباشر من كلمات المرور
    const passwords: { [key: string]: string } = {
      'security@company.com': 'Sec@135$',
      'interview@company.com': 'Man@135$',
      'admin@company.com': 'Adm@135$'
    }

    const expectedPassword = passwords[email]
    console.log('🔐 كلمة المرور المتوقعة:', expectedPassword)
    console.log('✅ تطابق كلمة المرور:', expectedPassword === password)

    if (expectedPassword === password) {
      // البحث عن المستخدم في القائمة
      const user = users.find(u => u.email === email)
      console.log('👤 المستخدم الموجود:', user)
      
      if (user) {
        // تسجيل الدخول مباشرة
        console.log('🚀 بدء تسجيل الدخول...')
        const success = await login(email, password)
        console.log('🎉 نتيجة تسجيل الدخول:', success)
        if (!success) {
          setError('فشل في تسجيل الدخول - حاول مرة أخرى')
        }
      } else {
        setError('المستخدم غير موجود - اضغط "إعادة تهيئة البيانات"')
      }
    } else {
      setError('كلمة المرور غير صحيحة')
    }
  }


  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#2c3e50',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          نظام إدارة المقابلات
        </h1>

        <form onSubmit={handleLogin} style={{ marginBottom: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e1e8ed',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e1e8ed',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>

          {error && (
            <div style={{
              color: '#e74c3c',
              marginBottom: '20px',
              fontSize: '14px',
              backgroundColor: '#ffeaea',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #e74c3c'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
          >
            تسجيل الدخول
          </button>
        </form>



        {/* حقوق الطبع والنشر */}
        <div style={{
          marginTop: '15px',
          paddingTop: '10px',
          borderTop: '1px solid #ecf0f1',
          color: '#7f8c8d',
          fontSize: '11px'
        }}>
          <p style={{ margin: '5px 0', whiteSpace: 'nowrap' }}>
            © 2024 Ahmed Hussein - Security Coordinator. All rights reserved.
          </p>
          <p style={{ margin: '5px 0' }}>
            نظام إدارة المقابلات مراسي | Marassi Interview Management System
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
