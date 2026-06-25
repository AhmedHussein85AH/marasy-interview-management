# دليل جداول Supabase - نظام مراسي

## الخطوات

1. افتح [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك → **SQL Editor**
3. انسخ الكود والصقه واضغط **Run**

---

## إنشاء كل الجداول (مشروع جديد)

انسخ محتوى ملف `supabase_schema.sql` كامل وشغّله.

---

## تحديثات على جداول موجودة

```sql
-- إضافة عمود رقم الموبايل
ALTER TABLE candidates      ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE saved_candidates ADD COLUMN IF NOT EXISTS phone TEXT;

-- إضافة عمود الصلاحيات المخصصة للمستخدمين
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB;

-- إضافة عمود الوردية
ALTER TABLE candidates       ADD COLUMN IF NOT EXISTS work_shift TEXT;
ALTER TABLE saved_candidates ADD COLUMN IF NOT EXISTS work_shift TEXT;

-- إضافة أسباب الاستبعاد والاستقالة
ALTER TABLE saved_candidates ADD COLUMN IF NOT EXISTS exclusion_reason TEXT;
ALTER TABLE saved_candidates ADD COLUMN IF NOT EXISTS resignation_reason TEXT;

-- تحديث final_result ليقبل استقالة
ALTER TABLE saved_candidates DROP CONSTRAINT IF EXISTS saved_candidates_final_result_check;
ALTER TABLE saved_candidates ADD CONSTRAINT saved_candidates_final_result_check
  CHECK (final_result IN ('مقبول', 'مرفوض', 'مستبعد', 'استقالة'));

-- جعل offer_date اختياري
ALTER TABLE candidates ALTER COLUMN offer_date DROP NOT NULL;
```

---

## حذف كل البيانات (تنظيف)

```sql
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE saved_candidates CASCADE;
TRUNCATE TABLE candidates CASCADE;
TRUNCATE TABLE login_logs CASCADE;
```

---

## ملاحظات

- بعد أي تعديل على الجداول، ارفع الصفحة في التطبيق
- الـ RLS لازم يكون مفعّل وعنده policy
- الـ `permissions` column من نوع JSONB لتخزين الصلاحيات المخصصة
