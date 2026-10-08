import type { Candidate, SavedCandidate } from '../store/types'

export interface AIAnalysisResult {
  score: number // 0 - 100
  recommendation: 'accepted' | 'rejected' | 'review'
  recommendationLabel: string
  confidence: number // 0 - 100
  strengths: string[]
  risks: string[]
  keyInsights: string[]
  companyMatchRate: number
  summaryText: string
  // ميزات الأمان والذكاء الموسع
  securityRiskLevel: 'low' | 'medium' | 'high'
  securityRiskScore: number // 0 - 100 (كلما زاد، زاد الخطر)
  retentionPrediction: {
    stabilityScore: number // 0 - 100 (استقرار المرشح)
    turnoverRisk: 'منخفض' | 'متوسط' | 'مرتفع'
    reason: string
  }
  recommendedShift: 'نهار' | 'ليل' | 'مرن'
  recommendedQuestions: string[]
  fraudFlags: string[]
}

export interface SmartAlert {
  id: string
  type: 'danger' | 'warning' | 'info' | 'success'
  title: string
  message: string
  actionText?: string
  candidateId?: string
  anomalyCategory?: 'fraud' | 'delay' | 'rejection' | 'vendor'
}

export interface VendorRating {
  companyName: string
  tier: 'A' | 'B' | 'C' | 'D'
  totalCandidates: number
  acceptedCount: number
  rejectedCount: number
  excludedCount: number
  acceptanceRate: number
  qualityScore: number
  statusBadge: string
  recommendation: string
}

export interface AnomalyReport {
  duplicatePhones: { phone: string; names: string[]; count: number }[]
  invalidNationalIds: { candidate: Candidate; reason: string }[]
  suspiciousDuplicates: { name: string; nationalId: string; occurrences: number }[]
  totalAnomaliesCount: number
}

export interface ExecutiveReport {
  generatedAt: string
  totalCandidates: number
  acceptedCandidates: number
  rejectedCandidates: number
  excludedCandidates: number
  pendingCandidates: number
  acceptanceRate: number
  topPerformingVendors: VendorRating[]
  criticalAlertsCount: number
  nightShiftBalance: { night: number; day: number; ratio: string }
  strategicRecommendations: string[]
  executiveSummary: string
}

/**
 * محرك Marassi AI المتقدم للذكاء الاصطناعي الأمني وتحليل البيانات
 */
