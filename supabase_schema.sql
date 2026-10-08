-- ==============================================================================
-- Marassi - Internal Security Management System (نظام إدارة الأمن الداخلي)
-- Supabase Schema - Complete & Production Ready
-- قم بنسخ هذا الكود بالكامل وتشغيله في Supabase SQL Editor
-- ==============================================================================

-- 1. تفعيل الامتدادات الضرورية
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. جدول المستخدمين (users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('security_employee', 'interview_manager', 'admin')),
  department TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. جدول المرشحين (candidates)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  national_id TEXT UNIQUE NOT NULL,
  birth_date DATE NOT NULL,
  governorate TEXT NOT NULL,
  qualification TEXT NOT NULL,
  marital_status TEXT NOT NULL CHECK (marital_status IN ('أعزب', 'متزوج', 'مطلق', 'أرمل')),
  security_company TEXT NOT NULL,
  position TEXT,
  phone TEXT,
  offer_date DATE,
  offer_result TEXT DEFAULT 'في انتظار' CHECK (offer_result IN ('مقبول', 'مرفوض', 'مستبعد', 'في انتظار')),
  status TEXT DEFAULT 'جديد' CHECK (status IN ('جديد', 'قيد المراجعة', 'تم التوظيف', 'مرفوض')),
  created_by TEXT NOT NULL,
  notes TEXT,
  work_shift TEXT CHECK (work_shift IN ('نهار', 'ليل')),
  is_rejected_before BOOLEAN DEFAULT FALSE,
  previous_rejection_date DATE,
  photo_base64 TEXT,
  cv_base64 TEXT,
  cv_file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 4. جدول المرشحين المحفوظين / قاعدة البيانات المستدامة (saved_candidates)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  national_id TEXT NOT NULL,
  birth_date DATE NOT NULL,
  governorate TEXT NOT NULL,
  qualification TEXT NOT NULL,
  marital_status TEXT NOT NULL CHECK (marital_status IN ('أعزب', 'متزوج', 'مطلق', 'أرمل')),
  security_company TEXT NOT NULL,
  position TEXT,
  phone TEXT,
  offer_date DATE,
  final_result TEXT NOT NULL CHECK (final_result IN ('مقبول', 'مرفوض', 'مستبعد', 'استقالة')),
  decision_date TIMESTAMP WITH TIME ZONE NOT NULL,
  decision_by TEXT NOT NULL,
  notes TEXT,
  work_shift TEXT CHECK (work_shift IN ('نهار', 'ليل')),
  exclusion_reason TEXT,
  resignation_reason TEXT,
  is_rejected_before BOOLEAN DEFAULT FALSE,
  previous_rejection_date DATE,
  photo_base64 TEXT,
  cv_base64 TEXT,
  cv_file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 5. جدول المقابلات الشخصية (interviews)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id TEXT,
  candidate_name TEXT NOT NULL,
  position TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT DEFAULT 'مجدولة' CHECK (status IN ('مجدولة', 'مكتملة', 'ملغاة')),
  notes TEXT,
  interviewer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 6. جدول الإشعارات (notifications)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('rejected_before', 'new_candidate', 'decision_made')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  candidate_id TEXT,
  candidate_name TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 7. جدول سجلات تسجيل الدخول والأمان (login_logs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  latitude FLOAT,
  longitude FLOAT,
  is_active BOOLEAN DEFAULT TRUE,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 8. الفهارس لتحسين سرعة الاستعلام والبحث (Indexes)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_candidates_national_id ON public.candidates(national_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_offer_result ON public.candidates(offer_result);
CREATE INDEX IF NOT EXISTS idx_candidates_security_company ON public.candidates(security_company);

CREATE INDEX IF NOT EXISTS idx_saved_candidates_national_id ON public.saved_candidates(national_id);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_final_result ON public.saved_candidates(final_result);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_security_company ON public.saved_candidates(security_company);

CREATE INDEX IF NOT EXISTS idx_interviews_date ON public.interviews(date);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON public.interviews(status);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_email ON public.login_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_login_logs_is_active ON public.login_logs(is_active);
CREATE INDEX IF NOT EXISTS idx_login_logs_session_id ON public.login_logs(session_id);

-- ==============================================================================
-- 9. أمان الصفوف (Row Level Security - RLS)
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول الشامل (تسمح بالعمل المباشر للتطبيق)
DROP POLICY IF EXISTS "Allow all users access" ON public.users;
CREATE POLICY "Allow all users access" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all candidates access" ON public.candidates;
CREATE POLICY "Allow all candidates access" ON public.candidates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all saved_candidates access" ON public.saved_candidates;
CREATE POLICY "Allow all saved_candidates access" ON public.saved_candidates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all interviews access" ON public.interviews;
CREATE POLICY "Allow all interviews access" ON public.interviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all notifications access" ON public.notifications;
CREATE POLICY "Allow all notifications access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all login_logs access" ON public.login_logs;
CREATE POLICY "Allow all login_logs access" ON public.login_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 10. تفعيل التزامن الفوري (Supabase Realtime)
-- ==============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_candidates;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.interviews;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.login_logs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ==============================================================================
-- 11. بيانات المستخدمين التجريبية / الافتراضية الأولية
-- ==============================================================================
INSERT INTO public.users (name, email, user_type, department, is_active) VALUES
('أحمد حسين - الأدمن',          'admin@company.com',     'admin',             'إدارة الأمن الداخلي', true),
('مدير الأمن - مسئول مقابلات', 'interview@company.com', 'interview_manager', 'إدارة الأمن الداخلي', true),
('أدمن شركة الأمن - موظف',     'security@company.com',  'security_employee', 'إدارة الأمن الداخلي', true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  user_type = EXCLUDED.user_type,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active;
