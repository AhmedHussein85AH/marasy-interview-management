import { useState, useEffect, useCallback } from 'react'

export interface VoiceCommandResult {
  transcript: string
  intent: 'search' | 'filter_status' | 'filter_shift' | 'filter_company' | 'filter_governorate' | 'reset' | 'unknown'
  value?: string
}

export const useVoiceSearch = (onCommand?: (result: VoiceCommandResult) => void) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
    }
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('خاصية التعرف على الصوت غير مدعومة في هذا المتصفح.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'ar-EG' // المصرية
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        setTranscript('')
      }

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript
        setTranscript(text)
        setIsListening(false)

        const parsed = parseEgyptianIntent(text)
        if (onCommand) {
          onCommand(parsed)
        }
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        console.warn('Voice recognition error:', event.error)
        if (event.error !== 'no-speech') {
          setError('لم نتمكن من التقاط الصوت بوضوح، حاولي مرة أخرى.')
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (err: any) {
      setIsListening(false)
      setError(err?.message || 'حدث خطأ في تشغيل الميكروفون')
    }
  }, [onCommand])

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening
  }
}

/**
 * تحليل المعنى والأوامر بالعامية المصرية
 */
function parseEgyptianIntent(text: string): VoiceCommandResult {
  const q = text.trim().toLowerCase()

  // 1. إعادة ضبط / مسح البحث
  if (q.includes('مسح') || q.includes('إعادة') || q.includes('صفر') || q.includes('الغاء')) {
    return { transcript: text, intent: 'reset' }
  }

  // 2. تصفية بالـ الحالة
  if (q.includes('مقبول') || q.includes('المقبولين') || q.includes('اللي اتظفوا')) {
    return { transcript: text, intent: 'filter_status', value: 'مقبول' }
  }
  if (q.includes('مرفوض') || q.includes('المرفوضين') || q.includes('اللي اترفضوا')) {
    return { transcript: text, intent: 'filter_status', value: 'مرفوض' }
  }
  if (q.includes('مستبعد') || q.includes('المستبعدين')) {
    return { transcript: text, intent: 'filter_status', value: 'مستبعد' }
  }
  if (q.includes('انتظار') || q.includes('معلق') || q.includes('قيد')) {
    return { transcript: text, intent: 'filter_status', value: 'في انتظار' }
  }

  // 3. تصفية بالوردية
  if (q.includes('ليل') || q.includes('الليل') || q.includes('ليلي')) {
    return { transcript: text, intent: 'filter_shift', value: 'ليل' }
  }
  if (q.includes('نهار') || q.includes('النهار') || q.includes('صباح')) {
    return { transcript: text, intent: 'filter_shift', value: 'نهار' }
  }

  // 4. تصفية بالمحافظة
  const govMap: Record<string, string> = {
    'القاهرة': 'القاهرة', 'كايرو': 'القاهرة',
    'الإسكندرية': 'الإسكندرية', 'اسكندرية': 'الإسكندرية',
    'الجيزة': 'الجيزة', 'جيزة': 'الجيزة',
    'الشرقية': 'الشرقية', 'الدقهلية': 'الدقهلية',
    'المنوفية': 'المنوفية', 'البحيرة': 'البحيرة',
    'الغربية': 'الغربية', 'القليوبية': 'القليوبية',
    'الفيوم': 'الفيوم', 'بني سويف': 'بني سويف',
    'المنيا': 'المنيا', 'أسيوط': 'أسيوط',
    'سوهاج': 'سوهاج', 'قنا': 'قنا', 'الأقصر': 'الأقصر',
    'أسوان': 'أسوان', 'البحر الأحمر': 'البحر الأحمر',
  }
  for (const [keyword, govValue] of Object.entries(govMap)) {
    if (q.includes(keyword.toLowerCase())) {
      return { transcript: text, intent: 'filter_governorate', value: govValue }
    }
  }

  // 5. بحث عام بالاسم أو الكلمة
  let cleanedName = text
    .replace(/(ابحث عن|هات لي|دور على|عرض|عايز|شوف لي)/gi, '')
    .trim()

  return {
    transcript: text,
    intent: 'search',
    value: cleanedName || text
  }
}
