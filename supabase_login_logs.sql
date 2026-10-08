-- =============================================
-- سجلات تسجيل الدخول - نظام إدارة الأمن الداخلي (Marassi)
-- =============================================

-- عرض آخر 50 تسجيل دخول
SELECT user_name, user_email, login_time, logout_time,
       ip_address, browser, os, country, city, is_active
FROM login_logs
ORDER BY login_time DESC
LIMIT 50;

-- عرض الجلسات النشطة حالياً
SELECT user_name, user_email, login_time, ip_address, browser
FROM login_logs
WHERE is_active = TRUE
ORDER BY login_time DESC;

-- عرض إحصائيات تسجيل الدخول
SELECT user_email, COUNT(*) as login_count,
       MAX(login_time) as last_login
FROM login_logs
GROUP BY user_email
ORDER BY login_count DESC;

-- حذف السجلات القديمة (أكثر من 90 يوم)
DELETE FROM login_logs
WHERE login_time < NOW() - INTERVAL '90 days';

-- إنهاء جلسة معينة
UPDATE login_logs
SET is_active = FALSE, logout_time = NOW()
WHERE session_id = 'session_id_here';
