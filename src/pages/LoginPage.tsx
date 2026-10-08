import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
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
    // تحميل البريد المحفوظ بأمان عند تحميل الصفحة
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true'
    
    // تنظيف أي كلمات سر كانت مخزنة سابقاً لأسباب أمنية
    localStorage.removeItem('rememberedPassword')

    if (savedRememberMe && savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [users.length, initializeDemoData])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // حفظ البريد بأمان فقط إذا تم اختيار "تذكرني"
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email)
      localStorage.setItem('rememberMe', 'true')
    } else {
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberMe')
    }
    localStorage.removeItem('rememberedPassword')

    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    // أولاً: محاولة تسجيل الدخول عبر Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data.session) {
        try {
          const loginResult = await loginWithSupabase(email)
          if (loginResult) return
        } catch (loginError: any) {
          console.warn('Supabase users table not ready, attempting fallback:', loginError?.message)
        }
      }
    } catch (err: any) {
      console.warn('Supabase Auth error, attempting fallback:', err?.message)
    }

    // إذا فشل Supabase (مثلاً الجداول غير منشأة بعد)، نستخدم تسجيل الدخول المحلي بالبيانات التجريبية
    const passwords: { [key: string]: string } = {
      'admin@company.com': 'Adm@135$',
      'interview@company.com': 'Man@135$',
      'security@company.com': 'Sec@135$'
    }

    const expectedPassword = passwords[email]
    if (expectedPassword && expectedPassword === password) {
      const success = await login(email, password)
      if (success) return
    }
    if (expectedPassword === password) {
      const user = users.find(u => u.email === email)
      if (user) {
        // التحقق من حالة الحساب قبل محاولة تسجيل الدخول
        if (user.isActive === false) {
          setError('الحساب معطل. يرجى التواصل مع المدير لإعادة تفعيل الحساب.')
          return
        }
        const success = await login(email, password)
        if (!success) {
          // التحقق مرة أخرى من حالة الحساب بعد محاولة تسجيل الدخول
          const updatedUser = users.find(u => u.email === email)
          if (updatedUser?.isActive === false) {
            setError('الحساب معطل. يرجى التواصل مع المدير لإعادة تفعيل الحساب.')
          } else {
            setError('فشل في تسجيل الدخول - حاول مرة أخرى')
          }
        }
      } else {
        setError('المستخدم غير موجود - اضغط "إعادة تهيئة البيانات"')
      }
    } else {
      setError('كلمة المرور غير صحيحة')
    }
  }


  return (
    <div className="login-page">
      <div className="login-card fade-in-up" style={{ direction: 'rtl' }}>
        {/* Logo */}
        <div className="login-logo" style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, hsl(262 72% 45%), hsl(280 70% 55%))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px -4px rgba(108, 63, 197, 0.4)'
        }}>
          <span style={{ color: '#fff', fontSize: '24px', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>V</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'hsl(260 25% 12%)', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Marassi
          </h1>
          <p style={{ fontSize: '13px', color: 'hsl(260 15% 50%)', margin: 0 }}>
            نظام إدارة وتدقيق المقابلات الشخصية — سجّل دخولك للمتابعة
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="example@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'hsl(215 16% 52%)', display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'hsl(4 86% 95%)',
              border: '1px solid hsl(4 86% 85%)',
              color: 'hsl(4 86% 45%)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'hsl(262 72% 45%)' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '13px', color: 'hsl(215 16% 52%)', cursor: 'pointer' }}>
              تذكرني
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{
            width: '100%',
            justifyContent: 'center',
            padding: '12px',
            fontSize: '15px',
            background: 'linear-gradient(135deg, hsl(262 72% 45%), hsl(280 70% 55%))',
            border: 'none',
            boxShadow: '0 4px 14px rgba(108, 63, 197, 0.35)'
          }}>
            تسجيل الدخول
          </button>
        </form>

        <div style={{
          marginTop: '28px', paddingTop: '16px',
          borderTop: '1px solid hsl(250 15% 90%)',
          textAlign: 'center',
          color: 'hsl(260 15% 55%)',
          fontSize: '11px',
          lineHeight: 1.7
        }}>
          <div>© 2026 Ahmed Hussein · Security & Intelligence Operations</div>
          <div>Marassi — Intelligent Interview Management System</div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
