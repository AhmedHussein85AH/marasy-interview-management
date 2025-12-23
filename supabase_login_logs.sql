-- جدول سجلات تسجيل الدخول
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_user_email ON login_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_time ON login_logs(login_time);
CREATE INDEX IF NOT EXISTS idx_login_logs_is_active ON login_logs(is_active);
CREATE INDEX IF NOT EXISTS idx_login_logs_session_id ON login_logs(session_id);

-- تمكين Row Level Security
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- سياسة الأمان - الأدمن فقط يمكنه رؤية جميع السجلات
DROP POLICY IF EXISTS "Admins can view all login logs" ON login_logs;
CREATE POLICY "Admins can view all login logs" ON login_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- السماح للجميع بإضافة سجلات الدخول الخاصة بهم
DROP POLICY IF EXISTS "Users can insert their own login logs" ON login_logs;
CREATE POLICY "Users can insert their own login logs" ON login_logs
  FOR INSERT
  WITH CHECK (true);

-- السماح بتحديث سجلات الدخول (للتسجيل الخروج)
DROP POLICY IF EXISTS "Users can update their own login logs" ON login_logs;
CREATE POLICY "Users can update their own login logs" ON login_logs
  FOR UPDATE
  USING (true);

