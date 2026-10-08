import React, { useState } from 'react'
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react'
import { useVoiceSearch, VoiceCommandResult } from '../hooks/useVoiceSearch'

interface VoiceSearchButtonProps {
  onCommand: (result: VoiceCommandResult) => void
  placeholder?: string
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({ onCommand }) => {
  const [lastFeedback, setLastFeedback] = useState<string | null>(null)

  const handleResult = (result: VoiceCommandResult) => {
    onCommand(result)
    
    let feedback = `تم التقاط: "${result.transcript}"`
    if (result.intent === 'filter_status') feedback += ` ← تصفية: ${result.value}`
    else if (result.intent === 'filter_shift') feedback += ` ← وردية: ${result.value}`
    else if (result.intent === 'reset') feedback = 'تم إعادة ضبط جميع الفلاتر'

    setLastFeedback(feedback)
    setTimeout(() => setLastFeedback(null), 3500)
  }

  const { isListening, isSupported, error, startListening } = useVoiceSearch(handleResult)

  if (!isSupported) return null

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={startListening}
        title="البحث بالأوامر الصوتية بالعامية المصرية 🎙️"
        style={{
          background: isListening
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, hsl(262 72% 48%), hsl(280 70% 55%))',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.6)' : '0 4px 12px rgba(108, 63, 197, 0.25)',
          transition: 'all 0.3s ease',
          animation: isListening ? 'pulse 1.2s infinite' : 'none'
        }}
      >
        <Mic size={16} />
        <span>{isListening ? 'جاري الاستماع...' : 'بحث صوتي 🎙️'}</span>
      </button>

      {/* Popover Feedback */}
      {lastFeedback && (
        <div style={{
          position: 'absolute',
          top: '110%',
          right: 0,
          zIndex: 999,
          background: 'rgba(30, 27, 75, 0.95)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          animation: 'fadeInUp 0.3s ease'
        }}>
          <Sparkles size={13} color="#a7f3d0" />
          <span>{lastFeedback}</span>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: '110%',
          right: 0,
          zIndex: 999,
          background: '#fee2e2',
          color: '#b91c1c',
          padding: '6px 10px',
          borderRadius: '8px',
          fontSize: '11px',
          whiteSpace: 'nowrap',
          border: '1px solid #fca5a5'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default VoiceSearchButton
