-- =============================================
-- Marasy Interview Management System
-- Supabase Schema - Latest Version
-- =============================================

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('security_employee', 'interview_manager', 'admin')),
  department TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المرشحين
CREATE TABLE IF NOT EXISTS candidates (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المرشحين المحفوظين (القرارات النهائية)
CREATE TABLE IF NOT EXISTS saved_candidates (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('rejected_before', 'new_candidate', 'decision_made')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  candidate_id UUID,
  candidate_name TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجلات تسجيل الدخول
CREATE TABLE IF NOT EXISTS login_logs (
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

-- =============================================
-- الفهارس
-- =============================================
CREATE INDEX IF NOT EXISTS idx_candidates_national_id ON candidates(national_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_offer_result ON candidates(offer_result);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_national_id ON saved_candidates(national_id);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_final_result ON saved_candidates(final_result);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_login_logs_user_email ON login_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_login_logs_is_active ON login_logs(is_active);

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON users FOR ALL USING (true);
CREATE POLICY "Allow all" ON candidates FOR ALL USING (true);
CREATE POLICY "Allow all" ON saved_candidates FOR ALL USING (true);
CREATE POLICY "Allow all" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all" ON login_logs FOR ALL USING (true);

-- =============================================
-- المستخدمون الأساسيون
-- =============================================
INSERT INTO users (name, email, user_type, department, is_active) VALUES
('أحمد حسين - الأدمن',          'admin@company.com',     'admin',             'إدارة أمن اعمار مراسي', true),
('مدير الأمن - مسئول مقابلات', 'interview@company.com', 'interview_manager', 'إدارة أمن اعمار مراسي', true),
('أدمن شركة الأمن - موظف',     'security@company.com',  'security_employee', 'إدارة أمن اعمار مراسي', true)
ON CONFLICT (email) DO NOTHING;
