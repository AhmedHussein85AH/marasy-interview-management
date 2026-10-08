-- =============================================
-- Supabase Migrations - نظام إدارة الأمن الداخلي (Marassi)
-- تشغيل هذه الـ migrations على قاعدة بيانات موجودة
-- =============================================

-- Migration 1: إضافة is_active للمستخدمين
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Migration 2: إضافة الصلاحيات المخصصة
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB;

-- Migration 3: إضافة رقم الموبايل
ALTER TABLE candidates      ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE saved_candidates ADD COLUMN IF NOT EXISTS phone TEXT;

-- Migration 4: إضافة الوردية
ALTER TABLE candidates       ADD COLUMN IF NOT EXISTS work_shift TEXT CHECK (work_shift IN ('نهار', 'ليل'));
ALTER TABLE saved_candidates ADD COLUMN IF NOT EXISTS work_shift TEXT CHECK (work_shift IN ('نهار', 'ليل'));

-- Migration 5: إضافة أسباب الاستبعاد والاستقالة
ALTER TABLE saved_candidates ADD COLUMN IF NOT EXISTS exclusion_reason TEXT;
ALTER TABLE saved_candidates ADD COLUMN IF NOT EXISTS resignation_reason TEXT;

-- Migration 6: تحديث final_result ليقبل استقالة
ALTER TABLE saved_candidates DROP CONSTRAINT IF EXISTS saved_candidates_final_result_check;
ALTER TABLE saved_candidates ADD CONSTRAINT saved_candidates_final_result_check
  CHECK (final_result IN ('مقبول', 'مرفوض', 'مستبعد', 'استقالة'));

-- Migration 7: جعل offer_date اختياري
ALTER TABLE candidates ALTER COLUMN offer_date DROP NOT NULL;

-- Migration 8: إضافة notes و is_rejected_before لـ candidates
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS is_rejected_before BOOLEAN DEFAULT FALSE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS previous_rejection_date DATE;
