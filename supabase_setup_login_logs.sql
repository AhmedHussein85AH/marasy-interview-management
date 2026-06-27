-- إنشاء جدول سجلات الدخول
CREATE TABLE IF NOT EXISTS public.login_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    user_email TEXT,
    user_name TEXT,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    country TEXT,
    city TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT true,
    session_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إعطاء الصلاحيات للجدول لتتمكن الواجهة من القراءة والكتابة
GRANT ALL ON TABLE public.login_logs TO authenticated;
GRANT ALL ON TABLE public.login_logs TO anon;
GRANT ALL ON TABLE public.login_logs TO service_role;
