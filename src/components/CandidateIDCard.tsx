import React, { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Printer, Share2, BadgeCheck } from 'lucide-react'

interface CandidateIDCardProps {
  candidate: {
    id: string
    name: string
    nationalId: string
    birthDate?: string
    governorate?: string
    qualification?: string
    securityCompany?: string
    position?: string
    workShift?: string
    workLocation?: string
    location?: string
    offerDate?: string
    offerResult?: string
    notes?: string
    photoBase64?: string | null
  }
  onClose: () => void
}

/**
 * استخراج الموقع أو المنشأة
 */
function extractLocation(candidate: CandidateIDCardProps['candidate']): string {
  if (candidate.workLocation) return candidate.workLocation
  if (candidate.location) return candidate.location
  if (candidate.notes) {
    const match = candidate.notes.match(/الموقع:\s*([^|]+)/)
    if (match && match[1]) return match[1].trim()
  }
  return '—'
}

/**
 * حساب العمر من تاريخ الميلاد
 */
function calcAge(birthDate?: string): string {
  if (!birthDate) return '—'
  const diff = Date.now() - new Date(birthDate).getTime()
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  return `${age} سنة`
}

/**
 * تنسيق التاريخ للعرض
 */
function fmtDate(d?: string): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return d
  }
}

const CandidateIDCard: React.FC<CandidateIDCardProps> = ({ candidate, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const candidateLocation = extractLocation(candidate)

  // بيانات الـ QR — نص عربي منسق وقابل للقراءة فوراً بكاميرا أي موبايل بدون إنترنت
  const qrData = [
    '✦ بطاقة هوية واعتماد أمني ✦',
    `الاسم: ${candidate.name}`,
    `الرقم القومي: ${candidate.nationalId}`,
    `الشركة: ${candidate.securityCompany || '—'}`,
    `الوظيفة: ${candidate.position || 'موظف أمن'}`,
    `الموقع: ${candidateLocation}`,
    `الوردية: ${candidate.workShift || '—'}`,
    `تاريخ الاعتماد: ${fmtDate(candidate.offerDate)}`,
    `الحالة: ${candidate.offerResult === 'مرفوض' ? '❌ مرفوض' : candidate.offerResult === 'مستبعد' ? '⚠️ مستبعد' : '✅ مقبول ومطابق'}`,
    `كود التحقق: ${candidate.id?.slice(0, 8).toUpperCase() || 'Marassi'}`,
  ].join('\n')

  const handlePrint = () => {
    if (!cardRef.current) return
    const printWindow = window.open('', '_blank', 'width=700,height=600')
    if (!printWindow) return

    const cardHTML = cardRef.current.innerHTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>كارت هوية — ${candidate.name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            background: #f3f0ff;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; padding: 24px;
          }
          .card-print { width: 380px; }
          @media print {
            body { background: white; }
            .card-print { box-shadow: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="card-print">${cardHTML}</div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleShare = async () => {
    const text = `🪪 كارت هوية موظف — ${candidate.name}\n🏢 ${candidate.securityCompany}\n💼 ${candidate.position || '—'}\n📍 الموقع: ${candidateLocation}\n🌙 وردية: ${candidate.workShift || '—'}\n✅ النظام: Marassi`
    if (navigator.share) {
      await navigator.share({ title: `كارت ${candidate.name}`, text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('تم نسخ البيانات للحافظة')
    }
  }

  const shiftColor = candidate.workShift === 'ليل' ? '#1e1b4b' : '#92400e'
  const shiftBg = candidate.workShift === 'ليل' ? '#ede9fe' : '#fef3c7'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'hsl(var(--background))',
        borderRadius: '20px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '420px',
        animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* شريط أدوات أعلى */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'linear-gradient(135deg, hsl(262 72% 40%), hsl(280 70% 50%))',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
            <BadgeCheck size={18} />
            كارت هوية رقمي
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleShare} title="مشاركة" style={toolBtnStyle}>
              <Share2 size={15} />
            </button>
            <button onClick={handlePrint} title="طباعة" style={toolBtnStyle}>
              <Printer size={15} />
            </button>
            <button onClick={onClose} title="إغلاق" style={{ ...toolBtnStyle, background: 'rgba(255,255,255,0.15)' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── الكارت الفعلي (ده اللي هيتطبع) ── */}
        <div ref={cardRef} style={{
          margin: '20px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(109,40,217,0.18)',
          border: '1px solid hsl(262 50% 88%)',
          background: '#fff',
          direction: 'rtl',
        }}>

          {/* رأس الكارت */}
          <div style={{
            background: 'linear-gradient(135deg, hsl(262 72% 36%) 0%, hsl(280 70% 48%) 100%)',
            padding: '20px 20px 14px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* دوائر خلفية ديكور */}
            <div style={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: -30, right: -10, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
              {/* Avatar or Photo */}
              <div style={{
                width: 58, height: 58, borderRadius: '14px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', fontWeight: 900, flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.4)',
                overflow: 'hidden',
              }}>
                {candidate.photoBase64 ? (
                  <img
                    src={candidate.photoBase64}
                    alt={candidate.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  candidate.name.charAt(0)
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: '17px', lineHeight: 1.2, marginBottom: '4px' }}>
                  {candidate.name}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '6px' }}>
                  {candidate.position || 'موظف أمن'} — {candidate.securityCompany || '—'}
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(255,255,255,0.18)', borderRadius: '20px',
                  padding: '2px 10px', fontSize: '11px', fontWeight: 700,
                }}>
                  ✅ مقبول
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* صف معلومات */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <InfoRow label="الرقم القومي" value={candidate.nationalId} mono />
              <InfoRow label="العمر" value={calcAge(candidate.birthDate)} />
              <InfoRow label="الموقع / المنشأة" value={candidateLocation} />
              <InfoRow label="المحافظة" value={candidate.governorate} />
              <InfoRow label="المؤهل" value={candidate.qualification} />
              <InfoRow label="تاريخ التعيين" value={fmtDate(candidate.offerDate)} />
              <InfoRow label="الوردية" value={candidate.workShift || '—'} badge badgeColor={shiftColor} badgeBg={shiftBg} />
            </div>

            {/* فاصل */}
            <div style={{ height: '1px', background: 'hsl(262 40% 92%)', margin: '4px 0' }} />

            {/* QR Code */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                padding: '8px', borderRadius: '12px',
                background: 'hsl(262 30% 97%)',
                border: '1px solid hsl(262 40% 88%)',
                flexShrink: 0,
              }}>
                <QRCodeSVG
                  value={qrData}
                  size={80}
                  fgColor="hsl(262, 72%, 35%)"
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'hsl(262 60% 40%)', marginBottom: '4px' }}>
                  كود التحقق الرقمي
                </div>
                <div style={{ fontSize: '10px', color: 'hsl(262 20% 55%)', lineHeight: 1.5 }}>
                  امسح الكود لعرض ملف<br />المرشح في نظام Marassi
                </div>
                <div style={{
                  marginTop: '6px',
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  color: 'hsl(262 30% 60%)',
                  background: 'hsl(262 20% 96%)',
                  padding: '2px 6px', borderRadius: '6px',
                  letterSpacing: '0.5px',
                }}>
                  {candidate.id?.slice(0, 16).toUpperCase() || 'Marassi-ID'}
                </div>
              </div>
            </div>

          </div>

          {/* تذييل الكارت */}
          <div style={{
            background: 'linear-gradient(135deg, hsl(262 72% 36%), hsl(280 70% 48%))',
            padding: '8px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: 'rgba(255,255,255,0.75)',
            fontSize: '10px',
          }}>
            <span style={{ fontWeight: 800, letterSpacing: '1px', color: '#fff', fontSize: '11px' }}>
              ✦ Marassi
            </span>
            <span>نظام إدارة التوظيف الأمني</span>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── مكون خلية المعلومات ── */
interface InfoRowProps {
  label: string
  value?: string
  mono?: boolean
  badge?: boolean
  badgeColor?: string
  badgeBg?: string
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, mono, badge, badgeColor = '#1e1b4b', badgeBg = '#ede9fe' }) => (
  <div>
    <div style={{ fontSize: '9px', fontWeight: 700, color: 'hsl(262 30% 60%)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
      {label}
    </div>
    {badge ? (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        background: badgeBg, color: badgeColor,
        borderRadius: '20px', padding: '2px 10px',
        fontSize: '12px', fontWeight: 700,
      }}>
        {value === 'ليل' ? '🌙' : '☀️'} {value}
      </span>
    ) : (
      <div style={{
        fontSize: '13px',
        fontWeight: 700,
        color: 'hsl(262 20% 20%)',
        fontFamily: mono ? 'monospace' : 'inherit',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {value || '—'}
      </div>
    )}
  </div>
)

const toolBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  color: '#fff',
  width: '32px', height: '32px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s',
}

export default CandidateIDCard
