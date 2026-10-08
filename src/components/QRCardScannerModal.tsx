import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, Image, CheckCircle2, AlertTriangle, UserCheck, Eye, RefreshCw, Sparkles, Building2, MapPin, Clock, ShieldCheck, SwitchCamera } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { Candidate, SavedCandidate } from '../store/types'

interface QRCardScannerModalProps {
  onClose: () => void
  onSelectCandidate?: (candidate: any) => void
  onViewIDCard?: (candidate: any) => void
}

/**
 * صوت تنبيه خفيف عند نجاح القراءة عبر Web Audio API (يعمل محلياً 100%)
 */
function playSuccessBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // نغمة A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  } catch {
    // تجاهل في حالة عدم دعم المتصفح
  }
}

export const QRCardScannerModal: React.FC<QRCardScannerModalProps> = ({
  onClose,
  onSelectCandidate,
  onViewIDCard,
}) => {
  const { candidates, savedCandidates } = useStore()
  const [scanMode, setScanMode] = useState<'camera' | 'file'>('camera')
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [isScanning, setIsScanning] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const [scannedResult, setScannedResult] = useState<{
    rawText: string
    candidate: Candidate | SavedCandidate | null
    isDatabaseCandidate?: boolean
  } | null>(null)

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerId = 'qr-reader-container'

  // معالجة النص المقروء
  const handleDecodedText = (decodedText: string) => {
    playSuccessBeep()
    // إيقاف الكاميرا مؤقتاً
    stopCamera()

    // استخراج الرقم القومي أو المعرف
    // 1. محاولة استخراج رقم قومي (14 رقم)
    const nationalIdMatch = decodedText.match(/\b\d{14}\b/)
    const nationalId = nationalIdMatch ? nationalIdMatch[0] : null

    // 2. محاولة استخراج المعرف UUID
    const idMatch = decodedText.match(/كود التحقق:\s*([A-Za-z0-9-]+)/) || decodedText.match(/"id":\s*"([^"]+)"/)
    const candidateId = idMatch ? idMatch[1] : null

    // البحث في قائمة المقابلات أولاً
    let found: any = null
    let isDb = false

    if (nationalId) {
      found = candidates.find(c => c.nationalId === nationalId)
      if (!found) {
        found = savedCandidates.find(c => c.nationalId === nationalId)
        if (found) isDb = true
      }
    }

    if (!found && candidateId) {
      found = candidates.find(c => c.id.toLowerCase().startsWith(candidateId.toLowerCase()))
      if (!found) {
        found = savedCandidates.find(c => c.id.toLowerCase().startsWith(candidateId.toLowerCase()))
        if (found) isDb = true
      }
    }

    // إذا لم يطابق بالرقم، ابحث بالاسم
    if (!found) {
      const nameMatch = decodedText.match(/الاسم:\s*([^\n\r,]+)/) || decodedText.match(/"name":\s*"([^"]+)"/)
      if (nameMatch && nameMatch[1]) {
        const cleanName = nameMatch[1].trim()
        found = candidates.find(c => c.name.includes(cleanName) || cleanName.includes(c.name))
        if (!found) {
          found = savedCandidates.find(c => c.name.includes(cleanName) || cleanName.includes(c.name))
          if (found) isDb = true
        }
      }
    }

    setScannedResult({
      rawText: decodedText,
      candidate: found || null,
      isDatabaseCandidate: isDb,
    })
  }

  // تشغيل الكاميرا
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setScannerError(null)
    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop()
        } catch {}
      }

      const qrScanner = new Html5Qrcode(containerId)
      html5QrCodeRef.current = qrScanner

      await qrScanner.start(
        { facingMode: mode }, // افتراضياً الكاميرا الخلفية (environment)
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecodedText(decodedText)
        },
        () => {
          // جاري المسح المستمر
        }
      )
      setIsScanning(true)
    } catch (err: any) {
      console.error('Camera QR Scan Error:', err)
      setIsScanning(false)
      setScannerError('تعذر تشغيل الكاميرا. يرجى التأكد من إعطاء إذن الكاميرا في المتصفح.')
    }
  }

  // تبديل بين الكاميرا الخلفية والأمامية
  const handleToggleFacingMode = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
    await stopCamera()
    setTimeout(() => {
      startCamera(nextMode)
    }, 200)
  }

  // إيقاف الكاميرا
  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop()
      } catch {}
    }
    setIsScanning(false)
  }

  // تشغيل الكاميرا عند الفتح إذا كان الوضع camera
  useEffect(() => {
    if (scanMode === 'camera' && !scannedResult) {
      const timer = setTimeout(() => {
        startCamera(facingMode)
      }, 300)
      return () => {
        clearTimeout(timer)
        stopCamera()
      }
    } else {
      stopCamera()
    }
  }, [scanMode, scannedResult])

  // تنظيف الكاميرا عند إغلاق المودال
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop()
        } catch {}
      }
    }
  }, [])

  // فحص ملف صورة
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScannerError(null)
    try {
      const qrScanner = new Html5Qrcode('qr-file-temp')
      const result = await qrScanner.scanFile(file, true)
      handleDecodedText(result)
    } catch (err: any) {
      console.error('QR File Scan Error:', err)
      setScannerError('لم يتم العثور على رمز QR صالح داخل الصورة المرفوعة. يرجى التأكد من وضوح الكود.')
    }
  }

  // إعادة المسح
  const handleResetScan = () => {
    setScannedResult(null)
    setScannerError(null)
    if (scanMode === 'camera') {
      setTimeout(() => startCamera(), 200)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopCamera()
          onClose()
        }
      }}
    >
      <div
        style={{
          background: 'hsl(var(--card))',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '480px',
          border: '1px solid hsl(var(--border))',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* الهيدر */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, hsl(262 72% 40%), hsl(280 70% 50%))',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>ماسح كروت الهوية الرقمية</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>فحص وتحقق فوري من داخل النظام</div>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera()
              onClose()
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* التبديل بين الكاميرا ورفع الصورة (لو لم يتم الفحص بعد) */}
        {!scannedResult && (
          <div
            style={{
              display: 'flex',
              padding: '12px 16px 0',
              gap: '8px',
              background: 'hsl(var(--muted)/0.3)',
              borderBottom: '1px solid hsl(var(--border))',
            }}
          >
            <button
              type="button"
              onClick={() => setScanMode('camera')}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                background: scanMode === 'camera' ? 'hsl(var(--card))' : 'transparent',
                color: scanMode === 'camera' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                fontWeight: scanMode === 'camera' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderBottom: scanMode === 'camera' ? '2px solid hsl(var(--primary))' : 'none',
                fontFamily: 'inherit',
              }}
            >
              <Camera size={16} /> فحص بالكاميرا الحية
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera()
                setScanMode('file')
              }}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                background: scanMode === 'file' ? 'hsl(var(--card))' : 'transparent',
                color: scanMode === 'file' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                fontWeight: scanMode === 'file' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderBottom: scanMode === 'file' ? '2px solid hsl(var(--primary))' : 'none',
                fontFamily: 'inherit',
              }}
            >
              <Image size={16} /> رفع صورة / سكان
            </button>
          </div>
        )}

        {/* محتوى المسح أو النتيجة */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {/* 1. حالة وجود نتيجة تم مسحها بنجاح */}
          {scannedResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'scaleIn 0.25s ease' }}>
              {/* شارة النجاح */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: scannedResult.candidate ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${scannedResult.candidate ? '#10b981' : '#f59e0b'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {scannedResult.candidate ? (
                  <CheckCircle2 size={24} color="#10b981" />
                ) : (
                  <AlertTriangle size={24} color="#f59e0b" />
                )}
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '14px',
                      color: scannedResult.candidate ? '#10b981' : '#f59e0b',
                    }}
                  >
                    {scannedResult.candidate
                      ? scannedResult.isDatabaseCandidate
                        ? '✅ بطاقة صالحة وموثقة في قاعدة البيانات المعتمدة'
                        : '✅ مرشح مسجل في قائمة المقابلات'
                      : '⚠️ تم مسح الكود بنجاح (غير مسجل حالياً بالنظام)'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                    تمت مطابقة البيانات بالكامل محلياً
                  </div>
                </div>
              </div>

              {/* تفاصيل المرشح المتطابق */}
              {scannedResult.candidate && (
                <div
                  style={{
                    borderRadius: '16px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--muted)/0.25)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '12px',
                        background: 'hsl(var(--primary))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '20px',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {(scannedResult.candidate as any).photoBase64 ? (
                        <img
                          src={(scannedResult.candidate as any).photoBase64}
                          alt={scannedResult.candidate.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        scannedResult.candidate.name.charAt(0)
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: 'hsl(var(--foreground))' }}>
                        {scannedResult.candidate.name}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'hsl(var(--muted-foreground))', fontFamily: 'monospace' }}>
                        {scannedResult.candidate.nationalId}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '99px',
                            background:
                              (scannedResult.candidate as any).offerResult === 'مقبول' || (scannedResult.candidate as any).finalResult === 'مقبول'
                                ? '#10b98120'
                                : (scannedResult.candidate as any).offerResult === 'مرفوض' || (scannedResult.candidate as any).finalResult === 'مرفوض'
                                ? '#ef444420'
                                : '#f59e0b20',
                            color:
                              (scannedResult.candidate as any).offerResult === 'مقبول' || (scannedResult.candidate as any).finalResult === 'مقبول'
                                ? '#10b981'
                                : (scannedResult.candidate as any).offerResult === 'مرفوض' || (scannedResult.candidate as any).finalResult === 'مرفوض'
                                ? '#ef4444'
                                : '#f59e0b',
                          }}
                        >
                          {(scannedResult.candidate as any).offerResult || (scannedResult.candidate as any).finalResult || 'في انتظار'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border))' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px' }}>
                    <div>
                      <span style={{ color: 'hsl(var(--muted-foreground))' }}>الشركة: </span>
                      <strong style={{ color: 'hsl(var(--foreground))' }}>{scannedResult.candidate.securityCompany || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(var(--muted-foreground))' }}>الوظيفة: </span>
                      <strong style={{ color: 'hsl(var(--foreground))' }}>{scannedResult.candidate.position || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(var(--muted-foreground))' }}>الوردية: </span>
                      <strong style={{ color: 'hsl(var(--foreground))' }}>{(scannedResult.candidate as any).workShift || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(var(--muted-foreground))' }}>المحافظة: </span>
                      <strong style={{ color: 'hsl(var(--foreground))' }}>{scannedResult.candidate.governorate || '—'}</strong>
                    </div>
                    {((scannedResult.candidate as any).workLocation || scannedResult.candidate.notes?.includes('الموقع:')) && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>الموقع / المنشأة: </span>
                        <strong style={{ color: '#10b981' }}>
                          {(scannedResult.candidate as any).workLocation ||
                            scannedResult.candidate.notes?.match(/الموقع:\s*([^|]+)/)?.[1]?.trim() ||
                            '—'}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* النص الخام للكود */}
              <div
                style={{
                  background: 'hsl(var(--muted)/0.5)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>
                  البيانات المقروءة من الـ QR:
                </div>
                <pre
                  style={{
                    margin: 0,
                    fontSize: '11.5px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'inherit',
                    color: 'hsl(var(--foreground))',
                    maxHeight: '100px',
                    overflowY: 'auto',
                  }}
                >
                  {scannedResult.rawText}
                </pre>
              </div>

              {/* أزرار الإجراءات */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {scannedResult.candidate && onSelectCandidate && (
                  <button
                    onClick={() => {
                      onSelectCandidate(scannedResult.candidate)
                      onClose()
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontFamily: 'inherit',
                    }}
                  >
                    <Eye size={15} /> فتح ملف المرشح
                  </button>
                )}

                {scannedResult.candidate && onViewIDCard && (
                  <button
                    onClick={() => {
                      onViewIDCard(scannedResult.candidate)
                      onClose()
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, hsl(262 72% 45%), hsl(280 70% 50%))',
                      color: 'white',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontFamily: 'inherit',
                    }}
                  >
                    <UserCheck size={15} /> عرض بطاقة الهوية
                  </button>
                )}

                <button
                  onClick={handleResetScan}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontFamily: 'inherit',
                  }}
                >
                  <RefreshCw size={15} /> مسح كارت آخر
                </button>
              </div>
            </div>
          ) : (
            /* 2. وضع المسح بالكاميرا أو الملف */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {scanMode === 'camera' ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '320px',
                      height: '280px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#000',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                      border: '2px solid hsl(var(--primary))',
                    }}
                  >
                    <div id={containerId} style={{ width: '100%', height: '100%' }} />

                    {/* ليزر مسح ديكوري */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #8b5cf6, #ec4899, transparent)',
                        boxShadow: '0 0 12px #8b5cf6',
                        animation: 'scanLaser 2s linear infinite',
                        pointerEvents: 'none',
                        zIndex: 10,
                      }}
                    />

                    {/* زر تبديل الكاميرا */}
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      title="تبديل الكاميرا (خلفية / أمامية)"
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        zIndex: 20,
                        background: 'rgba(0,0,0,0.65)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '20px',
                        color: 'white',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <SwitchCamera size={14} />
                      <span>{facingMode === 'environment' ? 'الكاميرا الخلفية 📱' : 'الكاميرا الأمامية 🤳'}</span>
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: '12.5px',
                      color: 'hsl(var(--muted-foreground))',
                      textAlign: 'center',
                      marginTop: '12px',
                    }}
                  >
                    وجّه كاميرا الموبايل مباشرة نحو الـ QR Code الموجود على كارت الهوية
                  </p>
                </div>
              ) : (
                /* وضع رفع ملف */
                <div style={{ width: '100%' }}>
                  <div id="qr-file-temp" style={{ display: 'none' }} />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed hsl(var(--primary)/0.5)',
                      borderRadius: '16px',
                      padding: '36px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'hsl(var(--primary)/0.03)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary))')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary)/0.5)')}
                  >
                    <Image size={40} color="#8b5cf6" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'hsl(var(--foreground))', marginBottom: '4px' }}>
                      اضغط لاختيار صورة الكارت أو سكان
                    </div>
                    <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                      يدعم صور JPG, PNG, WebP
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              )}

              {/* عرض رسالة الخطأ إن وجدت */}
              {scannerError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{scannerError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 96%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default QRCardScannerModal
