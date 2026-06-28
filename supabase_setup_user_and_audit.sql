CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. دالة إنشاء مستخدم جديد بشكل مباشر دون الحاجة لـ Edge Functions
CREATE OR REPLACE FUNCTION create_user_admin(
    email TEXT,
    password TEXT,
    name TEXT,
    department TEXT,
    user_type TEXT
) RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- إنشاء معرّف فريد جديد للمستخدم
  new_user_id := gen_random_uuid();
  
  -- تشفير كلمة المرور
  encrypted_pw := crypt(password, gen_salt('bf'));
  
  -- إدراج في جدول auth.users الأساسي الخاص بالمصادقة
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    email,
    encrypted_pw,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );
  
  -- إدراج في جدول public.users الخاص بالنظام
  INSERT INTO public.users (
    id,
    name,
    email,
    user_type,
    department,
    is_active
  ) VALUES (
    new_user_id,
    name,
    email,
    user_type,
    department,
    true
  );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- 2. إنشاء جدول مراقبة الأنشطة (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    action_type TEXT,
    target_type TEXT,
    target_name TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إعطاء الصلاحيات للجدول الجديد
GRANT ALL ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.audit_logs TO anon;
GRANT ALL ON TABLE public.audit_logs TO service_role;
