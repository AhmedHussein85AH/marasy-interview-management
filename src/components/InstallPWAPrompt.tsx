import React, { useState, useEffect } from 'react'
import { Smartphone, Download, X } from 'lucide-react'

export const InstallPWAPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      console.log('Marassi PWA installed successfully')
    }
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: '90%',
      maxWidth: '420px',
      background: 'linear-gradient(135deg, #3d1a78 0%, #6d28d9 100%)',
      color: '#fff',
      borderRadius: '16px',
      padding: '12px 18px',
      boxShadow: '0 12px 36px rgba(109, 40, 217, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      direction: 'rtl'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Smartphone size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '13px' }}>تثبيت تطبيق Marassi</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>ثبّت التطبيق على الموبايل للوصول السريع</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: '#fff',
            color: '#6d28d9',
            border: 'none',
            borderRadius: '10px',
            padding: '7px 14px',
            fontWeight: 800,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Download size={14} /> تثبيت
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default InstallPWAPrompt
