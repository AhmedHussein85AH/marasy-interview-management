-- =============================================
-- إدارة حالة المستخدمين - نظام مراسي
-- =============================================

-- تفعيل مستخدم
UPDATE users SET is_active = TRUE WHERE email = 'user@company.com';

-- تعطيل مستخدم
UPDATE users SET is_active = FALSE WHERE email = 'user@company.com';

-- عرض كل المستخدمين وحالتهم
SELECT id, name, email, user_type, department, is_active, created_at
FROM users
ORDER BY created_at DESC;

-- عرض المستخدمين المعطلين
SELECT name, email, user_type FROM users WHERE is_active = FALSE;

-- تغيير دور مستخدم
UPDATE users SET user_type = 'interview_manager' WHERE email = 'user@company.com';

-- إعادة تعيين الصلاحيات المخصصة (رجوع للافتراضي)
UPDATE users SET permissions = NULL WHERE email = 'user@company.com';
