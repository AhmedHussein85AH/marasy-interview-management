import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import * as XLSX from 'xlsx'
import { GOVERNORATES, SECURITY_COMPANIES, POSITIONS } from '../constants/lists'

interface ExcelCandidate {
  الاسم: string
  الرقم_القومي: string
  تاريخ_الميلاد: string | number
  المحافظة: string
  المؤهل: string
  الحالة_الاجتماعية: string
  اسم_الشركة: string
  الوظيفة?: string
  تاريخ_العرض?: string | number
  النتيجة_النهائية?: string
  تاريخ_القرار?: string | number
  قرار_من?: string
  ملاحظات?: string
}

const BulkUploadPage: React.FC = () => {
  const { currentUser, bulkAddCandidates, bulkAddSavedCandidates } = useStore()
  const [uploadType, setUploadType] = useState<'candidates' | 'saved'>('candidates')
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ExcelCandidate[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, stage: '' })
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
  const [showAllErrors, setShowAllErrors] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canUpload = currentUser?.userType === 'security_employee' || currentUser?.userType === 'admin'

  // قراءة ملف Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (!uploadedFile) return

    if (!uploadedFile.name.endsWith('.xlsx') && !uploadedFile.name.endsWith('.xls')) {
      alert('يرجى اختيار ملف Excel صالح (.xlsx أو .xls)')
      return
    }

    setFile(uploadedFile)
    setUploadResult(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelCandidate[]

        // التحقق من وجود الأعمدة المطلوبة
        const requiredColumns = ['الاسم', 'الرقم_القومي', 'تاريخ_الميلاد', 'المحافظة', 'المؤهل', 'الحالة_الاجتماعية', 'اسم_الشركة']
        const missingColumns = requiredColumns.filter(col => !jsonData[0] || !(col in jsonData[0]))

        if (missingColumns.length > 0) {
          alert(`الأعمدة المطلوبة مفقودة: ${missingColumns.join(', ')}`)
          return
        }

        setPreviewData(jsonData)
        setShowPreview(true)
      } catch (error) {
        console.error('خطأ في قراءة الملف:', error)
        alert('خطأ في قراءة ملف Excel')
      }
    }
    reader.readAsArrayBuffer(uploadedFile)
  }

  // تحويل البيانات إلى التنسيق المطلوب
  // دالة لتحويل تنسيق التاريخ من DD-MM-YYYY إلى YYYY-MM-DD
  const convertDateFormat = (dateValue: string | number): string => {
    if (!dateValue) return ''
    
    // إذا كان التاريخ رقم (Excel serial date) - تحويله
    if (typeof dateValue === 'number') {
      // Excel serial date starts from Jan 1, 1900
      const excelEpoch = new Date(1899, 11, 30)
      const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000)
      
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      
      return `${year}-${month}-${day}`
    }
    
    // إذا كان التاريخ نصاً بصيغة DD-MM-YYYY
    const dateString = dateValue.toString()
    const ddmmyyyyPattern = /^(\d{1,2})-(\d{1,2})-(\d{4})$/
    const match = dateString.match(ddmmyyyyPattern)
    
    if (match) {
      const [, day, month, year] = match
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    
    // إذا كان التنسيق صحيح بالفعل YYYY-MM-DD
    return dateString
  }

  // التحقق من صحة المحافظة
  const validateGovernorate = (governorate: string): string => {
    const gov = governorate?.toString().trim() || ''
    if (!gov) return ''
    
    // البحث عن تطابق دقيق
    const exactMatch = GOVERNORATES.find(g => g === gov)
    if (exactMatch) return exactMatch
    
    // البحث عن تطابق غير حساس لحالة الأحرف
    const caseInsensitiveMatch = GOVERNORATES.find(g => g.toLowerCase() === gov.toLowerCase())
    if (caseInsensitiveMatch) return caseInsensitiveMatch
    
    // إذا لم يتم العثور على تطابق، إرجاع القيمة الأصلية (سيتم قبولها ولكن مع تحذير)
    return gov
  }

  // التحقق من صحة شركة الأمن
  const validateSecurityCompany = (company: string): string => {
    const comp = company?.toString().trim() || ''
    if (!comp) return ''
    
    const exactMatch = SECURITY_COMPANIES.find(c => c === comp)
    if (exactMatch) return exactMatch
    
    const caseInsensitiveMatch = SECURITY_COMPANIES.find(c => c.toLowerCase() === comp.toLowerCase())
    if (caseInsensitiveMatch) return caseInsensitiveMatch
    
    return comp
  }

  // التحقق من صحة الوظيفة
  const validatePosition = (position: string): string | undefined => {
    const pos = position?.toString().trim() || ''
    if (!pos) return undefined
    
    const exactMatch = POSITIONS.find(p => p === pos)
    if (exactMatch) return exactMatch
    
    const caseInsensitiveMatch = POSITIONS.find(p => p.toLowerCase() === pos.toLowerCase())
    if (caseInsensitiveMatch) return caseInsensitiveMatch
    
    return pos
  }

  const convertToCandidates = (data: ExcelCandidate[]) => {
    return data.map(item => ({
      name: item.الاسم?.toString().trim() || '',
      nationalId: item.الرقم_القومي?.toString().trim().replace(/\s/g, '') || '',
      birthDate: convertDateFormat(item.تاريخ_الميلاد),
      governorate: validateGovernorate(item.المحافظة?.toString() || ''),
      qualification: item.المؤهل?.toString().trim() || '',
      maritalStatus: (item.الحالة_الاجتماعية?.toString().trim() || 'أعزب') as 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل',
      securityCompany: validateSecurityCompany(item.اسم_الشركة?.toString() || ''),
      position: validatePosition(item.الوظيفة?.toString() || ''),
      offerDate: convertDateFormat(item.تاريخ_العرض || ''),
      offerResult: (item.النتيجة_النهائية?.toString().trim() || 'في انتظار') as 'مقبول' | 'مرفوض' | 'مستبعد' | 'في انتظار',
      createdBy: currentUser?.name || 'نظام'
    }))
  }

  const convertToSavedCandidates = (data: ExcelCandidate[]) => {
    return data.map(item => ({
      name: item.الاسم?.toString().trim() || '',
      nationalId: item.الرقم_القومي?.toString().trim().replace(/\s/g, '') || '',
      birthDate: convertDateFormat(item.تاريخ_الميلاد),
      governorate: validateGovernorate(item.المحافظة?.toString() || ''),
      qualification: item.المؤهل?.toString().trim() || '',
      maritalStatus: (item.الحالة_الاجتماعية?.toString().trim() || 'أعزب') as 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل',
      securityCompany: validateSecurityCompany(item.اسم_الشركة?.toString() || ''),
      position: validatePosition(item.الوظيفة?.toString() || ''),
      offerDate: convertDateFormat(item.تاريخ_العرض || ''),
      finalResult: (item.النتيجة_النهائية?.toString().trim() || 'مقبول') as 'مقبول' | 'مرفوض' | 'مستبعد',
      decisionDate: convertDateFormat(item.تاريخ_القرار || '') || new Date().toISOString().split('T')[0],
      decisionBy: item.قرار_من?.toString().trim() || currentUser?.name || 'مدير النظام',
      notes: item.ملاحظات?.toString().trim() || undefined,
      isRejectedBefore: false,
      previousRejectionDate: undefined
    }))
  }

  // التحقق من صحة الرقم القومي (14 رقم)
  const validateNationalId = (nationalId: string | number | undefined): { valid: boolean; error?: string } => {
    if (!nationalId) {
      return { valid: false, error: 'الرقم القومي مطلوب' }
    }
    
    const idStr = nationalId.toString().trim().replace(/\s/g, '')
    
    if (idStr.length !== 14) {
      return { valid: false, error: `الرقم القومي يجب أن يكون 14 رقم (الحالي: ${idStr.length} رقم)` }
    }
    
    if (!/^\d+$/.test(idStr)) {
      return { valid: false, error: 'الرقم القومي يجب أن يحتوي على أرقام فقط' }
    }
    
    return { valid: true }
  }

  // التحقق من صحة التاريخ
  const validateDate = (dateValue: string | number | undefined, fieldName: string, allowFuture: boolean = false): { valid: boolean; error?: string; date?: string } => {
    if (!dateValue) {
      return { valid: false, error: `${fieldName} مطلوب` }
    }
    
    const dateStr = convertDateFormat(dateValue)
    
    if (!dateStr) {
      return { valid: false, error: `تنسيق ${fieldName} غير صحيح` }
    }
    
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return { valid: false, error: `تنسيق ${fieldName} غير صحيح` }
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    if (!allowFuture && checkDate > today) {
      return { valid: false, error: `${fieldName} لا يمكن أن يكون في المستقبل` }
    }
    
    // التحقق من أن تاريخ الميلاد معقول (عمر بين 18 و 100 سنة)
    if (fieldName === 'تاريخ الميلاد') {
      const age = today.getFullYear() - checkDate.getFullYear()
      if (age < 18) {
        return { valid: false, error: 'العمر يجب أن يكون 18 سنة على الأقل' }
      }
      if (age > 100) {
        return { valid: false, error: 'العمر غير معقول (أكثر من 100 سنة)' }
      }
    }
    
    return { valid: true, date: dateStr }
  }

  // التحقق من القيم المسموحة
  const validateEnum = (value: string | undefined, allowedValues: string[], fieldName: string): { valid: boolean; error?: string } => {
    if (!value) {
      return { valid: false, error: `${fieldName} مطلوب` }
    }
    
    const trimmedValue = value.toString().trim()
    const isValid = allowedValues.some(v => v === trimmedValue || v.toLowerCase() === trimmedValue.toLowerCase())
    
    if (!isValid) {
      return { valid: false, error: `${fieldName} يجب أن يكون واحداً من: ${allowedValues.join('، ')}` }
    }
    
    return { valid: true }
  }

  // اكتشاف التكرارات داخل الملف
  const findDuplicatesInFile = (data: ExcelCandidate[]): Map<string, number[]> => {
    const nationalIdMap = new Map<string, number[]>()
    
    data.forEach((item, index) => {
      const nationalId = item.الرقم_القومي?.toString().trim() || ''
      if (nationalId) {
        if (!nationalIdMap.has(nationalId)) {
          nationalIdMap.set(nationalId, [])
        }
        nationalIdMap.get(nationalId)!.push(index + 2) // Excel row number (1-based + header)
      }
    })
    
    // إزالة الأرقام القومية التي تظهر مرة واحدة فقط
    const duplicates = new Map<string, number[]>()
    nationalIdMap.forEach((rows, nationalId) => {
      if (rows.length > 1) {
        duplicates.set(nationalId, rows)
      }
    })
    
    return duplicates
  }

  // التحقق من صحة البيانات قبل الرفع
  const validateData = (data: ExcelCandidate[]): { valid: boolean; warnings: string[]; errors: string[] } => {
    const warnings: string[] = []
    const errors: string[] = []
    
    // التحقق من التكرارات داخل الملف
    const duplicates = findDuplicatesInFile(data)
    duplicates.forEach((rows, nationalId) => {
      errors.push(`الرقم القومي "${nationalId}" مكرر في السطور: ${rows.join('، ')}`)
    })
    
    // التحقق من كل سجل
    data.forEach((item, index) => {
      const rowNum = index + 2 // Excel row number (1-based + header)
      
      // التحقق من الحقول المطلوبة
      if (!item.الاسم?.toString().trim()) {
        errors.push(`السطر ${rowNum}: الاسم مطلوب`)
      }
      
      // التحقق من الرقم القومي
      const nationalIdValidation = validateNationalId(item.الرقم_القومي)
      if (!nationalIdValidation.valid) {
        errors.push(`السطر ${rowNum}: ${nationalIdValidation.error}`)
      }
      
      // التحقق من تاريخ الميلاد
      const birthDateValidation = validateDate(item.تاريخ_الميلاد, 'تاريخ الميلاد', false)
      if (!birthDateValidation.valid) {
        errors.push(`السطر ${rowNum}: ${birthDateValidation.error}`)
      }
      
      // التحقق من المحافظة
      const governorate = item.المحافظة?.toString().trim() || ''
      if (!governorate) {
        errors.push(`السطر ${rowNum}: المحافظة مطلوبة`)
      } else if (!GOVERNORATES.some(g => g === governorate || g.toLowerCase() === governorate.toLowerCase())) {
        warnings.push(`السطر ${rowNum}: المحافظة "${governorate}" غير موجودة في القائمة المعتمدة`)
      }
      
      // التحقق من المؤهل
      if (!item.المؤهل?.toString().trim()) {
        errors.push(`السطر ${rowNum}: المؤهل مطلوب`)
      }
      
      // التحقق من الحالة الاجتماعية
      const maritalStatusValidation = validateEnum(
        item.الحالة_الاجتماعية?.toString(),
        ['أعزب', 'متزوج', 'مطلق', 'أرمل'],
        'الحالة الاجتماعية'
      )
      if (!maritalStatusValidation.valid) {
        errors.push(`السطر ${rowNum}: ${maritalStatusValidation.error}`)
      }
      
      // التحقق من شركة الأمن
      const company = item.اسم_الشركة?.toString().trim() || ''
      if (!company) {
        errors.push(`السطر ${rowNum}: اسم الشركة مطلوب`)
      } else if (!SECURITY_COMPANIES.some(c => c === company || c.toLowerCase() === company.toLowerCase())) {
        warnings.push(`السطر ${rowNum}: شركة الأمن "${company}" غير موجودة في القائمة المعتمدة`)
      }
      
      // التحقق من الوظيفة (اختياري)
      const position = item.الوظيفة?.toString().trim() || ''
      if (position && !POSITIONS.some(p => p === position || p.toLowerCase() === position.toLowerCase())) {
        warnings.push(`السطر ${rowNum}: الوظيفة "${position}" غير موجودة في القائمة المعتمدة`)
      }
      
      // التحقق من تاريخ العرض (إذا كان موجوداً)
      if (item.تاريخ_العرض) {
        const offerDateValidation = validateDate(item.تاريخ_العرض, 'تاريخ العرض', true)
        if (!offerDateValidation.valid) {
          warnings.push(`السطر ${rowNum}: ${offerDateValidation.error}`)
        }
      }
      
      // التحقق من النتيجة النهائية (إذا كانت موجودة)
      if (item.النتيجة_النهائية) {
        const resultValidation = validateEnum(
          item.النتيجة_النهائية.toString(),
          ['مقبول', 'مرفوض', 'مستبعد', 'في انتظار'],
          'النتيجة النهائية'
        )
        if (!resultValidation.valid) {
          warnings.push(`السطر ${rowNum}: ${resultValidation.error}`)
        }
      }
      
      // التحقق من تاريخ القرار (إذا كان موجوداً)
      if (item.تاريخ_القرار) {
        const decisionDateValidation = validateDate(item.تاريخ_القرار, 'تاريخ القرار', true)
        if (!decisionDateValidation.valid) {
          warnings.push(`السطر ${rowNum}: ${decisionDateValidation.error}`)
        }
      }
    })
    
    return { valid: errors.length === 0, warnings, errors }
  }

  // رفع البيانات
  const handleUpload = async () => {
    if (!file || previewData.length === 0) return

    // التحقق من صحة البيانات أولاً
    const validation = validateData(previewData)
    
    // عرض الأخطاء (تمنع الرفع)
    if (validation.errors.length > 0) {
      const errorMessage = `تم العثور على ${validation.errors.length} خطأ:\n\n${validation.errors.slice(0, 10).join('\n')}${validation.errors.length > 10 ? `\n... و ${validation.errors.length - 10} خطأ إضافي` : ''}\n\nيرجى تصحيح الأخطاء قبل المتابعة.`
      alert(errorMessage)
      return
    }
    
    // عرض التحذيرات (يمكن المتابعة)
    if (validation.warnings.length > 0) {
      const confirmMessage = `تم العثور على ${validation.warnings.length} تحذير:\n\n${validation.warnings.slice(0, 10).join('\n')}${validation.warnings.length > 10 ? `\n... و ${validation.warnings.length - 10} تحذير إضافي` : ''}\n\nهل تريد المتابعة على أي حال؟`
      if (!window.confirm(confirmMessage)) {
        return
      }
    }

    setIsUploading(true)
    setUploadProgress({ current: 0, total: previewData.length, stage: 'جاري التحضير...' })
    
    try {
      // مرحلة التحويل
      setUploadProgress({ current: 0, total: previewData.length, stage: 'جاري تحويل البيانات...' })
      await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for UI update
      
      const CHUNK_SIZE = 500 // معالجة 500 سجل في كل مرة
      const totalRecords = previewData.length
      let allSuccess = 0
      let allFailed = 0
      const allErrors: string[] = []
      
      // معالجة الملفات الكبيرة على دفعات
      if (totalRecords > CHUNK_SIZE) {
        const chunks = []
        for (let i = 0; i < previewData.length; i += CHUNK_SIZE) {
          chunks.push(previewData.slice(i, i + CHUNK_SIZE))
        }
        
        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
          const chunk = chunks[chunkIndex]
          const chunkStart = chunkIndex * CHUNK_SIZE + 1
          const chunkEnd = Math.min((chunkIndex + 1) * CHUNK_SIZE, totalRecords)
          
          setUploadProgress({
            current: chunkIndex * CHUNK_SIZE,
            total: totalRecords,
            stage: `جاري معالجة الدفعة ${chunkIndex + 1} من ${chunks.length} (السجلات ${chunkStart}-${chunkEnd})...`
          })
          
          let chunkResult
          if (uploadType === 'candidates') {
            const candidates = convertToCandidates(chunk)
            chunkResult = await bulkAddCandidates(candidates)
          } else {
            const savedCandidates = convertToSavedCandidates(chunk)
            chunkResult = await bulkAddSavedCandidates(savedCandidates)
          }
          
          allSuccess += chunkResult.success
          allFailed += chunkResult.failed
          allErrors.push(...chunkResult.errors)
          
          // تحديث التقدم
          setUploadProgress({
            current: Math.min((chunkIndex + 1) * CHUNK_SIZE, totalRecords),
            total: totalRecords,
            stage: `تمت معالجة الدفعة ${chunkIndex + 1} من ${chunks.length}`
          })
          
          // تأخير صغير بين الدفعات لتجنب إرهاق الخادم
          if (chunkIndex < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        }
        
        setUploadProgress({ current: totalRecords, total: totalRecords, stage: 'اكتمل الرفع!' })
        setUploadResult({ success: allSuccess, failed: allFailed, errors: allErrors })
        
        // للملفات الكبيرة
        if (allSuccess > 0) {
          alert(`تم رفع ${allSuccess} مرشح بنجاح${allFailed > 0 ? ` (${allFailed} فشل)` : ''}`)
          // إعادة تعيين النموذج
          setFile(null)
          setPreviewData([])
          setShowPreview(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      } else {
        // للملفات الصغيرة، معالجة عادية
        let result
        if (uploadType === 'candidates') {
          setUploadProgress({ current: 0, total: previewData.length, stage: 'جاري رفع المرشحين...' })
          const candidates = convertToCandidates(previewData)
          result = await bulkAddCandidates(candidates)
        } else {
          setUploadProgress({ current: 0, total: previewData.length, stage: 'جاري رفع المرشحين المحفوظين...' })
          const savedCandidates = convertToSavedCandidates(previewData)
          result = await bulkAddSavedCandidates(savedCandidates)
        }

        setUploadProgress({ current: previewData.length, total: previewData.length, stage: 'اكتمل الرفع!' })
        setUploadResult(result)
        
        if (result.success > 0) {
          alert(`تم رفع ${result.success} مرشح بنجاح`)
          // إعادة تعيين النموذج
          setFile(null)
          setPreviewData([])
          setShowPreview(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      }
    } catch (error) {
      console.error('خطأ في رفع البيانات:', error)
      alert('حدث خطأ في رفع البيانات')
    } finally {
      setIsUploading(false)
      setTimeout(() => {
        setUploadProgress({ current: 0, total: 0, stage: '' })
      }, 2000)
    }
  }

  // تحميل قالب Excel
  const downloadTemplate = () => {
    // إنشاء بيانات القالب
    const templateData = [
      {
        الاسم: 'مثال: محمد أحمد علي',
        الرقم_القومي: '12345678901234',
        تاريخ_الميلاد: '01-01-1990',
        المحافظة: 'القاهرة',
        المؤهل: 'بكالوريوس',
        الحالة_الاجتماعية: 'أعزب',
        اسم_الشركة: 'ليدز للامن والحراسه',
        الوظيفة: 'فرد امن',
        تاريخ_العرض: '01-01-2024',
        النتيجة_النهائية: 'في انتظار',
        تاريخ_القرار: '',
        قرار_من: '',
        ملاحظات: ''
      },
      {
        الاسم: '',
        الرقم_القومي: '',
        تاريخ_الميلاد: '',
        المحافظة: '',
        المؤهل: '',
        الحالة_الاجتماعية: '',
        اسم_الشركة: '',
        الوظيفة: '',
        تاريخ_العرض: '',
        النتيجة_النهائية: '',
        تاريخ_القرار: '',
        قرار_من: '',
        ملاحظات: ''
      }
    ]

    // إنشاء ورقة عمل
    const worksheet = XLSX.utils.json_to_sheet(templateData)
    
    // ضبط عرض الأعمدة
    const columnWidths = [
      { wch: 25 }, // الاسم
      { wch: 15 }, // الرقم_القومي
      { wch: 15 }, // تاريخ_الميلاد
      { wch: 15 }, // المحافظة
      { wch: 15 }, // المؤهل
      { wch: 18 }, // الحالة_الاجتماعية
      { wch: 25 }, // اسم_الشركة
      { wch: 15 }, // الوظيفة
      { wch: 15 }, // تاريخ_العرض
      { wch: 18 }, // النتيجة_النهائية
      { wch: 15 }, // تاريخ_القرار
      { wch: 20 }, // قرار_من
      { wch: 30 }  // ملاحظات
    ]
    worksheet['!cols'] = columnWidths

    // إنشاء مصنف
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المرشحين')

    // إضافة ورقة تعليمات
    const instructionsData = [
      ['تعليمات استخدام القالب'],
      [''],
      ['الأعمدة المطلوبة (يجب ملؤها):'],
      ['- الاسم: اسم المرشح الكامل'],
      ['- الرقم_القومي: الرقم القومي (14 رقم)'],
      ['- تاريخ_الميلاد: تاريخ الميلاد بصيغة DD-MM-YYYY'],
      ['- المحافظة: يجب أن تكون من القائمة المعتمدة'],
      ['- المؤهل: المؤهل العلمي'],
      ['- الحالة_الاجتماعية: أعزب، متزوج، مطلق، أو أرمل'],
      ['- اسم_الشركة: يجب أن تكون من القائمة المعتمدة'],
      [''],
      ['الأعمدة الاختيارية:'],
      ['- الوظيفة: يجب أن تكون من القائمة المعتمدة'],
      ['- تاريخ_العرض: تاريخ عرض العمل'],
      ['- النتيجة_النهائية: مقبول، مرفوض، مستبعد، أو في انتظار'],
      ['- تاريخ_القرار: تاريخ اتخاذ القرار'],
      ['- قرار_من: اسم متخذ القرار'],
      ['- ملاحظات: ملاحظات إضافية'],
      [''],
      ['المحافظات المعتمدة:'],
      [GOVERNORATES.join('، ')],
      [''],
      ['شركات الأمن المعتمدة:'],
      [SECURITY_COMPANIES.join('، ')],
      [''],
      ['الوظائف المعتمدة:'],
      [POSITIONS.join('، ')]
    ]
    
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData)
    instructionsSheet['!cols'] = [{ wch: 80 }]
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'تعليمات')

    // تحميل الملف
    const fileName = `قالب_رفع_المرشحين_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFile(null)
    setPreviewData([])
    setShowPreview(false)
    setUploadResult(null)
    setShowAllErrors(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!canUpload) {
    return (
      <ProtectedLayout requiredPermissions={['security_employee', 'admin']}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#e74c3c' }}>غير مصرح لك بالوصول إلى هذه الصفحة</h2>
          <p>هذه الصفحة متاحة فقط لموظفي الأمن والأدمن</p>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'admin']}>
      <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 60px)' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '30px', textAlign: 'center' }}>
            رفع ملفات Excel - إضافة مرشحين دفعة واحدة
          </h2>

          {/* نوع الرفع */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              نوع البيانات المراد رفعها:
            </label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="uploadType"
                  value="candidates"
                  checked={uploadType === 'candidates'}
                  onChange={(e) => setUploadType(e.target.value as 'candidates' | 'saved')}
                />
                مرشحين جدد (صفحة المرشحين)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="uploadType"
                  value="saved"
                  checked={uploadType === 'saved'}
                  onChange={(e) => setUploadType(e.target.value as 'candidates' | 'saved')}
                />
                مرشحين محفوظين (قاعدة البيانات)
              </label>
            </div>
          </div>

          {/* رفع الملف */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              اختر ملف Excel:
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              aria-label="اختر ملف Excel"
              style={{
                padding: '10px',
                border: '2px dashed #3498db',
                borderRadius: '5px',
                width: '100%',
                backgroundColor: '#f8f9fa'
              }}
            />
          </div>

          {/* تعليمات تنسيق الملف */}
          <div style={{
            backgroundColor: '#e8f4fd',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, color: '#2980b9' }}>تعليمات تنسيق ملف Excel:</h4>
              <button
                onClick={downloadTemplate}
                style={{
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                📥 تحميل القالب
              </button>
            </div>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>الأعمدة المطلوبة:</strong> الاسم، الرقم_القومي، تاريخ_الميلاد، المحافظة، المؤهل، الحالة_الاجتماعية، اسم_الشركة
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>الأعمدة الاختيارية:</strong> الوظيفة، تاريخ_العرض، النتيجة_النهائية، تاريخ_القرار، قرار_من، ملاحظات
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>ملاحظة:</strong> يجب أن تكون الأعمدة في الصف الأول من الملف
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#e74c3c', fontWeight: 'bold' }}>
              <strong>⚠️ مهم:</strong> يجب أن تكون قيم المحافظة وشركة الأمن والوظيفة مطابقة تماماً للقوائم المحددة في النظام
            </p>
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#2980b9' }}>
                عرض القوائم المعتمدة
              </summary>
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '5px' }}>
                <p style={{ margin: '5px 0', fontSize: '13px' }}>
                  <strong>المحافظات:</strong> {GOVERNORATES.join('، ')}
                </p>
                <p style={{ margin: '5px 0', fontSize: '13px' }}>
                  <strong>شركات الأمن:</strong> {SECURITY_COMPANIES.join('، ')}
                </p>
                <p style={{ margin: '5px 0', fontSize: '13px' }}>
                  <strong>الوظائف:</strong> {POSITIONS.join('، ')}
                </p>
              </div>
            </details>
          </div>

          {/* معاينة البيانات */}
          {showPreview && previewData.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                معاينة البيانات ({previewData.length} سجل)
              </h3>
              <div style={{
                maxHeight: '400px',
                overflow: 'auto',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                    <tr>
                      {Object.keys(previewData[0] || {}).map(key => (
                        <th key={key} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                            {value?.toString() || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <p style={{ textAlign: 'center', padding: '10px', color: '#7f8c8d' }}>
                    ... وعرض {previewData.length - 10} سجل إضافي
                  </p>
                )}
              </div>
            </div>
          )}

          {/* شريط التقدم */}
          {isUploading && uploadProgress.total > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{uploadProgress.stage}</span>
                <span style={{ color: '#7f8c8d' }}>
                  {uploadProgress.current} / {uploadProgress.total}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '25px',
                backgroundColor: '#e0e0e0',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#27ae60',
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}>
                  {uploadProgress.total > 0 ? Math.round((uploadProgress.current / uploadProgress.total) * 100) : 0}%
                </div>
              </div>
            </div>
          )}

          {/* أزرار التحكم */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {showPreview && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                style={{
                  backgroundColor: isUploading ? '#95a5a6' : '#27ae60',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {isUploading ? 'جاري الرفع...' : 'رفع البيانات'}
              </button>
            )}
            <button
              onClick={resetForm}
              style={{
                backgroundColor: '#95a5a6',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              إعادة تعيين
            </button>
          </div>

          {/* نتائج الرفع */}
          {uploadResult && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: uploadResult.failed > 0 ? '#f8d7da' : '#d4edda',
              border: `2px solid ${uploadResult.failed > 0 ? '#f5c6cb' : '#c3e6cb'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, color: uploadResult.failed > 0 ? '#721c24' : '#155724', fontSize: '18px' }}>
                  📊 نتائج الرفع
                </h4>
                {uploadResult.errors.length > 0 && (
                  <button
                    onClick={() => {
                      const errorText = uploadResult.errors.join('\n')
                      const blob = new Blob([errorText], { type: 'text/plain;charset=utf-8' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `upload_errors_${new Date().toISOString().split('T')[0]}.txt`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
                    }}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '5px 15px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📥 تصدير الأخطاء
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '10px 15px',
                  backgroundColor: 'white',
                  borderRadius: '5px',
                  border: '1px solid #c3e6cb',
                  minWidth: '150px'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                    ✅ {uploadResult.success}
                  </div>
                  <div style={{ fontSize: '12px', color: '#155724' }}>نجح</div>
                </div>
                {uploadResult.failed > 0 && (
                  <div style={{
                    padding: '10px 15px',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    border: '1px solid #f5c6cb',
                    minWidth: '150px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
                      ❌ {uploadResult.failed}
                    </div>
                    <div style={{ fontSize: '12px', color: '#721c24' }}>فشل</div>
                  </div>
                )}
                <div style={{
                  padding: '10px 15px',
                  backgroundColor: 'white',
                  borderRadius: '5px',
                  border: '1px solid #d0d0d0',
                  minWidth: '150px'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#495057' }}>
                    📋 {uploadResult.success + uploadResult.failed}
                  </div>
                  <div style={{ fontSize: '12px', color: '#495057' }}>إجمالي</div>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h5 style={{ margin: 0, color: '#721c24', fontSize: '16px' }}>
                      ⚠️ الأخطاء ({uploadResult.errors.length})
                    </h5>
                    {uploadResult.errors.length > 10 && (
                      <button
                        onClick={() => setShowAllErrors(!showAllErrors)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #721c24',
                          color: '#721c24',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {showAllErrors ? 'إخفاء' : `عرض الكل (${uploadResult.errors.length})`}
                      </button>
                    )}
                  </div>
                  <div style={{
                    maxHeight: showAllErrors ? 'none' : '300px',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    padding: '10px',
                    border: '1px solid #f5c6cb'
                  }}>
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                      {(showAllErrors ? uploadResult.errors : uploadResult.errors.slice(0, 10)).map((error, index) => {
                        // استخراج رقم السطر من الرسالة
                        const rowMatch = error.match(/السطر (\d+)/)
                        const rowNum = rowMatch ? rowMatch[1] : null
                        
                        return (
                          <li key={index} style={{
                            fontSize: '13px',
                            color: '#721c24',
                            marginBottom: '8px',
                            padding: '8px',
                            backgroundColor: '#fff5f5',
                            borderRadius: '4px',
                            borderLeft: '3px solid #dc3545'
                          }}>
                            <span style={{ fontWeight: 'bold', color: '#dc3545' }}>
                              {rowNum ? `السطر ${rowNum}: ` : ''}
                            </span>
                            {error.replace(/السطر \d+: /, '')}
                          </li>
                        )
                      })}
                    </ul>
                    {!showAllErrors && uploadResult.errors.length > 10 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '10px',
                        color: '#721c24',
                        fontSize: '12px',
                        fontStyle: 'italic'
                      }}>
                        ... و {uploadResult.errors.length - 10} خطأ إضافي
                      </div>
                    )}
                  </div>
                  
                  {/* نصائح لحل الأخطاء */}
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '5px',
                    border: '1px solid #ffc107'
                  }}>
                    <strong style={{ color: '#856404', fontSize: '14px' }}>💡 نصائح:</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '12px', color: '#856404' }}>
                      <li>تأكد من صحة الرقم القومي (14 رقم)</li>
                      <li>تحقق من تنسيق التواريخ (DD-MM-YYYY)</li>
                      <li>تأكد من تطابق قيم المحافظة وشركة الأمن مع القوائم المعتمدة</li>
                      <li>تأكد من عدم تكرار الرقم القومي داخل الملف</li>
                      <li>راجع الأخطاء أعلاه وعدّل الملف ثم أعد المحاولة</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  )
}

export default BulkUploadPage
