import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import ProtectedLayout from '../components/ProtectedLayout'
import * as XLSX from 'xlsx'

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
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
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

  const convertToCandidates = (data: ExcelCandidate[]) => {
    return data.map(item => ({
      name: item.الاسم?.toString() || '',
      nationalId: item.الرقم_القومي?.toString() || '',
      birthDate: convertDateFormat(item.تاريخ_الميلاد),
      governorate: item.المحافظة?.toString() || '',
      qualification: item.المؤهل?.toString() || '',
      maritalStatus: (item.الحالة_الاجتماعية?.toString() || 'أعزب') as 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل',
      securityCompany: item.اسم_الشركة?.toString() || '',
      position: item.الوظيفة?.toString() || undefined,
      offerDate: convertDateFormat(item.تاريخ_العرض || ''),
      offerResult: (item.النتيجة_النهائية?.toString() || 'في انتظار') as 'مقبول' | 'مرفوض' | 'مستبعد' | 'في انتظار'
    }))
  }

  const convertToSavedCandidates = (data: ExcelCandidate[]) => {
    return data.map(item => ({
      name: item.الاسم?.toString() || '',
      nationalId: item.الرقم_القومي?.toString() || '',
      birthDate: convertDateFormat(item.تاريخ_الميلاد),
      governorate: item.المحافظة?.toString() || '',
      qualification: item.المؤهل?.toString() || '',
      maritalStatus: (item.الحالة_الاجتماعية?.toString() || 'أعزب') as 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل',
      securityCompany: item.اسم_الشركة?.toString() || '',
      position: item.الوظيفة?.toString() || undefined,
      offerDate: convertDateFormat(item.تاريخ_العرض || ''),
      finalResult: (item.النتيجة_النهائية?.toString() || 'مقبول') as 'مقبول' | 'مرفوض' | 'مستبعد',
      decisionDate: convertDateFormat(item.تاريخ_القرار || '') || new Date().toISOString().split('T')[0],
      decisionBy: item.قرار_من?.toString() || currentUser?.name || 'مدير النظام',
      notes: item.ملاحظات?.toString() || undefined,
      isRejectedBefore: false,
      previousRejectionDate: undefined
    }))
  }

  // رفع البيانات
  const handleUpload = async () => {
    if (!file || previewData.length === 0) return

    setIsUploading(true)
    try {
      let result
      if (uploadType === 'candidates') {
        const candidates = convertToCandidates(previewData)
        result = await bulkAddCandidates(candidates)
      } else {
        const savedCandidates = convertToSavedCandidates(previewData)
        result = await bulkAddSavedCandidates(savedCandidates)
      }

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
    } catch (error) {
      console.error('خطأ في رفع البيانات:', error)
      alert('حدث خطأ في رفع البيانات')
    } finally {
      setIsUploading(false)
    }
  }

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFile(null)
    setPreviewData([])
    setShowPreview(false)
    setUploadResult(null)
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
            <h4 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>تعليمات تنسيق ملف Excel:</h4>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>الأعمدة المطلوبة:</strong> الاسم، الرقم_القومي، تاريخ_الميلاد، المحافظة، المؤهل، الحالة_الاجتماعية، اسم_الشركة
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>الأعمدة الاختيارية:</strong> الوظيفة، تاريخ_العرض، النتيجة_النهائية، تاريخ_القرار، قرار_من، ملاحظات
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>ملاحظة:</strong> يجب أن تكون الأعمدة في الصف الأول من الملف
            </p>
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
              padding: '15px',
              borderRadius: '5px',
              backgroundColor: uploadResult.failed > 0 ? '#f8d7da' : '#d4edda',
              border: `1px solid ${uploadResult.failed > 0 ? '#f5c6cb' : '#c3e6cb'}`
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: uploadResult.failed > 0 ? '#721c24' : '#155724' }}>
                نتائج الرفع:
              </h4>
              <p style={{ margin: '5px 0', color: uploadResult.failed > 0 ? '#721c24' : '#155724' }}>
                ✅ نجح: {uploadResult.success} سجل
              </p>
              <p style={{ margin: '5px 0', color: uploadResult.failed > 0 ? '#721c24' : '#155724' }}>
                ❌ فشل: {uploadResult.failed} سجل
              </p>
              {uploadResult.errors.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <h5 style={{ margin: '0 0 5px 0', color: '#721c24' }}>أخطاء:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {uploadResult.errors.map((error, index) => (
                      <li key={index} style={{ fontSize: '12px', color: '#721c24' }}>
                        {error}
                      </li>
                    ))}
                  </ul>
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