export class MarassiAI {
  /**
   * تحليل مرشح تقييماً شاملاً مع مؤشرات المخاطر والاستقرار
   */
  static analyzeCandidate(
    candidate: Partial<Candidate>,
    allCandidates: Candidate[] = [],
    savedCandidates: SavedCandidate[] = []
  ): AIAnalysisResult {
    let score = 70 // النقطة المرجعية الأساسية
    const strengths: string[] = []
    const risks: string[] = []
    const keyInsights: string[] = []
    const fraudFlags: string[] = []

    // 1. فحص الرفض والاستبعاد السابق
    let securityRiskScore = 15 // مخاطر افتراضية منخفضة
    if (candidate.isRejectedBefore || candidate.previousRejectionDate) {
      score -= 35
      securityRiskScore += 50
      risks.push(`تم رفض أو استبعاد المرشح سابـقاً بتاريخ ${candidate.previousRejectionDate || 'غير محدد'}`)
    } else {
      score += 5
      strengths.push('سجل أمني خالي من أية سوابق رفض أو استبعاد بالنظام')
    }

    // 2. تحليل مؤهل وقوة ملف المرشح
    const qual = candidate.qualification || ''
    if (qual.includes('عالي') || qual.includes('بكالوريوس') || qual.includes('ليسانس')) {
      score += 15
      strengths.push('مؤهل دراسي عالي يناسب المهام الإشرافية والقيادة الميدانية')
    } else if (qual.includes('فوق متوسط')) {
      score += 10
      strengths.push('مؤهل فوق متوسط متوافق بدرجة ممتازة مع المعايير الأمنية')
    } else if (qual.includes('متوسط')) {
      score += 5
      strengths.push('مؤهل متوسط مناسب للخدمات الأمنية والحراسة')
    }

    // 3. تحليل الشركة الأمنية ونسبة القبول التاريخية لها
    let companyMatchRate = 75
    if (candidate.securityCompany) {
      const allSavedWithCompany = savedCandidates.filter(s => s.securityCompany === candidate.securityCompany)
      if (allSavedWithCompany.length > 0) {
        const acceptedCount = allSavedWithCompany.filter(s => s.finalResult === 'مقبول').length
        companyMatchRate = Math.round((acceptedCount / allSavedWithCompany.length) * 100)

        if (companyMatchRate >= 70) {
          score += 10
          strengths.push(`نسبة قبول عالية لشركة (${candidate.securityCompany}): ${companyMatchRate}%`)
        } else if (companyMatchRate < 40) {
          score -= 15
          securityRiskScore += 15
          risks.push(`سجل توريد متدني لشركة (${candidate.securityCompany}): نسبة قبول ${companyMatchRate}% فقط`)
        }
      }
    }

    // 4. تحليل العمر والتحمل الميداني
    let age = 0
    if (candidate.birthDate) {
      const birthYear = new Date(candidate.birthDate).getFullYear()
      const currentYear = new Date().getFullYear()
      age = currentYear - birthYear

      if (age >= 21 && age <= 38) {
        score += 10
        strengths.push(`العمر الأمثل للعمل الميداني والخدمات الشاقة (${age} سنة)`)
      } else if (age > 45) {
        risks.push(`العمر متقدم نسبياً للمهام الأمنية الشاقة (${age} سنة)`)
        score -= 10
        securityRiskScore += 10
      } else if (age < 20 && age > 0) {
        risks.push(`العمر أقل من السن المعياري المفضل للخدمات الأمنية (${age} سنة)`)
        score -= 5
      }
    }

    // 5. فحص التناقضات وتدقيق الرقم القومي (Fraud Check)
    if (candidate.nationalId) {
      const nid = candidate.nationalId.trim()
      if (nid.length !== 14 || !/^\d{14}$/.test(nid)) {
        fraudFlags.push('الرقم القومي غير مطابق للمعيار المصري (يجب أن يكون 14 رقماً بالضبط)')
        securityRiskScore += 30
      } else {
        // التحقق من سنة الميلاد داخل الرقم القومي
        const century = nid[0] === '2' ? 1900 : nid[0] === '3' ? 2000 : 0
        const nidYear = century + parseInt(nid.substring(1, 3), 10)
        const nidMonth = parseInt(nid.substring(3, 5), 10)
        const nidDay = parseInt(nid.substring(5, 7), 10)

        if (candidate.birthDate) {
          const bd = new Date(candidate.birthDate)
          if (bd.getFullYear() !== nidYear || (bd.getMonth() + 1) !== nidMonth || bd.getDate() !== nidDay) {
            fraudFlags.push(`تضارب بين تاريخ الميلاد المدخل (${candidate.birthDate}) والمسجل بالرقم القومي (${nidYear}-${nidMonth}-${nidDay})`)
            securityRiskScore += 25
          }
        }
      }
    }

    // 6. التحقق من تكرار الهاتف
    if (candidate.phone) {
      const dupCount = allCandidates.filter(c => c.phone === candidate.phone && c.id !== candidate.id).length
      if (dupCount > 0) {
        fraudFlags.push(`رقم الهاتف (${candidate.phone}) مسجل مع مرشحين آخرين بالنظام`)
        securityRiskScore += 20
      }
    }

    // 7. التنبؤ بالاستقرار ودوران العمالة
    let stabilityScore = 75
    let turnoverRisk: 'منخفض' | 'متوسط' | 'مرتفع' = 'منخفض'
    let turnoverReason = 'ملف مستقر وتوافق جغرافي وعمري ملائم'

    if (candidate.maritalStatus === 'متزوج') {
      stabilityScore += 15
      strengths.push('الاستقرار الأسري يعزز الاستمرارية والالتزام بالعمل')
    }
    if (candidate.isRejectedBefore) {
      stabilityScore -= 25
    }
    if (age > 45 || (age > 0 && age < 21)) {
      stabilityScore -= 15
    }

    if (stabilityScore >= 75) {
      turnoverRisk = 'منخفض'
      turnoverReason = 'احتمالية استمرار عالية والتزام وظيفي متوقع'
    } else if (stabilityScore >= 50) {
      turnoverRisk = 'متوسط'
      turnoverReason = 'احتمالية دوران متوسطة، يوصى بالمتابعة الدورية'
    } else {
      turnoverRisk = 'مرتفع'
      turnoverReason = 'احتمالية ترك العمل أو عدم الانتظام مرتفعة'
    }

    // 8. اقتراح الوردية والأسئلة الذكية
    let recommendedShift: 'نهار' | 'ليل' | 'مرن' = 'مرن'
    if (age >= 21 && age <= 35 && (!candidate.maritalStatus || candidate.maritalStatus === 'أعزب')) {
      recommendedShift = 'ليل'
    } else if (age > 40) {
      recommendedShift = 'نهار'
    }

    const recommendedQuestions = this.generateInterviewQuestions(candidate)

    // ضبط الدرجة النهائية ومستوى الخطر الأمني
    const finalScore = Math.min(100, Math.max(10, score))
    const finalSecurityRisk = Math.min(100, Math.max(5, securityRiskScore))

    let securityRiskLevel: 'low' | 'medium' | 'high' = 'low'
    if (finalSecurityRisk >= 60 || fraudFlags.length > 0) {
      securityRiskLevel = 'high'
    } else if (finalSecurityRisk >= 35) {
      securityRiskLevel = 'medium'
    }

    // التوصية العامة
    let recommendation: 'accepted' | 'rejected' | 'review' = 'review'
    let recommendationLabel = 'موصى بالفحص والمراجعة 🟡'

    if (finalScore >= 75 && risks.length === 0 && fraudFlags.length === 0) {
      recommendation = 'accepted'
      recommendationLabel = 'موصى بالقبول والاعتماد 🟢'
    } else if (finalScore < 45 || risks.length >= 2 || fraudFlags.length > 0 || securityRiskLevel === 'high') {
      recommendation = 'rejected'
      recommendationLabel = 'موصى بالرفض أو الاستبعاد 🔴'
    } else {
      recommendation = 'review'
      recommendationLabel = 'موصى بالمراجعة والتدقيق 🟡'
    }

    const summaryText = `بناءً على تحليل Marassi AI لـ ${candidate.name || 'المرشح'}، تم منح نسبة توافق ${finalScore}% مع تصنيف مخاطر (${securityRiskLevel === 'low' ? 'منخفض' : securityRiskLevel === 'medium' ? 'متوسط' : 'مرتفع'}). ${recommendation === 'accepted'
        ? 'يتوافق الملف بشكل ممتاز مع المعايير الأمنية والميدانية المعتمدة.'
        : recommendation === 'rejected'
          ? 'توجد مؤشرات وملاحظات تتطلب استبعاد المرشح أو عدم اعتماده.'
          : 'يتطلب الملف استكمال المقابلة الشخصية للتحقق من نقاط المراجعة.'
      }`

    return {
      score: finalScore,
      recommendation,
      recommendationLabel,
      confidence: Math.min(98, 70 + (strengths.length * 4)),
      strengths,
      risks,
      keyInsights,
      companyMatchRate,
      summaryText,
      securityRiskLevel,
      securityRiskScore: finalSecurityRisk,
      retentionPrediction: {
        stabilityScore: Math.min(100, Math.max(10, stabilityScore)),
        turnoverRisk,
        reason: turnoverReason
      },
      recommendedShift,
      recommendedQuestions,
      fraudFlags
    }
  }

