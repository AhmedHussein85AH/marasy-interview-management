/**
 * أداة مساعدة لضغط الصور وملفات السيرة الذاتية في المتصفح قبل الرفع
 * تحافظ على الباقة المجانية لـ Supabase بحيث لا تتعدى الصورة 25-35KB
 */

export interface CompressionResult {
  base64: string
  fileName: string
  sizeKb: number
  width?: number
  height?: number
}

/**
 * ضغط الصورة الشخصية وتصغير أبعادها إلى 350x350 كحد أقصى بجودة متوازنة
 */
export async function compressCandidatePhoto(file: File, maxWidth = 350, maxHeight = 350, quality = 0.75): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // التحقق من أنه ملف صورة
    if (!file.type.startsWith('image/')) {
      return reject(new Error('الملف المحدد ليس صورة صالحة'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('فشل في قراءة ملف الصورة'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('فشل في معالجة الصورة'))
      img.onload = () => {
        let width = img.width
        let height = img.height

        // حساب الأبعاد الجديدة مع الحفاظ على النسبة والتناسب
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return reject(new Error('فشل في إنشاء مساحة رسم الصورة'))
        }

        // تحسين جودة التنعيم
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // التحويل إلى JPEG مضغوط
        const base64 = canvas.toDataURL('image/jpeg', quality)
        const sizeKb = Math.round((base64.length * (3 / 4)) / 1024)

        resolve({
          base64,
          fileName: file.name,
          sizeKb,
          width,
          height,
        })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * معالجة ملف السيرة الذاتية (PDF أو صورة) مع التحقق من الحجم
 */
export async function processCandidateCV(file: File, maxAllowedKb = 500): Promise<CompressionResult> {
  const isImage = file.type.startsWith('image/')
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

  if (!isImage && !isPdf) {
    throw new Error('يرجى اختيار ملف PDF أو صورة صالحة للسيرة الذاتية')
  }

  // إذا كان صورة، نضغطها لتكون واضحة للقراءة ولكن بحجم لا يتعدى 150KB
  if (isImage) {
    return compressCandidatePhoto(file, 1200, 1600, 0.70)
  }

  // إذا كان PDF
  const sizeKb = Math.round(file.size / 1024)
  if (sizeKb > maxAllowedKb) {
    throw new Error(`حجم ملف الـ PDF (${sizeKb}KB) يتجاوز الحد الأقصى المسموح به (${maxAllowedKb}KB) لحماية باقة النظام. يرجى تقليص حجم الملف.`)
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('فشل في قراءة ملف السيرة الذاتية'))
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      resolve({
        base64,
        fileName: file.name,
        sizeKb,
      })
    }
    reader.readAsDataURL(file)
  })
}

/**
 * استخراج الرقم القومي من اسم الملف (مثال: "29805121200351.jpg" أو "photo_29805121200351.png")
 */
export function extractNationalIdFromFileName(fileName: string): string | null {
  // إزالة الامتداد
  const cleanName = fileName.replace(/\.[^/.]+$/, '')
  // استخراج 14 رقماً متتالياً إن وجدت
  const match14 = cleanName.match(/\b\d{14}\b/)
  if (match14) return match14[0]

  // بحث عن أي أرقام داخل الاسم بطول 14
  const digits = cleanName.replace(/\D/g, '')
  if (digits.length === 14) return digits
  if (digits.length > 14) {
    // أخذ أول 14 رقم
    return digits.substring(0, 14)
  }

  return null
}
