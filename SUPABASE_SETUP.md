# إعداد Supabase للمشروع

## 1. إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل دخول أو أنشئ حساب جديد
3. اضغط على "New Project"
4. اختر اسم للمشروع (مثل: `marasy-interview-management`)
5. اختر كلمة مرور قوية لقاعدة البيانات
6. اختر المنطقة الأقرب لك
7. اضغط على "Create new project"

## 2. الحصول على مفاتيح API

1. بعد إنشاء المشروع، اذهب إلى Settings > API
2. انسخ `Project URL` و `anon public` key
3. أضف هذه القيم إلى ملف `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. إنشاء الجداول

1. اذهب إلى SQL Editor في لوحة تحكم Supabase
2. انسخ محتوى ملف `supabase_schema.sql`
3. الصق الكود واضغط على "Run"

## 4. تفعيل المصادقة (اختياري)

إذا كنت تريد استخدام مصادقة Supabase بدلاً من النظام الحالي:

1. اذهب إلى Authentication > Settings
2. فعّل "Enable email confirmations" إذا أردت
3. أضف مجالك المسموح به في "Site URL"

## 5. إعداد Row Level Security (اختياري)

النظام الحالي يستخدم سياسات مفتوحة للتجربة. للإنتاج، يمكنك تحديث السياسات:

```sql
-- مثال: السماح للمستخدمين بقراءة بياناتهم فقط
CREATE POLICY "Users can view own data" ON candidates
FOR SELECT USING (auth.uid()::text = created_by);
```

## 6. اختبار الاتصال

1. ابدأ الخادم: `npm run dev`
2. تأكد من عدم وجود أخطاء في وحدة التحكم
3. جرب إضافة مرشح جديد
4. تحقق من قاعدة البيانات في لوحة تحكم Supabase

## 7. النشر على Vercel

1. أضف متغيرات البيئة في Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SECURITY_EMPLOYEE_PASSWORD`
   - `VITE_INTERVIEW_MANAGER_PASSWORD`
   - `VITE_ADMIN_PASSWORD`

2. نشر المشروع على Vercel

## ملاحظات مهمة

- **الأمان**: لا تشارك مفاتيح API مع أي شخص
- **النسخ الاحتياطي**: قم بعمل نسخ احتياطية منتظمة لقاعدة البيانات
- **المراقبة**: راقب استخدام قاعدة البيانات في لوحة تحكم Supabase
- **التكلفة**: Supabase مجاني حتى 500MB من قاعدة البيانات و 2GB من النطاق الترددي

## استكشاف الأخطاء

### خطأ الاتصال
- تأكد من صحة `VITE_SUPABASE_URL`
- تأكد من صحة `VITE_SUPABASE_ANON_KEY`
- تحقق من اتصال الإنترنت

### خطأ في قاعدة البيانات
- تأكد من إنشاء الجداول بنجاح
- تحقق من سياسات RLS
- راجع سجلات الأخطاء في لوحة تحكم Supabase

### خطأ في المصادقة
- تأكد من تفعيل Authentication في Supabase
- تحقق من إعدادات Domain
- راجع سياسات RLS للمصادقة
