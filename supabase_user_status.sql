-- إضافة حقل is_active إلى جدول users
-- هذا التحديث آمن: جميع المستخدمين الحاليين سيصبحون نشطين تلقائياً

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- تحديث جميع المستخدمين الحاليين ليكونوا نشطين (في حالة عدم وجود القيمة)
UPDATE users 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- إضافة فهرس مركب للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);

