# إعداد Supabase - نظام مراسي

## الخطوات الأساسية

### 1. إنشاء المشروع
- اذهب إلى [supabase.com](https://supabase.com)
- أنشئ مشروع جديد
- احفظ الـ `Project URL` و `anon key`

### 2. إنشاء الجداول
- افتح **SQL Editor**
- شغّل محتوى `supabase_schema.sql`

### 3. إعداد متغيرات البيئة
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. إضافة المستخدمين في Supabase Auth
لكل مستخدم في جدول `users`:
- اذهب إلى **Authentication → Users**
- أضف مستخدم بنفس البريد الإلكتروني
- حدد كلمة مرور

### 5. التحقق
شغّل التطبيق وجرب تسجيل الدخول بـ:
- `admin@company.com`
- `interview@company.com`  
- `security@company.com`

---

## الجداول المطلوبة

| الجدول | الوصف |
|--------|-------|
| `users` | المستخدمون وصلاحياتهم |
| `candidates` | المرشحون الحاليون |
| `saved_candidates` | القرارات النهائية المحفوظة |
| `notifications` | الإشعارات |
| `login_logs` | سجلات تسجيل الدخول |

---

## مشاكل شائعة

**المستخدم لا يستطيع تسجيل الدخول:**
- تأكد إنه موجود في Supabase Auth
- تأكد إن `is_active = true` في جدول `users`

**البيانات لا تظهر:**
- تأكد من وجود RLS policies
- تأكد من صحة الـ API keys في `.env`
