-- إنشاء جداول قاعدة البيانات لـ Supabase

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('security_employee', 'interview_manager', 'admin')),
  department TEXT NOT NULL,
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
  offer_date DATE NOT NULL,
  offer_result TEXT DEFAULT 'في انتظار' CHECK (offer_result IN ('مقبول', 'مرفوض', 'مستبعد', 'في انتظار')),
  status TEXT DEFAULT 'جديد' CHECK (status IN ('جديد', 'قيد المراجعة', 'تم التوظيف', 'مرفوض')),
  created_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_rejected_before BOOLEAN DEFAULT FALSE,
  previous_rejection_date DATE
);

-- جدول المقابلات
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  position TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT DEFAULT 'مجدولة' CHECK (status IN ('مجدولة', 'مكتملة', 'ملغاة')),
  notes TEXT,
  interviewer TEXT NOT NULL,
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
  offer_date DATE NOT NULL,
  final_result TEXT NOT NULL CHECK (final_result IN ('مقبول', 'مرفوض', 'مستبعد')),
  decision_date TIMESTAMP WITH TIME ZONE NOT NULL,
  decision_by TEXT NOT NULL,
  notes TEXT,
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
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_candidates_national_id ON candidates(national_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_offer_result ON candidates(offer_result);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_final_result ON saved_candidates(final_result);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_national_id ON saved_candidates(national_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- تمكين Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان - السماح للجميع بالقراءة والكتابة (للمشروع التجريبي)
DROP POLICY IF EXISTS "Allow all operations for demo" ON users;
DROP POLICY IF EXISTS "Allow all operations for demo" ON candidates;
DROP POLICY IF EXISTS "Allow all operations for demo" ON interviews;
DROP POLICY IF EXISTS "Allow all operations for demo" ON saved_candidates;
DROP POLICY IF EXISTS "Allow all operations for demo" ON notifications;

CREATE POLICY "Allow all operations for demo" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON candidates FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON interviews FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON saved_candidates FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON notifications FOR ALL USING (true);

-- إدراج بيانات تجريبية
INSERT INTO users (name, email, user_type, department) VALUES
('مدير الأمن - مسئول مقابلات', 'interview@company.com', 'interview_manager', 'إدارة أمن اعمار مراسي'),
('أدمن شركة الأمن - موظف', 'security@company.com', 'security_employee', 'إدارة أمن اعمار مراسي'),
('أحمد حسين - الأدمن', 'admin@company.com', 'admin', 'إدارة أمن اعمار مراسي')
ON CONFLICT (email) DO NOTHING;