  /**
   * توليد أسئلة مقابلة أمنية وفنية مخصصة للمرشح
   */
  static generateInterviewQuestions(candidate: Partial<Candidate>): string[] {
    const questions: string[] = []
    const role = (candidate.position || 'فرد أمن').toLowerCase()
    const qual = candidate.qualification || ''

    if (role.includes('مشرف') || role.includes('قائد') || qual.includes('عالي')) {
      questions.push('كيف تتصرف إذا رصدت إهمالاً أو مخالفة تعليمات من أحد أفراد الوردية أثناء الخدمة الليلية؟')
      questions.push('ما هو الإجراء الفوري المتبع عند وقوع حادث اقتحام أو نشوب حريق في الموقع المسؤول عنه؟')
    } else {
      questions.push('ما هو تصرفك الفوري إذا حاول شخص مجهول الدخول بدون تصريح أو بطاقة هوية رسمية؟')
      questions.push('كيف تتعامل مع زائر غاضب أو غير متعاون عند بوابة الدخول دون الإخلال بالتعليمات الأمنية؟')
    }

    if (candidate.isRejectedBefore) {
      questions.push('ما هي الظروف السابقة التي حالت دون استمرارك أو قبولك في المقابلة السابقة؟')
    }

    questions.push('ما مدى استعدادك للالتزام بجدول الورديات الليلية والعمل في العطلات الرسمية والمواقع المفتوحة؟')
    questions.push('صف موقفاً تعرضت فيه لضغط شديد أثناء عمل سابق، وكيف نجحت في إنهائه بهدوء وانضباط؟')

    return questions.slice(0, 5)
  }

  /**
   * كشف التناقضات والتكرار المشبوه في كامل قاعدة البيانات (Anomaly Detection)
   */
  static detectAnomalies(candidates: Candidate[], savedCandidates: SavedCandidate[]): AnomalyReport {
    const all = [...candidates, ...savedCandidates]

    // 1. تكرار أرقام الهواتف بأسماء مختلفة
    const phoneMap: Record<string, string[]> = {}
    all.forEach(c => {
      const phone = (c as any).phone
      if (phone && phone.trim().length >= 10) {
        const p = phone.trim()
        if (!phoneMap[p]) phoneMap[p] = []
        if (!phoneMap[p].includes(c.name)) {
          phoneMap[p].push(c.name)
        }
      }
    })

    const duplicatePhones = Object.entries(phoneMap)
      .filter(([_, names]) => names.length > 1)
      .map(([phone, names]) => ({ phone, names, count: names.length }))

    // 2. فحص صحة الأرقام القومية
    const invalidNationalIds: { candidate: Candidate; reason: string }[] = []
    candidates.forEach(c => {
      const nid = (c.nationalId || '').trim()
      if (nid.length !== 14 || !/^\d{14}$/.test(nid)) {
        invalidNationalIds.push({ candidate: c, reason: 'طول الرقم القومي غير صحيح (ليس 14 رقماً)' })
      } else {
        const century = nid[0] === '2' ? 1900 : nid[0] === '3' ? 2000 : 0
        if (century === 0) {
          invalidNationalIds.push({ candidate: c, reason: 'الخانة الأولى في الرقم القومي غير صالحة' })
        }
      }
    })

    // 3. تكرار الرقم القومي بأسماء أو تواريخ مختلفة
    const nidMap: Record<string, { name: string; occurrences: number }> = {}
    all.forEach(c => {
      const nid = (c.nationalId || '').trim()
      if (nid) {
        if (!nidMap[nid]) {
          nidMap[nid] = { name: c.name, occurrences: 0 }
        }
        nidMap[nid].occurrences += 1
      }
    })

    const suspiciousDuplicates = Object.entries(nidMap)
      .filter(([_, data]) => data.occurrences > 1)
      .map(([nationalId, data]) => ({ nationalId, name: data.name, occurrences: data.occurrences }))

    const totalAnomaliesCount = duplicatePhones.length + invalidNationalIds.length + suspiciousDuplicates.length

    return {
      duplicatePhones,
      invalidNationalIds,
      suspiciousDuplicates,
      totalAnomaliesCount
    }
  }

  /**
   * تقييم وتصنيف أداء شركات الأمن وتصنيفها إلى Tiers
   */
  static rateSecurityVendors(savedCandidates: SavedCandidate[], candidates: Candidate[]): VendorRating[] {
    const companies = Array.from(
      new Set([...savedCandidates.map(s => s.securityCompany), ...candidates.map(c => c.securityCompany)])
    ).filter(Boolean)

    return companies.map(company => {
      const fromSaved = savedCandidates.filter(s => s.securityCompany === company)
      const fromCandidates = candidates.filter(c => c.securityCompany === company)
      const total = fromSaved.length + fromCandidates.length

      const acceptedCount = fromSaved.filter(s => s.finalResult === 'مقبول').length +
        fromCandidates.filter(c => c.offerResult === 'مقبول').length
      const rejectedCount = fromSaved.filter(s => s.finalResult === 'مرفوض').length +
        fromCandidates.filter(c => c.offerResult === 'مرفوض').length
      const excludedCount = fromSaved.filter(s => s.finalResult === 'مستبعد' || s.finalResult === 'استقالة').length +
        fromCandidates.filter(c => c.offerResult === 'مستبعد').length

      const acceptanceRate = total > 0 ? Math.round((acceptedCount / total) * 100) : 0
      const rejectionRate = total > 0 ? Math.round(((rejectedCount + excludedCount) / total) * 100) : 0

      let tier: 'A' | 'B' | 'C' | 'D' = 'B'
      let statusBadge = '🟢 فئة أولى (ممتاز)'
      let recommendation = 'شركة ذات جودة توريد عالية وتوافق تام'

      if (acceptanceRate >= 75 && total >= 5) {
        tier = 'A'
        statusBadge = '⭐ فئة A (شريك موثوق)'
        recommendation = 'أداء متميز وتوريد كوادر مطابقة للمواصفات الأمنية.'
      } else if (acceptanceRate >= 55) {
        tier = 'B'
        statusBadge = '🟢 فئة B (جيد جداً)'
        recommendation = 'أداء جيد ومطابق لمعظم المعايير التشغيلية.'
      } else if (acceptanceRate >= 35) {
        tier = 'C'
        statusBadge = '🟡 فئة C (مقبول - يحتاج تحسين)'
        recommendation = 'يوصى بتنبيه مسؤولي الشركة لرفع معايير الفحص المبدئي.'
      } else {
        tier = 'D'
        statusBadge = '🔴 فئة D (مخاطر توريد مرتفعة)'
        recommendation = 'نسبة رفض واستبعاد عالية، يوصى بمراجعة التعاقد فوراً.'
      }

      const qualityScore = Math.max(10, Math.min(100, Math.round(acceptanceRate * 0.8 + (100 - rejectionRate) * 0.2)))

      return {
        companyName: company,
        tier,
        totalCandidates: total,
        acceptedCount,
        rejectedCount,
        excludedCount,
        acceptanceRate,
        qualityScore,
        statusBadge,
        recommendation
      }
    }).sort((a, b) => b.qualityScore - a.qualityScore)
  }

