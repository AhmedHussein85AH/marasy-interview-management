# نظام مراسي - إدارة المقابلات


نظام شامل لإدارة مقابلات التوظيف لشركات الأمن، مبني بـ React + TypeScript + Supabase.

---

## المميزات الرئيسية

- **إدارة المرشحين** - إضافة، تعديل، حذف، قبول/رفض مع تفاصيل كاملة
- **قاعدة البيانات المحفوظة** - سجل دائم للقرارات النهائية
- **التقارير والإحصائيات** - charts تفاعلية مع تصدير Excel/CSV/PDF
- **رفع جماعي** - استيراد وتصدير Excel/JSON/CSV
- **نظام صلاحيات تفصيلي** - 16 صلاحية قابلة للتخصيص لكل مستخدم
- **Dark Mode** - وضع ليلي كامل
- **دعم اللغتين** - عربي وإنجليزي مع RTL/LTR
- **طباعة ذكية** - طباعة المحدد فقط أو الكل

## التقنيات المستخدمة

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + Custom CSS |
| UI | shadcn/ui (Radix UI) |
| State | Zustand 4 |
| Routing | React Router v6 |
| Database | Supabase (PostgreSQL) |
| Charts | Recharts 2 |
| i18n | react-i18next |
| Animations | Framer Motion |

## أنواع المستخدمين

| النوع | الصلاحيات الافتراضية |
|-------|---------------------|
| `admin` | كل الصلاحيات |
| `interview_manager` | عرض + قبول/رفض + تقارير |
| `security_employee` | إضافة + تعديل + رفع ملفات |

## التشغيل المحلي

```bash
npm install
npm run dev
```

## متغيرات البيئة

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## النشر على Vercel

راجع `VERCEL_DEPLOYMENT_GUIDE.md`

---

© 2024 Ahmed Hussein - Security Coordinator | Marasy Interview Management System
