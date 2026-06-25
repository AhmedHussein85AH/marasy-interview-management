# دليل النشر على Vercel - نظام مراسي

## المتطلبات
- حساب [Vercel](https://vercel.com)
- مشروع Supabase جاهز
- الكود على GitHub/GitLab

## خطوات النشر

### 1. ربط المشروع بـ Vercel
```bash
# أو من خلال vercel.com/new
vercel
```

### 2. إعداد متغيرات البيئة في Vercel
في **Project Settings → Environment Variables** أضف:

```
VITE_SUPABASE_URL        = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY   = eyJhbGc...
VITE_ALLOW_DEMO_LOGIN    = false
```

### 3. إعدادات البناء
ملف `vercel.json` موجود بالفعل في المشروع:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### 4. النشر
```bash
git add .
git commit -m "your message"
git push
```
Vercel يـ deploy تلقائياً عند كل push.

---

## تحديث المشروع

```bash
git add .
git commit -m "feat: description of changes"
git push origin main
```

---

## مشاكل شائعة

**صفحة بيضاء بعد النشر:**
- تأكد من وجود `vercel.json` مع الـ rewrites
- تأكد من صحة متغيرات البيئة

**خطأ في تسجيل الدخول:**
- تأكد من `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`
- تأكد إن المستخدم موجود في Supabase Auth