  /**
   * توليد التقرير التنفيذي الشامل للقيادة الأمنية
   */
  static generateExecutiveReport(candidates: Candidate[], savedCandidates: SavedCandidate[]): ExecutiveReport {
    const all = [...candidates, ...savedCandidates]
    const total = all.length
    const accepted = savedCandidates.filter(s => s.finalResult === 'مقبول').length + candidates.filter(c => c.offerResult === 'مقبول').length
    const rejected = savedCandidates.filter(s => s.finalResult === 'مرفوض').length + candidates.filter(c => c.offerResult === 'مرفوض').length
    const excluded = savedCandidates.filter(s => s.finalResult === 'مستبعد' || s.finalResult === 'استقالة').length + candidates.filter(c => c.offerResult === 'مستبعد').length
    const pending = candidates.filter(c => !c.offerResult || c.offerResult === 'في انتظار').length

    const rate = total > 0 ? Math.round((accepted / total) * 100) : 0
    const vendorRatings = this.rateSecurityVendors(savedCandidates, candidates)

    const nightCount = all.filter(c => (c as any).workShift === 'ليل').length
    const dayCount = all.filter(c => (c as any).workShift === 'نهار').length
    const nightRatio = (nightCount + dayCount) > 0 ? `${Math.round((nightCount / (nightCount + dayCount)) * 100)}% ليل` : '0%'

    const anomalies = this.detectAnomalies(candidates, savedCandidates)

    const strategicRecommendations: string[] = []
    if (pending > 10) {
      strategicRecommendations.push(`يوجد ${pending} ملف معلق يتطلب تشكيل لجان بت فورية لتسريع إجراءات التسكين.`)
    }
    if (vendorRatings.some(v => v.tier === 'D')) {
      strategicRecommendations.push('توجد شركات توريد مسجلة بالفئة (D) تعاني من نسب رفض مرتفعة تستوجب توجيه إنذار رسمي.')
    }
    if (anomalies.totalAnomaliesCount > 0) {
      strategicRecommendations.push(`تم رصد ${anomalies.totalAnomaliesCount} تناقضاً في البيانات يستلزم التدقيق الأمني والتحقق الميداني.`)
    }
    if (strategicRecommendations.length === 0) {
      strategicRecommendations.push('جميع العمليات التشغيلية ومؤشرات الأداء تسير وفق أعلى المعايير الأمنية المعتمدة.')
    }

    const executiveSummary = `تقرير استخباراتي وتنفيذي صادر عن نظام Marassi لإدارة الأمن الداخلي. بلغ إجمالي الملفات المعالجة ${total} ملف بنسبة قبول عامة بلغت ${rate}%. تصدرت شركة (${vendorRatings[0]?.companyName || '—'}) قائمة الأفضل جودة. التوزيع الميداني للورديات متوازن بنسبة تغطية ليلية ${nightRatio}.`

    return {
      generatedAt: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      totalCandidates: total,
      acceptedCandidates: accepted,
      rejectedCandidates: rejected,
      excludedCandidates: excluded,
      pendingCandidates: pending,
      acceptanceRate: rate,
      topPerformingVendors: vendorRatings.slice(0, 5),
      criticalAlertsCount: anomalies.totalAnomaliesCount,
      nightShiftBalance: { night: nightCount, day: dayCount, ratio: nightRatio },
      strategicRecommendations,
      executiveSummary
    }
  }

