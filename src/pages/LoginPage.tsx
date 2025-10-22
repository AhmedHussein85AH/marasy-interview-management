import React, { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../integrations/supabase/client'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login, users, initializeDemoData, loginWithSupabase } = useStore()

  useEffect(() => {
    // التأكد من تهيئة البيانات عند تحميل الصفحة
    if (users.length === 0) {
      initializeDemoData()
    }

    // تحميل البيانات المحفوظة عند تحميل الصفحة
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true'
    
    if (savedRememberMe && savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [users.length, initializeDemoData])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // حفظ البيانات إذا تم اختيار "تذكرني"
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email)
      localStorage.setItem('rememberedPassword', password)
      localStorage.setItem('rememberMe', 'true')
    } else {
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberedPassword')
      localStorage.removeItem('rememberMe')
    }

    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    // أولاً: محاولة تسجيل الدخول عبر Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data.session) {
        await loginWithSupabase(email)
        return
      }
      // فشل Supabase → نرجع للوضع التجريبي الحالي
    } catch (err) {
      // نتجاهل ونستخدم المسار التجريبي
    }

    // مسار تجريبي احتياطي (معطل في الإنتاج)
    const isProduction = import.meta.env.PROD
    const allowDemoLogin = import.meta.env.VITE_ALLOW_DEMO_LOGIN === 'true'
    
    if (isProduction && !allowDemoLogin) {
      setError('تسجيل الدخول التجريبي معطل في الإنتاج')
      return
    }
    const passwords: { [key: string]: string } = {
      'security@company.com': 'Sec@135$',
      'interview@company.com': 'Man@135$',
      'admin@company.com': 'Adm@135$'
    }
    const expectedPassword = passwords[email]
    if (expectedPassword === password) {
      const user = users.find(u => u.email === email)
      if (user) {
        const success = await login(email, password)
        if (!success) setError('فشل في تسجيل الدخول - حاول مرة أخرى')
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

          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                paddingRight: '50px',
                border: '2px solid #e1e8ed',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#7f8c8d',
                fontSize: '18px'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
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

          {/* خاصية تذكرني */}
          <div style={{ 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-start' 
          }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                marginRight: '10px',
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <label 
              htmlFor="rememberMe" 
              style={{
                color: '#7f8c8d',
                fontSize: '14px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              تذكرني
            </label>
          </div>

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
