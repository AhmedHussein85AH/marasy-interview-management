# خطة تحسين الأداء وتقليل استهلاك Supabase

## المرحلة 1: إصلاح الخلل المباشر (تأثير فوري)

### 1.1 إصلاح تكرار UI في `SecurityPage.tsx`
- **المشكلة**: الصفحة فيها كود JSX مكرر بالكامل مرتين (سطور 67-432 و 436-650)
- **الحل**: حذف النسخة الأولى (inline styles) والاحتفاظ بالثانية (CSS classes)
- **التأثير**: تقليل حجم الصفحة للنصف + تحسين أداء React
- **الوقت**: 10 دقائق

### 1.2 حذف مجلد `src/src/` المكرر
- **المشكلة**: مجلد كامل فيه نسخ قديمة من الملفات
- **الحل**: حذف المجلد بالكامل
- **الوقت**: دقيقة

---

## المرحلة 2: TanStack Query — الأكثر تأثيرًا (توفير 50-70% من الطلبات)

### 2.1 إضافة TanStack Query للمشروع
- تثبيت `@tanstack/react-query`
- إنشاء `QueryClientProvider` في `main.tsx`

### 2.2 تحويل عمليات الجلب إلى `useQuery`
- **`loadDataFromSupabase()`**: تحويلها إلى useQuery مع `staleTime: 5 * 60 * 1000` (5 دقائق)
- **`loadLoginLogs()`**: useQuery منفصلة — تتحمل بس لما تدخل صفحة الأمان
- **`loadAuditLogs()`**: useQuery منفصلة — نفس الشيء
- **`loadUsersFromSupabase()`**: useQuery منفصلة
- **التأثير**: منع إعادة جلب البيانات عند التنقل بين الصفحات، كل طلب بيحصل مرة واحدة

### 2.3 تحويل عمليات الكتابة إلى `useMutation`
- **`addCandidate()`**: useMutation مع `invalidateQueries(['candidates'])`
- **`bulkAddCandidates()`**: useMutation
- **`updateCandidate()`**: useMutation
- **`logLogin()`**: useMutation (مش useQuery، لإنها write operation)
- **التأثير**: تحديث تلقائي للـ cache بعد أي insert/update بدون إعادة تحميل كل حاجة

### 2.4 استبدال Realtime Subscriptions بـ `invalidateQueries`
- بدل ما كل realtime event يعمل `loadDataFromSupabase()` كاملة:
  ```
  على 'candidates' change ← invalidateQueries(['candidates'])
  على 'interviews' change ← invalidateQueries(['interviews'])
  ```
- **التأثير**: بدل 12 طلب في كل event، بيعمل 0 طلبات (مجرد invalidate) + يرجع يطلب تاني لما المستخدم يزور الصفحة
- **توفير**: 90-100% من طلبات الـ realtime حاليًا

---

## المرحلة 3: تحسين `addCandidate` — Batch وتحسين منطق

### 3.1 المشكلة الحالية
- دالة `addCandidate` بتعمل 3-6 طلبات متسلسلة لإضافة مرشح واحد
- فحص التكرار من DB ثم من local ثم فحص saved_candidates ثم إدراج + إشعارات

### 3.2 التحسينات
- استعمال RPC (Postgres function) واحدة تعمل كل الخطوات:
  ```
  CREATE OR REPLACE FUNCTION add_candidate(candidate_data JSONB)
  -- تفحص التكرار، تفحص المرفوض، تضيف المرشح، تضيف الإشعارات في طلب واحد
  ```
- **بديل سريع**: دمج الفحوصات في استعلام واحد بـ `.or()` بدل 3 استعلامات منفصلة
- **التأثير**: من 3-6 طلبات → 1 طلب (أو 2 لو الـ RPC مش مستخدم)

---

## المرحلة 4: تحسين Login Flow

### 4.1 المشكلة الحالية
- `logLogin()` بتعمل 2 API خارجي (ipify + ipapi) + Supabase insert
- الـ APIs الخارجية بطيئة وممكن تعلق أو تفشل

### 4.2 التحسينات
- **تقدير معلومات الجهاز محليًا** (بدون ipify/ipapi): استعمال `navigator.userAgent` فقط
- جلب IP عبر Supabase Edge Function أو تأجيله (non-blocking)
- **إضافة caching لـ getDeviceInfo**: استدعاء ipify/ipapi مرة واحدة فقط في الجلسة
- **التأثير**: من 3 طلبات → 1 طلب Supabase (بدون externals)

---

## المرحلة 5: Debounce للبحث والفلاتر

### 5.1 المشكلة
- فلاتر صفحة الأمان بتعمل filtering محلي (client-side) مش مشكلة
- لكن لو في API search في المستقبل، محتاج debounce
- حاليًا الفلاتر محلية ما بتأثر على الطلبات

### 5.2 إضافة Debounce
- استخدام `lodash.debounce` أو custom hook `useDebounce`
- تطبيقه على:
  - Search inputs في صفحة الأمان (احتياطي للمستقبل)
  - أي input بيوصل لـ API

---

## المرحلة 6: <كماليات> تحسينات إضافية

### 6.1 Pagination لصفحات الجداول الكبيرة
- بدل `loadLoginLogs().limit(1000)` و `loadAuditLogs().limit(1000)`
- إضافة pagination مع `offset` و `limit` في الـ useQuery

### 6.2 Batch Update للـ Candidates
- إنشاء `bulkUpdateCandidates` بنفس نمط `bulkAddCandidates`
- استخدام `.in('id', ids)` مع `.update()`

---

## جدول التوفير المتوقع (طلبات Supabase)

| المكان | قبل | بعد | التوفير |
|--------|-----|-----|---------|
| فتح التطبيق (initializeDemoData) | 5-12 طلب | 1-3 طلب | ~75% |
| التنقل بين الصفحات | 5-12 طلب لكل صفحة | 0 (cached) | ~100% |
| Realtime event واحد | 4-12 طلب | 0 (invalidate only) | ~100% |
| إضافة مرشح واحد | 3-6 طلب | 1-2 طلب | ~60% |
| رفع 500 مرشح (batch) | 4-6 طلب | 2-3 طلب | ~40% |
| دخول صفحة الأمان | 2 طلب | 2 طلب (cached) | 0% في أول مرة، 100% بعدها |
| تسجيل دخول مستخدم | 4-6 طلب | 1-2 طلب | ~60% |

**التوفير الإجمالي المقدر: 70-85% من طلبات Supabase في الجلسة النموذجية**

---

## ترتيب الأولوية للتنفيذ

```
1. إصلاح SecurityPage.tsx (تكرار UI) — 10 دقائق
2. حذف src/src/ المكرر — دقيقة
3. TanStack Query + إصلاح Realtime — 4-6 ساعات
4. تحسين addCandidate (RPC/بatching) — 2-3 ساعات
5. تحسين Login Flow — 1 ساعة
6. Pagination للجداول الكبيرة — 1-2 ساعة
7. Debounce للبحث — 30 دقيقة
```
