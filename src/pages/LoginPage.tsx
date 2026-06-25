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
        try {
          const loginResult = await loginWithSupabase(email)
          if (!loginResult) {
            setError('فشل في تسجيل الدخول. يرجى التحقق من بياناتك أو التواصل مع المدير.')
          }
          return
        } catch (loginError: any) {
          // عرض رسالة الخطأ من loginWithSupabase
          setError(loginError?.message || 'فشل في تسجيل الدخول. يرجى التواصل مع المدير.')
          return
        }
      }
      
      // إذا كان هناك خطأ من Supabase، عرض رسالة واضحة
      if (error) {
        if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق من بياناتك أو التواصل مع المدير.')
        } else {
          setError(`خطأ في تسجيل الدخول: ${error.message}`)
        }
        return
      }
    } catch (err: any) {
      // في حالة وجود خطأ في الاتصال
      console.error('خطأ في الاتصال بـ Supabase:', err)
      // إذا كانت هناك رسالة خطأ محددة، استخدمها
      if (err?.message) {
        setError(err.message)
      } else {
        setError('خطأ في الاتصال. يرجى المحاولة مرة أخرى أو التواصل مع المدير.')
      }
      return
    }

    // مسار تجريبي احتياطي (معطل في الإنتاج)
    const isProduction = import.meta.env.PROD
    const allowDemoLogin = import.meta.env.VITE_ALLOW_DEMO_LOGIN === 'true'
    
    if (isProduction && !allowDemoLogin) {
      setError('تسجيل الدخول التجريبي معطل في الإنتاج. يرجى استخدام حساب Supabase أو التواصل مع المدير.')
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
        <div className="login-logo">
          <ShieldCheck size={26} color="white" />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'hsl(220 25% 14%)', margin: '0 0 6px' }}>
            نظام مراسي
          </h1>
          <p style={{ fontSize: '13px', color: 'hsl(215 16% 52%)', margin: 0 }}>
            سجّل دخولك للمتابعة
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
              style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'hsl(217 91% 48%)' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '13px', color: 'hsl(215 16% 52%)', cursor: 'pointer' }}>
              تذكرني
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '15px' }}>
            تسجيل الدخول
          </button>
        </form>

        <div style={{
          marginTop: '28px', paddingTop: '16px',
          borderTop: '1px solid hsl(214 20% 92%)',
          textAlign: 'center',
          color: 'hsl(215 16% 65%)',
          fontSize: '11px',
          lineHeight: 1.7
        }}>
          <div>© 2024 Ahmed Hussein · Security Coordinator</div>
          <div>Marassi Interview Management System</div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
