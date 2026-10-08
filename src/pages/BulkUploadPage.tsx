import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import { usePermissions } from '../hooks/usePermissions'
import { useEditableLists } from '../hooks/useEditableLists'
import * as XLSX from 'xlsx'
import { Download, FileJson, FileSpreadsheet, AlertTriangle, ImagePlus, CheckCircle2, XCircle, GalleryHorizontalEnd } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { extractNationalIdFromFileName, compressCandidatePhoto } from '../utils/imageCompressor'

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
  const { currentUser, bulkAddCandidates, bulkAddSavedCandidates, candidates, savedCandidates, updateCandidate } = useStore()
  const { allGovernorates, allCompanies, allPositions } = useEditableLists()
  const perms = usePermissions()
  const canUpload = perms.canBulkUpload
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'photos'>('import')
  const [uploadType, setUploadType] = useState<'candidates' | 'saved'>('candidates')
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ExcelCandidate[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, stage: '' })
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
  const [showAllErrors, setShowAllErrors] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const jsonRef = useRef<HTMLInputElement>(null)
  const photosInputRef = useRef<HTMLInputElement>(null)
  // Bulk photos state
  const [photoUploadResults, setPhotoUploadResults] = useState<{ matched: string[]; unmatched: string[]; errors: string[] } | null>(null)
  const [isBulkPhotoUploading, setIsBulkPhotoUploading] = useState(false)
  const [bulkPhotoProgress, setBulkPhotoProgress] = useState({ current: 0, total: 0 })
  const { t } = useTranslation()

  const today = new Date().toISOString().split('T')[0]

  // ── Export helpers ───────────────────────────────────────
  const exportExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات')
    XLSX.writeFile(wb, filename)
  }

  const exportJSON = (data: any[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
  }

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const rows = data.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))
    const blob = new Blob(['\ufeff' + [headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
  }

  const flatCandidates = candidates.map(c => ({
    الاسم: c.name, الرقم_القومي: c.nationalId, تاريخ_الميلاد: c.birthDate,
    المحافظة: c.governorate, المؤهل: c.qualification, الحالة_الاجتماعية: c.maritalStatus,
    اسم_الشركة: c.securityCompany, الوظيفة: c.position || '', الموبايل: (c as any).phone || '',
    تاريخ_العرض: c.offerDate, النتيجة: c.offerResult,
  }))

  const flatSaved = savedCandidates.map(c => ({
    الاسم: c.name, الرقم_القومي: c.nationalId, تاريخ_الميلاد: c.birthDate,
    المحافظة: c.governorate, المؤهل: c.qualification, الحالة_الاجتماعية: c.maritalStatus,
    اسم_الشركة: c.securityCompany, الوظيفة: c.position || '',
    النتيجة_النهائية: c.finalResult, تاريخ_القرار: c.decisionDate,
    قرار_من: c.decisionBy, الملاحظات: c.notes || '',
  }))

  // ── JSON Import ──────────────────────────────────────────
  const handleJSONImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    try {
      const data = JSON.parse(await f.text())
      if (!Array.isArray(data)) { alert('الملف يجب أن يحتوي على مصفوفة JSON'); return }
      const mapped: ExcelCandidate[] = data.map((item: any) => ({
        الاسم: item.name || item['الاسم'] || '',
        الرقم_القومي: item.nationalId || item['الرقم_القومي'] || '',
        تاريخ_الميلاد: item.birthDate || item['تاريخ_الميلاد'] || '',
        المحافظة: item.governorate || item['المحافظة'] || '',
        المؤهل: item.qualification || item['المؤهل'] || '',
        الحالة_الاجتماعية: item.maritalStatus || item['الحالة_الاجتماعية'] || 'أعزب',
        اسم_الشركة: item.securityCompany || item['اسم_الشركة'] || '',
        الوظيفة: item.position || item['الوظيفة'] || '',
        تاريخ_العرض: item.offerDate || item['تاريخ_العرض'] || '',
        النتيجة_النهائية: item.offerResult || item.finalResult || item['النتيجة_النهائية'] || 'في انتظار',
        تاريخ_القرار: item.decisionDate || item['تاريخ_القرار'] || '',
        قرار_من: item.decisionBy || item['قرار_من'] || '',
        ملاحظات: item.notes || item['ملاحظات'] || '',
      }))
      setPreviewData(mapped); setShowPreview(true); setUploadResult(null)
    } catch (err: any) { alert('خطأ في قراءة ملف JSON: ' + err.message) }
    if (jsonRef.current) jsonRef.current.value = ''
  }

  // ── Excel Import ─────────────────────────────────────────
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (!uploadedFile) return
    if (!uploadedFile.name.endsWith('.xlsx') && !uploadedFile.name.endsWith('.xls')) {
      alert('يرجى اختيار ملف Excel صالح (.xlsx أو .xls)'); return
    }
    setFile(uploadedFile); setUploadResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelCandidate[]
        const required = ['الاسم', 'الرقم_القومي', 'تاريخ_الميلاد', 'المحافظة', 'المؤهل', 'الحالة_الاجتماعية', 'اسم_الشركة']
        const missing = required.filter(col => !jsonData[0] || !(col in jsonData[0]))
        if (missing.length > 0) { alert('الأعمدة المطلوبة مفقودة: ' + missing.join(', ')); return }
        setPreviewData(jsonData); setShowPreview(true)
      } catch { alert('خطأ في قراءة ملف Excel') }
    }
    reader.readAsArrayBuffer(uploadedFile)
  }

  // ── Date conversion ──────────────────────────────────────
  const convertDateFormat = (dateValue: string | number): string => {
    if (!dateValue) return ''
    if (typeof dateValue === 'number') {
      const date = new Date(new Date(1899, 11, 30).getTime() + dateValue * 86400000)
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    }
    const m = dateValue.toString().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
    if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`
    return dateValue.toString()
  }

  const validateGovernorate = (g: string) => {
    const t = g?.toString().trim() || ''
    return allGovernorates.find(x => x === t || x.toLowerCase() === t.toLowerCase()) || t
  }
  const validateSecurityCompany = (c: string) => {
    const t = c?.toString().trim() || ''
    return allCompanies.find(x => x === t || x.toLowerCase() === t.toLowerCase()) || t
  }
  const validatePosition = (p: string): string | undefined => {
    const t = p?.toString().trim() || ''
    if (!t) return undefined
    return allPositions.find(x => x === t || x.toLowerCase() === t.toLowerCase()) || t
  }

  const convertToCandidates = (data: ExcelCandidate[]) => data.map(item => ({
    name: item['الاسم']?.toString().trim() || '',
    nationalId: item['الرقم_القومي']?.toString().trim().replace(/\s/g, '') || '',
    birthDate: convertDateFormat(item['تاريخ_الميلاد']),
    governorate: validateGovernorate(item['المحافظة']?.toString() || ''),
    qualification: item['المؤهل']?.toString().trim() || '',
    maritalStatus: (item['الحالة_الاجتماعية']?.toString().trim() || 'أعزب') as any,
    securityCompany: validateSecurityCompany(item['اسم_الشركة']?.toString() || ''),
    position: validatePosition(item['الوظيفة']?.toString() || ''),
    offerDate: convertDateFormat(item['تاريخ_العرض'] || ''),
    offerResult: (item['النتيجة_النهائية']?.toString().trim() || 'في انتظار') as any,
    createdBy: currentUser?.name || 'نظام',
  }))

  const convertToSavedCandidates = (data: ExcelCandidate[]) => data.map(item => ({
    name: item['الاسم']?.toString().trim() || '',
    nationalId: item['الرقم_القومي']?.toString().trim().replace(/\s/g, '') || '',
    birthDate: convertDateFormat(item['تاريخ_الميلاد']),
    governorate: validateGovernorate(item['المحافظة']?.toString() || ''),
    qualification: item['المؤهل']?.toString().trim() || '',
    maritalStatus: (item['الحالة_الاجتماعية']?.toString().trim() || 'أعزب') as any,
    securityCompany: validateSecurityCompany(item['اسم_الشركة']?.toString() || ''),
    position: validatePosition(item['الوظيفة']?.toString() || ''),
    offerDate: convertDateFormat(item['تاريخ_العرض'] || ''),
    finalResult: (item['النتيجة_النهائية']?.toString().trim() || 'مقبول') as any,
    decisionDate: convertDateFormat(item['تاريخ_القرار'] || '') || new Date().toISOString().split('T')[0],
    decisionBy: item['قرار_من']?.toString().trim() || currentUser?.name || 'مدير النظام',
    notes: item['ملاحظات']?.toString().trim() || undefined,
    isRejectedBefore: false,
    previousRejectionDate: undefined,
  }))

  // ── Validation ───────────────────────────────────────────
  const validateNationalId = (id: any) => {
    const s = id?.toString().trim().replace(/\s/g, '') || ''
    if (!s) return { valid: false, error: 'الرقم القومي مطلوب' }
    if (s.length !== 14) return { valid: false, error: `الرقم القومي يجب أن يكون 14 رقم (الحالي: ${s.length})` }
    if (!/^\d+$/.test(s)) return { valid: false, error: 'الرقم القومي يجب أن يحتوي على أرقام فقط' }
    return { valid: true }
  }

  const validateDate = (val: any, name: string, allowFuture = false) => {
    if (!val) return { valid: false, error: `${name} مطلوب` }
    const s = convertDateFormat(val)
    if (!s) return { valid: false, error: `تنسيق ${name} غير صحيح` }
    const d = new Date(s)
    if (isNaN(d.getTime())) return { valid: false, error: `تنسيق ${name} غير صحيح` }
    const today2 = new Date(); today2.setHours(0,0,0,0)
    if (!allowFuture && d > today2) return { valid: false, error: `${name} لا يمكن أن يكون في المستقبل` }
    if (name === 'تاريخ الميلاد') {
      const age = today2.getFullYear() - d.getFullYear()
      if (age < 18) return { valid: false, error: 'العمر يجب أن يكون 18 سنة على الأقل' }
      if (age > 100) return { valid: false, error: 'العمر غير معقول' }
    }
    return { valid: true, date: s }
  }

  const findDuplicatesInFile = (data: ExcelCandidate[]) => {
    const map = new Map<string, number[]>()
    data.forEach((item, i) => {
      const id = item['الرقم_القومي']?.toString().trim() || ''
      if (id) { if (!map.has(id)) map.set(id, []); map.get(id)!.push(i + 2) }
    })
    const dups = new Map<string, number[]>()
    map.forEach((rows, id) => { if (rows.length > 1) dups.set(id, rows) })
    return dups
  }

  const validateData = (data: ExcelCandidate[]) => {
    const warnings: string[] = [], errors: string[] = []
    findDuplicatesInFile(data).forEach((rows, id) => {
      errors.push(`الرقم القومي "${id}" مكرر في السطور: ${rows.join('، ')}`)
    })
    data.forEach((item, i) => {
      const row = i + 2
      if (!item['الاسم']?.toString().trim()) errors.push(`السطر ${row}: الاسم مطلوب`)
      const idV = validateNationalId(item['الرقم_القومي'])
      if (!idV.valid) errors.push(`السطر ${row}: ${idV.error}`)
      const bdV = validateDate(item['تاريخ_الميلاد'], 'تاريخ الميلاد')
      if (!bdV.valid) errors.push(`السطر ${row}: ${bdV.error}`)
      const gov = item['المحافظة']?.toString().trim() || ''
      if (!gov) errors.push(`السطر ${row}: المحافظة مطلوبة`)
      else if (!allGovernorates.some(g => g === gov || g.toLowerCase() === gov.toLowerCase()))
        warnings.push(`السطر ${row}: المحافظة "${gov}" غير موجودة في القائمة`)
      if (!item['المؤهل']?.toString().trim()) errors.push(`السطر ${row}: المؤهل مطلوب`)
      const comp = item['اسم_الشركة']?.toString().trim() || ''
      if (!comp) errors.push(`السطر ${row}: اسم الشركة مطلوب`)
      else if (!allCompanies.some(c => c === comp || c.toLowerCase() === comp.toLowerCase()))
        warnings.push(`السطر ${row}: شركة "${comp}" غير موجودة في القائمة`)
      if (!['أعزب','متزوج','مطلق','أرمل'].includes(item['الحالة_الاجتماعية']?.toString().trim()))
        errors.push(`السطر ${row}: الحالة الاجتماعية يجب أن تكون: أعزب، متزوج، مطلق، أو أرمل`)
    })
    return { valid: errors.length === 0, warnings, errors }
  }

  // ── Upload ───────────────────────────────────────────────
  const handleUpload = async () => {
    if (previewData.length === 0) return
    const validation = validateData(previewData)
    if (validation.errors.length > 0) {
      alert(`تم العثور على ${validation.errors.length} خطأ:\n\n${validation.errors.slice(0,10).join('\n')}${validation.errors.length > 10 ? `\n... و ${validation.errors.length-10} خطأ إضافي` : ''}\n\nيرجى تصحيح الأخطاء قبل المتابعة.`)
      return
    }
    if (validation.warnings.length > 0) {
      if (!window.confirm(`تم العثور على ${validation.warnings.length} تحذير:\n\n${validation.warnings.slice(0,10).join('\n')}\n\nهل تريد المتابعة؟`)) return
    }
    setIsUploading(true)
    setUploadProgress({ current: 0, total: previewData.length, stage: 'جاري التحضير...' })
    try {
      const CHUNK = 500
      if (previewData.length > CHUNK) {
        let success = 0, failed = 0; const errors: string[] = []
        const chunks = []
        for (let i = 0; i < previewData.length; i += CHUNK) chunks.push(previewData.slice(i, i + CHUNK))
        for (let ci = 0; ci < chunks.length; ci++) {
          setUploadProgress({ current: ci * CHUNK, total: previewData.length, stage: `الدفعة ${ci+1} من ${chunks.length}...` })
          const r = uploadType === 'candidates'
            ? await bulkAddCandidates(convertToCandidates(chunks[ci]))
            : await bulkAddSavedCandidates(convertToSavedCandidates(chunks[ci]))
          success += r.success; failed += r.failed; errors.push(...r.errors)
          if (ci < chunks.length - 1) await new Promise(res => setTimeout(res, 200))
        }
        setUploadProgress({ current: previewData.length, total: previewData.length, stage: 'اكتمل!' })
        setUploadResult({ success, failed, errors })
        if (success > 0) { setFile(null); setPreviewData([]); setShowPreview(false); if (fileInputRef.current) fileInputRef.current.value = '' }
      } else {
        setUploadProgress({ current: 0, total: previewData.length, stage: 'جاري الرفع...' })
        const result = uploadType === 'candidates'
          ? await bulkAddCandidates(convertToCandidates(previewData))
          : await bulkAddSavedCandidates(convertToSavedCandidates(previewData))
        setUploadProgress({ current: previewData.length, total: previewData.length, stage: 'اكتمل!' })
        setUploadResult(result)
        if (result.success > 0) { setFile(null); setPreviewData([]); setShowPreview(false); if (fileInputRef.current) fileInputRef.current.value = '' }
      }
    } catch { alert('حدث خطأ في رفع البيانات') }
    finally { setIsUploading(false); setTimeout(() => setUploadProgress({ current: 0, total: 0, stage: '' }), 2000) }
  }

  // ── Template download ────────────────────────────────────
  const downloadTemplate = () => {
    const templateData = [{
      الاسم: 'مثال: محمد أحمد علي', الرقم_القومي: '12345678901234',
      تاريخ_الميلاد: '01-01-1990', المحافظة: 'القاهرة', المؤهل: 'بكالوريوس',
      الحالة_الاجتماعية: 'أعزب', اسم_الشركة: 'ليدز للامن والحراسه',
      الوظيفة: 'فرد امن', تاريخ_العرض: '01-01-2024',
      النتيجة_النهائية: 'في انتظار', تاريخ_القرار: '', قرار_من: '', ملاحظات: ''
    }]
    const ws = XLSX.utils.json_to_sheet(templateData)
    ws['!cols'] = [25,15,15,15,15,18,25,15,15,18,15,20,30].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'المرشحين')
    XLSX.writeFile(wb, `قالب_رفع_المرشحين_${today}.xlsx`)
  }

  // ── Bulk Photo Upload ─────────────────────────────────────
  const handleBulkPhotoUpload = async (files: FileList) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) { alert('لم يتم العثور على أي صورة في الملفات المحددة'); return }
    setIsBulkPhotoUploading(true)
    setBulkPhotoProgress({ current: 0, total: imageFiles.length })
    setPhotoUploadResults(null)
    const matched: string[] = []
    const unmatched: string[] = []
    const errors: string[] = []

    const candidateMap = new Map<string, string>() // nationalId -> candidateId
    candidates.forEach(c => candidateMap.set(c.nationalId, c.id))

    for (let i = 0; i < imageFiles.length; i++) {
      const imgFile = imageFiles[i]
      setBulkPhotoProgress({ current: i + 1, total: imageFiles.length })
      const nationalId = extractNationalIdFromFileName(imgFile.name)
      if (!nationalId) {
        unmatched.push(`لم يتم استخراج رقم قومي من: "${imgFile.name}"`)
        continue
      }
      const candidateId = candidateMap.get(nationalId)
      if (!candidateId) {
        unmatched.push(`لم يتم العثور على مرشح بالرقم القومي: ${nationalId} (من: "${imgFile.name}")`)
        continue
      }
      try {
        const compressed = await compressCandidatePhoto(imgFile)
        await updateCandidate(candidateId, { photoBase64: compressed.base64 } as any)
        matched.push(`✅ ${imgFile.name} → رقم قومي: ${nationalId} (${compressed.sizeKb}KB)`)
      } catch (err: any) {
        errors.push(`خطأ في معالجة: "${imgFile.name}" - ${err.message}`)
      }
    }

    setPhotoUploadResults({ matched, unmatched, errors })
    setIsBulkPhotoUploading(false)
  }

  const resetForm = () => {
    setFile(null); setPreviewData([]); setShowPreview(false)
    setUploadResult(null); setShowAllErrors(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!canUpload) {
    return (
      <ProtectedLayout requiredPermissions={['security_employee', 'admin']}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#e74c3c' }}>غير مصرح لك بالوصول إلى هذه الصفحة</h2>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout requiredPermissions={['security_employee', 'admin']}>
      <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 60px)', direction: 'inherit' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', textAlign: 'center' }}>{t('upload.bulkTitle')}</h2>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
            {(['import', 'photos', 'export'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#1e293b' : '#64748b',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>
                {tab === 'import' ? `📥 ${t('upload.import')}` : tab === 'photos' ? '🖼️ رفع صور جماعي' : `📤 ${t('upload.export')}`}
              </button>
            ))}
          </div>

          {/* ══ PHOTOS TAB ══ */}
          {activeTab === 'photos' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                <h3 style={{ margin: '0 0 8px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GalleryHorizontalEnd size={18} /> رفع صور جماعي بالرقم القومي
                </h3>
                <p style={{ margin: 0, color: '#3730a3', fontSize: '13px', lineHeight: 1.6 }}>
                  سمِّ الصورة باسم الرقم القومي (14 رقم) جزءاً منه وسيتم ربطها تلقائياً بالمرشح.
                  <br/><strong>مثال:</strong> <code style={{ background: '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>29805121200351.jpg</code> أو <code style={{ background: '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>photo_29805121200351.png</code>
                  <br/>تُضغط الصور تلقائياً إلى ~30KB لتوفير الباقة المجانية.
                </p>
              </div>

              {/* Drop Zone */}
              <div
                style={{ border: '2px dashed #6366f1', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: '#fafaff', marginBottom: '20px', transition: 'all 0.2s' }}
                onClick={() => photosInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.background = '#ede9fe' }}
                onDragLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fafaff' }}
                onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.background = '#fafaff'; if (e.dataTransfer.files.length) handleBulkPhotoUpload(e.dataTransfer.files) }}
              >
                <ImagePlus size={36} color="#6366f1" style={{ marginBottom: 10 }} />
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#3730a3', fontSize: '15px' }}>اسحب وأفلت الصور هنا</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>أو اضغط لإختيار ملفات متعددة (JPG, PNG, WEBP ...)</p>
                <input ref={photosInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => { if (e.target.files?.length) handleBulkPhotoUpload(e.target.files) }} />
              </div>

              {/* Progress */}
              {isBulkPhotoUploading && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>جاري معالجة الصور...</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{bulkPhotoProgress.current} / {bulkPhotoProgress.total}</span>
                  </div>
                  <div style={{ height: 10, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 99, transition: 'width 0.3s', width: `${bulkPhotoProgress.total ? (bulkPhotoProgress.current / bulkPhotoProgress.total) * 100 : 0}%` }} />
                  </div>
                </div>
              )}

              {/* Results */}
              {photoUploadResults && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {photoUploadResults.matched.length > 0 && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                        <CheckCircle2 size={16} color="#16a34a" />
                        <strong style={{ color: '#15803d', fontSize: '14px' }}>تم ربط {photoUploadResults.matched.length} صورة بنجاح</strong>
                      </div>
                      <ul style={{ margin: 0, padding: '0 16px', maxHeight: 150, overflowY: 'auto' }}>
                        {photoUploadResults.matched.map((m, i) => <li key={i} style={{ fontSize: '12px', color: '#166534', marginBottom: 3 }}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  {photoUploadResults.unmatched.length > 0 && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                        <AlertTriangle size={16} color="#d97706" />
                        <strong style={{ color: '#92400e', fontSize: '14px' }}>{photoUploadResults.unmatched.length} صورة لم يتم مطابقتها</strong>
                      </div>
                      <ul style={{ margin: 0, padding: '0 16px', maxHeight: 120, overflowY: 'auto' }}>
                        {photoUploadResults.unmatched.map((m, i) => <li key={i} style={{ fontSize: '12px', color: '#78350f', marginBottom: 3 }}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  {photoUploadResults.errors.length > 0 && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                        <XCircle size={16} color="#dc2626" />
                        <strong style={{ color: '#991b1b', fontSize: '14px' }}>{photoUploadResults.errors.length} خطأ</strong>
                      </div>
                      <ul style={{ margin: 0, padding: '0 16px', maxHeight: 100, overflowY: 'auto' }}>
                        {photoUploadResults.errors.map((m, i) => <li key={i} style={{ fontSize: '12px', color: '#7f1d1d', marginBottom: 3 }}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  <button onClick={() => { setPhotoUploadResults(null); if (photosInputRef.current) photosInputRef.current.value = '' }}
                    style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, alignSelf: 'flex-start' }}>
                    رفع صور جديدة
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ EXPORT TAB ══ */}
          {activeTab === 'export' && (
            <div>
              <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}></p>
              {[
                { title: t('upload.typeNew'), count: candidates.length, flat: flatCandidates, raw: candidates, name: 'candidates' },
                { title: t('upload.typeSaved'), count: savedCandidates.length, flat: flatSaved, raw: savedCandidates, name: 'saved_candidates' },
              ].map(item => (
                <div key={item.name} style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{t('upload.recordsAvailable', '{{count}} سجل متاح للتصدير', { count: item.count })}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => exportExcel(item.flat, `${item.name}_${today}.xlsx`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}>
                      <FileSpreadsheet size={14} /> Excel
                    </button>
                    <button onClick={() => exportJSON(item.raw, `${item.name}_${today}.json`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}>
                      <FileJson size={14} /> JSON
                    </button>
                    <button onClick={() => exportCSV(item.flat, `${item.name}_${today}.csv`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}>
                      <Download size={14} /> CSV
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '16px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>📋 {t('upload.emptyTemplate', 'تحميل قالب فارغ')}</div>
                <div style={{ fontSize: '13px', color: '#3b82f6', marginBottom: '10px' }}>{t('upload.templateDesc', 'قالب Excel جاهز بالأعمدة الصحيحة للملء والاستيراد')}</div>
                <button onClick={downloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}>
                  <Download size={14} /> {t('upload.downloadTemplate', 'تحميل القالب')}
                </button>
              </div>
            </div>
          )}

          {/* ══ IMPORT TAB ══ */}
          {activeTab === 'import' && (
            <div>
              {/* نوع الرفع */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>{t('upload.dataType')}</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" name="uploadType" value="candidates" checked={uploadType === 'candidates'} onChange={e => setUploadType(e.target.value as any)} />
                    {t('upload.typeNew')}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" name="uploadType" value="saved" checked={uploadType === 'saved'} onChange={e => setUploadType(e.target.value as any)} />
                    {t('upload.typeSaved')}
                  </label>
                </div>
              </div>

              {/* JSON import */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
                <button onClick={() => jsonRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}>
                  <FileJson size={14} /> {t('upload.importJSON', 'استيراد من JSON')}
                </button>
                <input ref={jsonRef} type="file" accept=".json" onChange={handleJSONImport} style={{ display: 'none' }} aria-label={t('upload.importJSON', 'استيراد من JSON')} />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{t('upload.orExcelBelow', 'أو استخدم ملف Excel أدناه')}</span>
              </div>

              {/* Excel upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>{t('upload.chooseExcel', 'اختر ملف Excel:')}</label>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} aria-label={t('upload.chooseExcel', 'اختر ملف Excel')}
                  style={{ padding: '10px', border: '2px dashed #3498db', borderRadius: '5px', width: '100%', backgroundColor: '#f8f9fa' }} />
              </div>

              {/* Duplicate warning */}
              {previewData.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={15} color="#d97706" />
                  <span style={{ fontSize: '13px', color: '#92400e' }}>
                    <strong>تنبيه:</strong> المرشحون المكررون (نفس الرقم القومي) سيتم تحديثهم تلقائياً بدلاً من إضافتهم مرة أخرى.
                  </span>
                </div>
              )}

              {/* Instructions */}
              <div className="bulk-instructions" style={{ backgroundColor: '#e8f4fd', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px', color: '#2980b9' }}>{t('upload.excelInstructions')}:</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>{t('upload.requiredColumns')}</strong></p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>{t('upload.optionalColumns')}</strong></p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#e74c3c', fontWeight: 'bold' }}>
                  <strong>⚠️ {t('upload.warning')}</strong>
                </p>
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#2980b9' }}>{t('upload.viewLists')}</summary>
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '5px' }}>
                    <p style={{ margin: '5px 0', fontSize: '13px' }}><strong>المحافظات:</strong> {allGovernorates.join('، ')}</p>
                    <p style={{ margin: '5px 0', fontSize: '13px' }}><strong>شركات الأمن:</strong> {allCompanies.join('، ')}</p>
                    <p style={{ margin: '5px 0', fontSize: '13px' }}><strong>الوظائف:</strong> {allPositions.join('، ')}</p>
                  </div>
                </details>
              </div>

              {/* Preview */}
              {showPreview && previewData.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>{t('upload.dataPreview', 'معاينة البيانات ({{count}} سجل)', { count: previewData.length })}</h3>
                  <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                        <tr>
                          {['الاسم','الرقم_القومي','تاريخ_الميلاد','المحافظة','المؤهل','الحالة_الاجتماعية','اسم_الشركة','الوظيفة'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '2px solid #dee2e6', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 20).map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #dee2e6' }}>
                            {['الاسم','الرقم_القومي','تاريخ_الميلاد','المحافظة','المؤهل','الحالة_الاجتماعية','اسم_الشركة','الوظيفة'].map(h => (
                              <td key={h} style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{(row as any)[h] || '-'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 20 && <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '10px' }}>... و {previewData.length - 20} سجل إضافي</p>}
                  </div>
                </div>
              )}

              {/* Progress */}
              {isUploading && uploadProgress.total > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#2c3e50' }}>{uploadProgress.stage}</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{uploadProgress.current} / {uploadProgress.total}</span>
                  </div>
                  <div style={{ width: '100%', height: '25px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%`, height: '100%', backgroundColor: '#27ae60', transition: 'width 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                      {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {showPreview && (
                  <button onClick={handleUpload} disabled={isUploading}
                    style={{ backgroundColor: isUploading ? '#95a5a6' : '#27ae60', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '5px', cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold', fontFamily: 'inherit' }}>
                    {isUploading ? '...' : t('upload.import')}
                  </button>
                )}
                <button onClick={resetForm} style={{ backgroundColor: '#95a5a6', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit' }}>
                  {t('upload.reset')}
                </button>
              </div>

              {/* Results */}
              {uploadResult && (
                <div style={{ marginTop: '20px', padding: '20px', borderRadius: '8px', backgroundColor: uploadResult.failed > 0 ? '#f8d7da' : '#d4edda', border: `2px solid ${uploadResult.failed > 0 ? '#f5c6cb' : '#c3e6cb'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: uploadResult.failed > 0 ? '#721c24' : '#155724', fontSize: '18px' }}>📊 نتائج الرفع</h4>
                    {uploadResult.errors.length > 0 && (
                      <button onClick={() => { const b = new Blob([uploadResult.errors.join('\n')], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `errors_${today}.txt`; a.click() }}
                        style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>
                        📥 تصدير الأخطاء
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <div style={{ padding: '10px 15px', backgroundColor: 'white', borderRadius: '5px', border: '1px solid #c3e6cb', minWidth: '150px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>✅ {uploadResult.success}</div>
                      <div style={{ fontSize: '12px', color: '#155724' }}>نجح</div>
                    </div>
                    {uploadResult.failed > 0 && (
                      <div style={{ padding: '10px 15px', backgroundColor: 'white', borderRadius: '5px', border: '1px solid #f5c6cb', minWidth: '150px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>❌ {uploadResult.failed}</div>
                        <div style={{ fontSize: '12px', color: '#721c24' }}>فشل</div>
                      </div>
                    )}
                  </div>
                  {uploadResult.errors.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h5 style={{ margin: 0, color: '#721c24' }}>⚠️ الأخطاء ({uploadResult.errors.length})</h5>
                        {uploadResult.errors.length > 10 && (
                          <button onClick={() => setShowAllErrors(!showAllErrors)}
                            style={{ backgroundColor: 'transparent', border: '1px solid #721c24', color: '#721c24', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>
                            {showAllErrors ? 'إخفاء' : `عرض الكل (${uploadResult.errors.length})`}
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: showAllErrors ? 'none' : '300px', overflowY: 'auto', backgroundColor: 'white', borderRadius: '5px', padding: '10px', border: '1px solid #f5c6cb' }}>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {(showAllErrors ? uploadResult.errors : uploadResult.errors.slice(0, 10)).map((err, i) => {
                            const m = err.match(/السطر (\d+)/); const row = m ? m[1] : null
                            return (
                              <li key={i} style={{ fontSize: '13px', color: '#721c24', marginBottom: '8px', padding: '8px', backgroundColor: '#fff5f5', borderRadius: '4px', borderLeft: '3px solid #dc3545' }}>
                                {row && <span style={{ fontWeight: 'bold', color: '#dc3545' }}>السطر {row}: </span>}
                                {err.replace(/السطر \d+: /, '')}
                              </li>
                            )
                          })}
                        </ul>
                        {!showAllErrors && uploadResult.errors.length > 10 && (
                          <div style={{ textAlign: 'center', padding: '10px', color: '#721c24', fontSize: '12px' }}>... و {uploadResult.errors.length - 10} خطأ إضافي</div>
                        )}
                      </div>
                    </div>
                  )}
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