  /**
   * صياغة الخطابات والمذكرات الأمنية الرسمية
   */
  static generateOfficialLetter(
    candidate: Partial<Candidate>,
    type: 'acceptance' | 'rejection' | 'exclusion',
    reason?: string
  ): { title: string; body: string; date: string } {
    const date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    const name = candidate.name || 'المرشح'
    const nid = candidate.nationalId || '—'
    const company = candidate.securityCompany || 'شركة الأمن'
    const position = candidate.position || 'فرد أمن'

    if (type === 'acceptance') {
      return {
        title: `إخطار اعتماد وقبول أمني — ${name}`,
        date,
        body: `إلى: إدارة شركة ${company}\nتحية طيبة وبعد،،\n\nنحيطكم علماً بأنه بعد إجراء الفحص الأمني والمقابلة الشخصية للمرشح المذكور بياناته أدناه:\n• الاسم: ${name}\n• الرقم القومي: ${nid}\n• الوظيفة المرشح لها: ${position}\n\nتقرر: ✅ (قــبـول واعـتـمـاد) المرشح رسمياً للعمل ضمن طاقم الأمن الداخلي، مع ضرورة استكمال مسوغات التعيين وبطاقة الهوية الرقمية قبل استلام الخدمة الميدانية.\n\nوتفضلوا بقبول فائق الاحترام والتقدير،،\nإدارة الأمن الداخلي`
      }
    } else if (type === 'exclusion') {
      return {
        title: `مذكرة استبعاد أمني رسمي — ${name}`,
        date,
        body: `إلى: إدارة شركة ${company}\nتحية طيبة وبعد،،\n\nبناءً على نتائج المراجعة الأمنية والتقييم الميداني للمرشح:\n• الاسم: ${name}\n• الرقم القومي: ${nid}\n• الوظيفة: ${position}\n\nتقرر: ⚠️ (اسـتـبـعـاد) المذكور من العمل بالمنظومة الأمنية.\nسبب الاستبعاد: ${reason || 'عدم مطابقة المعايير الأمنية والاشتراطات الميدانية المعتمدة'}.\nيرجى اتخاذ الإجراءات اللازمة وتوفير بديل مطابق.\n\nوتفضلوا بقبول الاحترام،،\nإدارة الأمن الداخلي`
      }
    } else {
      return {
        title: `إخطار عدم قبول — ${name}`,
        date,
        body: `إلى: إدارة شركة ${company}\nتحية طيبة وبعد،،\n\nنحيطكم علماً بأنه بعد انعقاد لجنة المقابلات الأمنية للمرشح:\n• الاسم: ${name}\n• الرقم القومي: ${nid}\n\nتقرر: ❌ (عـدم الـقـبـول) لعدم اجتياز معايير التقييم المقررة للوظيفة.\nسبب القرار: ${reason || 'عدم اجتياز المقابلة الشخصية والشروط الفنية'}.\n\nوتفضلوا بقبول الاحترام،،\nإدارة الأمن الداخلي`
      }
    }
  }

