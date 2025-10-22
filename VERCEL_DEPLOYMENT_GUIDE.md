# دليل نشر المشروع على Vercel مع Supabase

## المشكلة الشائعة
عند نشر تطبيق React/Vite مع Supabase على Vercel، قد تواجه خطأ:
```
❌ Missing environment variables!
Uncaught Error: Missing Supabase environment variables!
```

## السبب
متغيرات البيئة من ملف `.env` لا تُحمّل تلقائياً في Vercel. يجب إضافتها يدوياً في إعدادات Vercel.

## الحل

### الخطوة 1: إضافة متغيرات البيئة في Vercel

1. **ادخل إلى Vercel Dashboard:**
   - اذهب إلى: https://vercel.com/dashboard
   - اختر مشروعك

2. **اذهب إلى إعدادات المتغيرات:**
   - Settings → Environment Variables

3. **أضف المتغيرات التالية:**

```
Name: VITE_SUPABASE_URL
Value: https://your-project.supabase.co
Environment: Production, Preview, Development

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development

Name: VITE_SECURITY_EMPLOYEE_PASSWORD
Value: Sec@135$
Environment: Production, Preview, Development

Name: VITE_INTERVIEW_MANAGER_PASSWORD
Value: Man@135$
Environment: Production, Preview, Development

Name: VITE_ADMIN_PASSWORD
Value: Adm@135$
Environment: Production, Preview, Development
```

### الخطوة 2: إعادة النشر

1. **اذهب إلى Deployments**
2. **اضغط على Redeploy للمشروع الأخير**

## ملاحظات مهمة

- **VITE_ prefix:** جميع المتغيرات يجب أن تبدأ بـ `VITE_` لتعمل في Vite
- **Environment Selection:** تأكد من تحديد Production و Preview و Development
- **Redeploy Required:** يجب إعادة النشر بعد إضافة المتغيرات
- **Security:** لا تشارك مفاتيح Supabase أو كلمات المرور

## استكشاف الأخطاء

### إذا لم تعمل المتغيرات:
1. تأكد من أن أسماء المتغيرات مطابقة تماماً
2. تأكد من إعادة النشر بعد إضافة المتغيرات
3. تحقق من Console في المتصفح للأخطاء

### إذا كان Supabase لا يعمل:
1. تأكد من صحة URL و Anon Key
2. تأكد من إنشاء الجداول في Supabase
3. تحقق من إعدادات RLS في Supabase

## ملفات مهمة في المشروع

- `.env` - متغيرات البيئة المحلية
- `env.example` - مثال على المتغيرات المطلوبة
- `supabase_schema.sql` - مخطط قاعدة البيانات
- `SUPABASE_SETUP.md` - دليل إعداد Supabase

---

**تم إنشاء هذا الدليل لحل مشكلة نشر تطبيق إدارة المقابلات على Vercel مع Supabase**
