/**
 * مصف ومولد رسائل واتساب الذكية لـ Marassi
 */

export interface WhatsAppMessageOptions {
  phone: string
  candidateName: string
  position?: string
  securityCompany?: string
  shift?: string
  date?: string
  time?: string
  type: 'acceptance' | 'interview' | 'documents' | 'custom'
  customText?: string
}

export class WhatsAppHelper {
  /**
   * تنظيف وتنسيق رقم الهاتف بالصيغة الدولية لمصر والدول العربية
   */
  static formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '') // إزالة كل الرموز والأحرف

    // إذا كان الرقم مصري يبدأ بـ 01
    if (cleaned.startsWith('01') && cleaned.length === 11) {
      cleaned = '2' + cleaned
    }
    // إذا كان الرقم مصري بدون كود الدولة وبدون 0
    else if (cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '20' + cleaned
    }

    return cleaned
  }

  /**
   * توليد نص الرسالة حسب نوع الإشعار
   */
  static generateMessageText(options: WhatsAppMessageOptions): string {
    const { candidateName, position, securityCompany, shift, date, time, type, customText } = options

    if (customText) return customText

    switch (type) {
      case 'acceptance':
        return `أهلاً بك أ/${candidateName} 🌿\n\nيسعدنا إبلاغك بقبولك المبدئي لوظيفة (${position || 'أمن'}) بشركة (${securityCompany || 'الأمن'}).\n${shift ? `الوردية: ${shift}\n` : ''}يرجى التواصل معنا لاستكمال مصوغات التعيين واستلام العمل.\n\nمع تحيات فريق Marassi لإدارة التوظيف.`

      case 'interview':
        return `أهلاً بك أ/${candidateName} 🤝\n\nتم جدولة موعد المقابلة الشخصية الخاصة بك لوظيفة (${position || 'أمن'}).\nالتاريخ: ${date || 'الموعد المحدد'}\nالوقت: ${time || 'حسب التنسيق'}\n\nيرجى الحضور في الموعد المحدد مع إحضار بطاقة الرقم القومي.\n\nمع تحيات Marassi.`

      case 'documents':
        return `السلام عليكم أ/${candidateName} 📄\n\nيرجى تجهيز أصل وصورة المستندات التالية لاستكمال الملف:\n- بطاقة الرقم القومي سارية\n- أصل المؤهل الدراسي\n- موقف التجنيد\n- كيش وقيد جنائي موجه باسم الشركة\n\nمع تحيات إدارة Marassi.`

      default:
        return `أهلاً بك أ/${candidateName}، نواصل معك من إدارة Marassi لتقييم المقابلات.`
    }
  }

  /**
   * فتح واتساب مباشرة في نافذة جديدة بالرسالة المجهزة
   */
  static openWhatsApp(options: WhatsAppMessageOptions): void {
    if (!options.phone) {
      alert('لا يوجد رقم هاتف مسجل لهذا المرشح.')
      return
    }

    const formattedPhone = this.formatPhoneNumber(options.phone)
    const text = this.generateMessageText(options)
    const encodedText = encodeURIComponent(text)

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
  }
}