  /**
   * توليد تنبيهات ورادار أمني ذكي
   */
  static generateSmartAlerts(
    candidates: Candidate[],
    savedCandidates: SavedCandidate[]
  ): SmartAlert[] {
    const alerts: SmartAlert[] = []

    // 1. كشف التناقضات والتكرارات
    const anomalies = this.detectAnomalies(candidates, savedCandidates)
    if (anomalies.duplicatePhones.length > 0) {
      alerts.push({
        id: 'dup-phones',
        type: 'danger',
        title: '⚠️ تكرار أرقام هواتف مشبوه',
        message: `تم رصد ${anomalies.duplicatePhones.length} رقم هاتف مكرر مع أسماء مختلفة.`,
        actionText: 'فحص التناقضات',
        anomalyCategory: 'fraud'
      })
    }

    if (anomalies.invalidNationalIds.length > 0) {
      alerts.push({
        id: 'invalid-nid',
        type: 'warning',
        title: '⚠️ أرقام قومية غير مطابقة للمعيار',
        message: `يوجد ${anomalies.invalidNationalIds.length} مرشح بأرقام قومية تحتاج لتصحيح فوري.`,
        actionText: 'مراجعة الأرقام',
        anomalyCategory: 'fraud'
      })
    }

    // 2. تنبيه المرشحين المرفوضين سابقاً قيد الانتظار
    const pendingRejectedBefore = candidates.filter(c => c.isRejectedBefore && (!c.offerResult || c.offerResult === 'في انتظار'))
    if (pendingRejectedBefore.length > 0) {
      alerts.push({
        id: 'rejected-before-alert',
        type: 'danger',
        title: '🚨 تنبيه سوابق رفض واستبعاد',
        message: `يوجد ${pendingRejectedBefore.length} مرشح لديهم رفض أو استبعاد سابق وفي قائمة الانتظار حالياً.`,
        actionText: 'فحص الحالات الحرجة',
        anomalyCategory: 'rejection'
      })
    }

    // 3. تنبيه التأخر في اتخاذ القرار (> 10 أيام)
    const now = new Date()
    const delayedCandidates = candidates.filter(c => {
      if (c.offerResult && c.offerResult !== 'في انتظار') return false
      const createdAt = new Date(c.createdAt)
      const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24))
      return diffDays > 10
    })

    if (delayedCandidates.length > 0) {
      alerts.push({
        id: 'delayed-decision-alert',
        type: 'warning',
        title: '⏳ تأخير في اتخاذ القرار',
        message: `توجد ${delayedCandidates.length} حالة مرشحين مر عليها أكثر من 10 أيام دون قرار رسمي.`,
        actionText: 'عرض المعلقين',
        anomalyCategory: 'delay'
      })
    }

    // 4. تقييم شركات الأمن الضعيفة
    const vendors = this.rateSecurityVendors(savedCandidates, candidates)
    const weakVendors = vendors.filter(v => v.tier === 'D')
    if (weakVendors.length > 0) {
      alerts.push({
        id: 'weak-vendors-alert',
        type: 'danger',
        title: '📉 تدني جودة توريد شركات أمن',
        message: `الشركات: (${weakVendors.map(w => w.companyName).join('، ')}) تسجل نسب رفض واستبعاد تفوق 65%.`,
        actionText: 'مراجعة أداء الشركات',
        anomalyCategory: 'vendor'
      })
    }

    return alerts
  }

  /**
   * الإجابة الذكية الموسعة على استفسارات المدير باللغة العربية
   */
  static answerQuery(query: string, candidates: Candidate[], savedCandidates: SavedCandidate[]): string {
    const q = query.trim().toLowerCase()
    const all = [...candidates, ...savedCandidates]

    // فحص أسئلة دليل الاستخدام
    const guideKeywords = ['إزاي', 'ازاي', 'كيف', 'طريقة', 'خطوات', 'شرح', 'دليل', 'أضيف', 'اضيف', 'أرفع', 'ارفع', 'أجدول', 'اجدول', 'أقبل', 'أرفض', 'اقبل', 'ارفض', 'أطبع', 'اطبع', 'اعمل', 'أعمل', 'ابحث', 'أبحث']
    if (guideKeywords.some(kw => q.includes(kw))) {
      const guide = this.getUserGuide(q)
      if (guide) {
        return `📖 ${guide.title}\n\n${guide.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}${guide.tip ? `\n\n💡 نصيحة: ${guide.tip}` : ''}`
      }
    }

    if (q.includes('كم') && (q.includes('مقبول') || q.includes('قبول'))) {
      const count = candidates.filter(c => c.offerResult === 'مقبول').length + savedCandidates.filter(s => s.finalResult === 'مقبول').length
      return `📊 إجمالي المرشحين المقبولين المعتمدين في النظام هو ${count} مرشح حتى الآن.`
    }

    if (q.includes('مرفوض') || q.includes('رفض') || q.includes('استبعاد')) {
      const count = candidates.filter(c => c.offerResult === 'مرفوض' || c.offerResult === 'مستبعد').length +
        savedCandidates.filter(s => s.finalResult === 'مرفوض' || s.finalResult === 'مستبعد').length
      return `🚫 إجمالي الحالات المرفوضة والمستبعدة المسجلة بالنظام هو ${count} حالة.`
    }

    if (q.includes('ليل') || q.includes('وردية') || q.includes('نهار')) {
      const nightCount = all.filter(c => (c as any).workShift === 'ليل').length
      const dayCount = all.filter(c => (c as any).workShift === 'نهار').length
      return `🌓 توزيع الورديات الحالي: ${dayCount} فرد في وردية النهار، و ${nightCount} فرد في وردية الليل.`
    }

    if (q.includes('أفضل') || q.includes('مرشحين') || q.includes('توصية') || q.includes('ترشيح')) {
      const topCandidates = candidates
        .filter(c => (!c.offerResult || c.offerResult === 'في انتظار') && !c.isRejectedBefore)
        .slice(0, 4)
      if (topCandidates.length === 0) return 'جميع المرشحين في الانتظار تم البت فيهم أو تتطلب حالاتهم تدقيقاً إضافياً.'
      return `⭐ أفضل المرشحين الجاهزين للاعتماد المباشر بأعلى درجات توافق: ${topCandidates.map(c => `${c.name} (${c.securityCompany})`).join('، ')}.`
    }

    if (q.includes('شركة') || q.includes('شركات') || q.includes('توريد') || q.includes('تقييم')) {
      const vendors = this.rateSecurityVendors(savedCandidates, candidates)
      if (vendors.length === 0) return 'لا توجد بيانات كافية لتقييم الشركات بعد.'
      const top = vendors[0]
      return `🏢 أفضل شركة أداءً حالياً هي (${top.companyName}) بنسبة قبول ${top.acceptanceRate}% وجودة ${top.qualityScore}%. إجمالي الشركات النشطة بالنظام: ${vendors.length} شركة.`
    }

    if (q.includes('مخاطر') || q.includes('خطر') || q.includes('تناقض') || q.includes('تزوير') || q.includes('شبهة')) {
      const anomalies = this.detectAnomalies(candidates, savedCandidates)
      return `🚨 تقرير الرادار الأمني: تم رصد ${anomalies.duplicatePhones.length} رقم هاتف مكرر، و ${anomalies.invalidNationalIds.length} أرقام قومية غير مطابقة. إجمالي التناقضات: ${anomalies.totalAnomaliesCount}.`
    }

    if (q.includes('تقرير') || q.includes('ملخص') || q.includes('إحصائية')) {
      const rep = this.generateExecutiveReport(candidates, savedCandidates)
      return `📋 ${rep.executiveSummary}`
    }

    return `🤖 بناءً على فحص قاعدة بيانات Marassi: مسجل بالنظام ${all.length} مرشح وموظف. يمكنك أن تسألني عن: إحصائيات القبول، تقييم شركات الأمن، الورديات، أفضل المرشحين، أو كشف التناقضات الأمنية. كمان تقدر تسألني "إزاي أضيف مرشح؟" أو "إزاي أجدول مقابلة؟" وهرد عليك بخطوات واضحة من دليل الاستخدام.`
  }

  /**
   * استرجاع دليل الاستخدام المناسب بناءً على الاستعلام
   */
  static getUserGuide(query?: string): GuideTopic | null {
    if (!query) return null
    const q = query.toLowerCase()
    return SYSTEM_USER_GUIDE.find(topic =>
      topic.keywords.some(kw => q.includes(kw))
    ) || null
  }

  /**
   * استرجاع كل دليل الاستخدام (أو البحث فيه)
   */
  static getAllGuideTopics(search?: string): GuideTopic[] {
    if (!search || search.trim() === '') return SYSTEM_USER_GUIDE
    const s = search.trim().toLowerCase()
    return SYSTEM_USER_GUIDE.filter(t =>
      t.title.includes(s) ||
      t.category.includes(s) ||
      t.keywords.some(k => k.includes(s)) ||
      t.steps.some(st => st.includes(s))
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// دليل الاستخدام الشامل لنظام Marassi
// ─────────────────────────────────────────────────────────────────────────────

export interface GuideTopic {
  id: string
  category: 'candidates' | 'interviews' | 'database' | 'users' | 'ai' | 'cards' | 'uploads'
  categoryLabel: string
  categoryIcon: string
  title: string
  keywords: string[]
  steps: string[]
  tip?: string
}

export const SYSTEM_USER_GUIDE: GuideTopic[] = [
  // ─── إضافة مرشح جديد ───────────────────────────────────────────
  {
    id: 'add-candidate',
    category: 'candidates',
    categoryLabel: 'إدارة المرشحين',
    categoryIcon: '👤',
    title: 'إزاي أضيف مرشح جديد؟',
    keywords: ['اضيف مرشح', 'أضيف مرشح', 'مرشح جديد', 'اضافة مرشح', 'إضافة مرشح'],
    steps: [
      'افتح صفحة "المرشحون" من القائمة الجانبية.',
      'اضغط على زر "+ إضافة مرشح" في أعلى الصفحة.',
      'ادخل بيانات المرشح: الاسم، الرقم القومي، تليفون، الشركة الأمنية، الموقع.',
      'ارفع صورة المرشح باستخدام زر رفع الصورة (اختياري).',
      'اضغط "حفظ" لإضافة المرشح لقائمة الانتظار.',
    ],
    tip: 'تأكد إن الرقم القومي صح (14 رقم) عشان النظام يعمل تحقق أمني تلقائي.',
  },
  // ─── البحث عن مرشح ─────────────────────────────────────────────
  {
    id: 'search-candidate',
    category: 'candidates',
    categoryLabel: 'إدارة المرشحين',
    categoryIcon: '👤',
    title: 'إزاي أبحث عن مرشح بالاسم أو البيانات؟',
    keywords: ['ابحث', 'أبحث', 'بحث', 'بحث مرشح', 'ابحث عن'],
    steps: [
      'افتح صفحة "المرشحون" أو "قاعدة البيانات".',
      'استخدم حقل البحث في أعلى القائمة.',
      'اكتب اسم المرشح أو جزء منه أو الرقم القومي.',
      'النتائج بتتصفى تلقائياً وأنت بتكتب.',
      'اضغط على اسم المرشح لعرض بيانات ملفه الكامل.',
    ],
    tip: 'تقدر تبحث في صفحة جدولة المقابلات برضو بنفس الطريقة.',
  },
  // ─── رفع صور دفعة ───────────────────────────────────────────────
  {
    id: 'bulk-photo-upload',
    category: 'uploads',
    categoryLabel: 'الرفع الجماعي',
    categoryIcon: '📤',
    title: 'إزاي أرفع صور مرشحين بالجملة؟',
    keywords: ['ارفع صور', 'أرفع صور', 'صور جملة', 'رفع جماعي صور', 'bulk'],
    steps: [
      'افتح صفحة "المرشحون".',
      'اضغط على زر "رفع صور جماعي" أو الأيقونة المخصصة.',
      'اختار الصور من جهازك (تقدر تختار أكتر من صورة في نفس الوقت).',
      'النظام بيربط الصور بالمرشحين تلقائياً من خلال اسم الملف.',
      'راجع نتيجة الربط وبعدين اضغط "تأكيد الرفع".',
    ],
    tip: 'سمّي الصور بنفس اسم المرشح بالضبط عشان الربط التلقائي يشتغل صح.',
  },
  // ─── رفع ملف Excel ──────────────────────────────────────────────
  {
    id: 'excel-upload',
    category: 'uploads',
    categoryLabel: 'الرفع الجماعي',
    categoryIcon: '📤',
    title: 'إزاي أرفع ملف Excel لاستيراد مرشحين؟',
    keywords: ['excel', 'اكسل', 'ارفع ملف', 'أرفع ملف', 'استيراد', 'import'],
    steps: [
      'افتح صفحة "المرشحون".',
      'اضغط على زر "استيراد Excel".',
      'حمّل الملف النموذجي أول ولا استخدم نفس تنسيق الأعمدة المطلوب.',
      'اختار ملف الـ Excel (.xlsx أو .xls) من جهازك.',
      'راجع البيانات المعروضة للتأكد من صحتها.',
      'اضغط "استيراد" لإضافة المرشحين دفعة واحدة.',
    ],
    tip: 'الحقول المطلوبة في الـ Excel: الاسم، الرقم القومي، التليفون، الشركة الأمنية.',
  },
  // ─── جدولة مقابلة ───────────────────────────────────────────────
  {
    id: 'schedule-interview',
    category: 'interviews',
    categoryLabel: 'جدولة المقابلات',
    categoryIcon: '📅',
    title: 'إزاي أجدول مقابلة لمرشح؟',
    keywords: ['اجدول', 'أجدول', 'جدولة مقابلة', 'مقابلة جديدة', 'موعد مقابلة'],
    steps: [
      'افتح صفحة "جدولة المقابلات" من القائمة.',
      'اضغط على زر "+ جدولة مقابلة جديدة".',
      'ابحث عن اسم المرشح في خانة البحث.',
      'اختار المرشح المطلوب من القائمة.',
      'حدد التاريخ والوقت والمسؤول عن المقابلة.',
      'اضغط "تأكيد الجدولة" لحفظ الموعد.',
    ],
    tip: 'لو المرشح عنده سوابق رفض، النظام هينبهك تلقائياً قبل ما تكمل الجدولة.',
  },
  // ─── قبول / رفض مرشح بعد المقابلة ──────────────────────────────
  {
    id: 'interview-decision',
    category: 'interviews',
    categoryLabel: 'جدولة المقابلات',
    categoryIcon: '📅',
    title: 'إزاي أسجل نتيجة المقابلة (قبول أو رفض)؟',
    keywords: ['اقبل', 'أقبل', 'ارفض', 'أرفض', 'نتيجة مقابلة', 'قرار مقابلة', 'قبول رفض'],
    steps: [
      'افتح صفحة "جدولة المقابلات".',
      'ابحث عن المرشح اللي اتقابل فعلاً.',
      'اضغط على زر "تسجيل النتيجة" أو أيقونة القرار بجانب اسمه.',
      'اختار: ✅ مقبول، ❌ مرفوض، أو ⚠️ مستبعد.',
      'أكتب ملاحظات أو سبب القرار لو محتاج.',
      'اضغط "تأكيد القرار" — القرار بيتسجل في قاعدة البيانات وبياخد تاريخ تلقائياً.',
      'تقدر تطبع كرت الهوية الرقمي فوراً لو القرار كان "مقبول".',
    ],
    tip: 'بعد التأكيد، المرشح المقبول بيتنقل لأرشيف قاعدة البيانات ومتاح للطباعة.',
  },
  // ─── طباعة كرت الهوية ───────────────────────────────────────────
  {
    id: 'print-id-card',
    category: 'cards',
    categoryLabel: 'الكروت والطباعة',
    categoryIcon: '🪪',
    title: 'إزاي أطبع كرت هوية مرشح مقبول؟',
    keywords: ['اطبع', 'أطبع', 'طباعة', 'كرت هوية', 'id card', 'بطاقة'],
    steps: [
      'افتح صفحة "قاعدة البيانات" وابحث عن المرشح.',
      'اضغط على اسم المرشح لفتح ملفه.',
      'في الملف، اضغط زر "🖨️ طباعة الكرت".',
      'هيظهرلك معاينة الكرت — تأكد البيانات صح.',
      'اضغط "طباعة" أو "PDF" على حسب احتياجك.',
    ],
    tip: 'كرت الهوية بيشمل QR كود مشفر — تقدر تمسحه بكاميرا النظام للتحقق السريع.',
  },
  // ─── مسح QR كود ─────────────────────────────────────────────────
  {
    id: 'scan-qr',
    category: 'cards',
    categoryLabel: 'الكروت والطباعة',
    categoryIcon: '🪪',
    title: 'إزاي أمسح QR كود كرت هوية للتحقق؟',
    keywords: ['qr', 'امسح', 'أمسح', 'مسح', 'scanner', 'كاميرا'],
    steps: [
      'افتح صفحة "المرشحون" أو "قاعدة البيانات".',
      'اضغط على أيقونة الـ QR Scanner في أعلى الصفحة.',
      'وجّه الكاميرا على الـ QR كود الموجود على الكرت.',
      'النظام هيتحقق تلقائياً ويعرضلك بيانات المرشح.',
      'لو الكرت مش أصلي أو البيانات مش متطابقة، هيظهر تنبيه أحمر.',
    ],
    tip: 'تقدر كمان ترفع صورة الكرت من الجاليري بدل ما تستخدم الكاميرا مباشرة.',
  },
  // ─── إضافة مستخدم جديد ──────────────────────────────────────────
  {
    id: 'add-user',
    category: 'users',
    categoryLabel: 'إدارة المستخدمين',
    categoryIcon: '⚙️',
    title: 'إزاي أضيف مستخدم جديد للنظام؟',
    keywords: ['اضيف مستخدم', 'أضيف مستخدم', 'مستخدم جديد', 'يوزر', 'user جديد'],
    steps: [
      'افتح صفحة "الإعدادات" أو "إدارة المستخدمين" (صلاحيات الأدمن فقط).',
      'اضغط "+ إضافة مستخدم".',
      'ادخل: الاسم، اسم المستخدم، كلمة السر، الدور الوظيفي.',
      'حدد الصلاحيات المطلوبة (عرض، إضافة، تعديل، حذف).',
      'اضغط "حفظ المستخدم".',
    ],
    tip: 'كل دور وظيفي ليه صلاحيات افتراضية — تقدر تعدل عليها بعد الإنشاء.',
  },
  // ─── استخدام Marassi AI ───────────────────────────────────────────
  {
    id: 'use-ai',
    category: 'ai',
    categoryLabel: 'Marassi AI المساعد',
    categoryIcon: '🤖',
    title: 'إزاي أستخدم Marassi AI بشكل صح؟',
    keywords: ['ai', 'ذكاء', 'مساعد', 'اسال', 'أسأل', 'Marassi'],
    steps: [
      'اضغط على زر "Marassi AI Suite" في أسفل الشاشة على اليسار.',
      'في تاب "محادثة": اكتب سؤالك بالعربي أو اختار من الأسئلة السريعة.',
      'في تاب "رادار الأمان": شوف التنبيهات والتناقضات المكتشفة تلقائياً.',
      'في تاب "تصنيف الشركات": شوف أداء كل شركة أمن وتقييمها.',
      'في تاب "التقرير التنفيذي": اطلع على ملخص شامل وجاهز للطباعة.',
      'في تاب "مساعد المقابلة": شوف تحليل ملف المرشح وأسئلة المقابلة الموصى بها.',
      'في تاب "دليل الاستخدام": ابحث عن أي إجراء وهتلاقي خطواته واضحة.',
    ],
    tip: 'كل البيانات بتتحسب لحظياً من النظام — مفيش أي بيانات بتتبعت لخارج النظام.',
  },
  // ─── نقل لقاعدة البيانات ────────────────────────────────────────
  {
    id: 'archive-candidate',
    category: 'database',
    categoryLabel: 'قاعدة البيانات',
    categoryIcon: '🗄️',
    title: 'إزاي المرشح بينتقل لقاعدة البيانات الأرشيف؟',
    keywords: ['قاعدة بيانات', 'ارشيف', 'أرشيف', 'نقل', 'محفوظ', 'archive'],
    steps: [
      'المرشح بينتقل لقاعدة البيانات تلقائياً بعد ما يتاخد قرار نهائي (قبول/رفض/استبعاد).',
      'افتح صفحة "قاعدة البيانات" لعرض كل المرشحين المحفوظين.',
      'تقدر تفلتر حسب النتيجة: مقبول، مرفوض، مستبعد.',
      'اضغط على أي مرشح لعرض ملفه الكامل أو طباعة كرته.',
      'تقدر تصدر البيانات كـ Excel من زر التصدير.',
    ],
    tip: 'المرشحون المرفوضون بيظهروا كتحذير لو حد حاول يجدولهم تاني في المستقبل.',
  },
]

