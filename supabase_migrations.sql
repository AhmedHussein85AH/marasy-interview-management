-- تحديثات قاعدة البيانات لإضافة حقول الوظيفة والملاحظات
-- يجب تنفيذ هذه الأوامر على Supabase

-- إضافة proves الوظيفة إلى جدول المرشحين إذا لم تكن موجودة
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS position TEXT;

-- إضافة حقل الملاحظات إلى جدول المرشحين إذا لم تكن موجودة
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- إضافة حقل الوظيفة إلى جدول المرشحين المحفوظين إذا لم تكن موجودة
ALTER TABLE saved_candidates 
ADD COLUMN IF NOT EXISTS position TEXT;

-- إضافة حقل الوردية (نظام العمل) إلى جدول المرشحين المحفوظين
ALTER TABLE saved_candidates 
ADD COLUMN IF NOT EXISTS work_shift TEXT CHECK (work_shift IN ('نهار', 'ليل'));

-- الملاحظات موجودة بالفعل في جدول saved_candidates
-- لذلك لا نحتاج لإضافتها
