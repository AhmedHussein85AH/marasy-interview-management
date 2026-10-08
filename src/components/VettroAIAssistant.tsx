import React, { useState, useMemo } from 'react'
import {
  Sparkles, Bot, AlertTriangle, CheckCircle, Send, X, ChevronRight,
  ShieldAlert, ShieldCheck, Building2, FileText, HelpCircle, RefreshCw,
  Printer, Copy, Check, MessageSquare, TrendingUp, Users, Award,
  BookOpen, Search, ChevronDown
} from 'lucide-react'
import { useStore } from '../store/useStore'
import {
  MarassiAI,
  AIAnalysisResult,
  SmartAlert,
  VendorRating,
  AnomalyReport,
  ExecutiveReport,
  GuideTopic,
  SYSTEM_USER_GUIDE
} from '../utils/aiAnalyzer'
import type { Candidate } from '../store/types'

interface MarassiAIAssistantProps {
  selectedCandidate?: Candidate | null
}

export const MarassiAIAssistant: React.FC<MarassiAIAssistantProps> = ({ selectedCandidate }) => {
  const { candidates, savedCandidates } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'guide' | 'radar' | 'vendors' | 'executive' | 'candidate'>('chat')
  const [guideSearch, setGuideSearch] = useState('')
  const [guideCategoryFilter, setGuideCategoryFilter] = useState<string>('all')
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [copiedText, setCopiedText] = useState(false)
  const [selectedLetterType, setSelectedLetterType] = useState<'acceptance' | 'exclusion' | 'rejection'>('acceptance')
  const [customLetterReason, setCustomLetterReason] = useState('')
  
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: 'مرحباً بك! أنا Marassi AI — المستشار الأمني والتحليلي الذكي. كيف يمكنني مساعدتك في المقابلات أو تقييم الشركات أو كشف المخاطر اليوم؟'
    }
  ])

  // التحليلات المولدة لحظياً
  const alerts: SmartAlert[] = useMemo(() => MarassiAI.generateSmartAlerts(candidates, savedCandidates), [candidates, savedCandidates])
  const anomalies: AnomalyReport = useMemo(() => MarassiAI.detectAnomalies(candidates, savedCandidates), [candidates, savedCandidates])
  const vendorRatings: VendorRating[] = useMemo(() => MarassiAI.rateSecurityVendors(savedCandidates, candidates), [savedCandidates, candidates])
  const executiveReport: ExecutiveReport = useMemo(() => MarassiAI.generateExecutiveReport(candidates, savedCandidates), [candidates, savedCandidates])

  const currentAnalysis: AIAnalysisResult | null = useMemo(() => {
    return selectedCandidate
      ? MarassiAI.analyzeCandidate(selectedCandidate, candidates, savedCandidates)
      : candidates.length > 0
      ? MarassiAI.analyzeCandidate(candidates[0], candidates, savedCandidates)
      : null
  }, [selectedCandidate, candidates, savedCandidates])

  const targetCandidateForLetter = selectedCandidate || (candidates.length > 0 ? candidates[0] : null)
  const generatedLetter = useMemo(() => {
    if (!targetCandidateForLetter) return null
    return MarassiAI.generateOfficialLetter(targetCandidateForLetter, selectedLetterType, customLetterReason)
  }, [targetCandidateForLetter, selectedLetterType, customLetterReason])

  const handleSendQuery = (textToSend?: string) => {
    const q = (textToSend || query).trim()
    if (!q) return

    setChatLog(prev => [...prev, { sender: 'user', text: q }])
    if (!textToSend) setQuery('')

    setTimeout(() => {
      const aiResponse = MarassiAI.answerQuery(q, candidates, savedCandidates)
      setChatLog(prev => [...prev, { sender: 'ai', text: aiResponse }])
    }, 350)
  }

  const handleCopyLetter = () => {
    if (!generatedLetter) return
    const fullText = `${generatedLetter.title}\nالتاريخ: ${generatedLetter.date}\n\n${generatedLetter.body}`
    navigator.clipboard.writeText(fullText)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 1150 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, hsl(262 72% 40%) 0%, hsl(280 70% 50%) 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 12px 35px rgba(109, 40, 217, 0.45)',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '14px',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontFamily: 'inherit',
          }}
          className="hover-bounce"
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <span>Marassi AI Suite</span>
          {alerts.length > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '20px',
                fontWeight: 800,
              }}
            >
              {alerts.length}
            </span>
          )}
        </button>
      )}

      {/* Floating AI Panel */}
      {isOpen && (
        <div
          style={{
            width: '460px',
            maxWidth: '92vw',
            height: '620px',
            maxHeight: '85vh',
            background: 'hsl(var(--card))',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
            border: '1px solid hsl(var(--border))',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            direction: 'rtl',
            animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, hsl(262 72% 38%) 0%, hsl(280 70% 48%) 100%)',
              color: '#fff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Marassi AI Intelligence</span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      background: 'rgba(255,255,255,0.25)',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      fontWeight: 700,
                    }}
                  >
                    Enterprise 3.0
                  </span>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85 }}>منظومة الذكاء الاصطناعي الأمني المتقدمة</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
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

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'hsl(var(--muted)/0.4)',
              borderBottom: '1px solid hsl(var(--border))',
              padding: '4px 8px 0',
              overflowX: 'auto',
              gap: '4px',
            }}
          >
            {[
              { id: 'chat', label: '💬 محادثة', icon: MessageSquare },
              { id: 'guide', label: '📖 دليل الاستخدام', icon: BookOpen },
              { id: 'radar', label: `🚨 رادار (${alerts.length})`, icon: ShieldAlert },
              { id: 'vendors', label: '🏢 الشركات', icon: Building2 },
              { id: 'executive', label: '📑 التقرير', icon: FileText },
              { id: 'candidate', label: '🎯 مقابلة', icon: Sparkles },
            ].map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    background: active ? 'hsl(var(--card))' : 'transparent',
                    color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                    fontWeight: active ? 800 : 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    borderBottom: active ? '2px solid hsl(var(--primary))' : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Body Content by Tab */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            {/* ── 1. Tab: Chat & Queries ── */}
            {activeTab === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                {/* Quick Query Pills */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {[
                    '📊 تقرير تنفيذي شامل',
                    '⭐ أفضل المرشحين',
                    '🏢 أفضل شركات الأمن',
                    '🚨 فحص المخاطر والتناقضات',
                    '🌓 ميزان الورديات',
                  ].map((qPill) => (
                    <button
                      key={qPill}
                      type="button"
                      onClick={() => handleSendQuery(qPill)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: 'hsl(var(--muted)/0.5)',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontFamily: 'inherit',
                      }}
                    >
                      {qPill}
                    </button>
                  ))}
                </div>

                {/* Chat Message Stream */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', minHeight: '260px' }}>
                  {chatLog.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        alignSelf: msg.sender === 'user' ? 'flex-start' : 'flex-end',
                        maxWidth: '88%',
                        padding: '10px 14px',
                        borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: msg.sender === 'user' ? 'hsl(var(--primary))' : 'hsl(var(--muted)/0.6)',
                        color: msg.sender === 'user' ? 'white' : 'hsl(var(--foreground))',
                        fontSize: '12.5px',
                        lineHeight: 1.5,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                {/* Query Input Form */}
                <form onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }} style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="اسأل Marassi AI عن أي تفاصيل أو إحصائية..."
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--muted)/0.3)',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12.5px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0 16px',
                      borderRadius: '12px',
                      background: 'hsl(var(--primary))',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* ── 2. Tab: Security Radar & Anomalies ── */}
            {activeTab === 'radar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={16} /> رادار الأمان وكشف التناقضات المباشر
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
                    فحص ذكي للتحقق من سلامة الأرقام القومية، منع ازدواجية البيانات، وتتبع سوابق الرفض.
                  </div>
                </div>

                {/* Alerts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background:
                          al.type === 'danger'
                            ? 'rgba(239, 68, 68, 0.08)'
                            : al.type === 'warning'
                            ? 'rgba(245, 158, 11, 0.08)'
                            : 'hsl(var(--muted)/0.3)',
                        border: `1px solid ${
                          al.type === 'danger' ? '#ef4444' : al.type === 'warning' ? '#f59e0b' : 'hsl(var(--border))'
                        }`,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '3px' }}>
                        {al.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.4 }}>
                        {al.message}
                      </div>
                    </div>
                  ))}

                  {/* Duplicate Phone Anomalies */}
                  {anomalies.duplicatePhones.map((dup, idx) => (
                    <div key={idx} style={{ padding: '10px 12px', borderRadius: '10px', background: 'hsl(var(--muted)/0.4)', border: '1px solid hsl(var(--border))' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>
                        ⚠️ تكرار هاتف: {dup.phone}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                        مسجل مع: {dup.names.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 3. Tab: Vendor Ratings ── */}
            {activeTab === 'vendors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12.5px', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>
                  تصنيف شركات الأمن الموردة للعمالة بناءً على جودة الكوادر ونسب الاعتماد:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {vendorRatings.map((vendor, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--muted)/0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: 'hsl(var(--foreground))' }}>
                          {vendor.companyName}
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '99px',
                            background:
                              vendor.tier === 'A'
                                ? '#10b98120'
                                : vendor.tier === 'B'
                                ? '#3b82f620'
                                : vendor.tier === 'C'
                                ? '#f59e0b20'
                                : '#ef444420',
                            color:
                              vendor.tier === 'A'
                                ? '#10b981'
                                : vendor.tier === 'B'
                                ? '#3b82f6'
                                : vendor.tier === 'C'
                                ? '#f59e0b'
                                : '#ef4444',
                          }}
                        >
                          {vendor.statusBadge}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '11.5px' }}>
                        <div>
                          إجمالي: <strong>{vendor.totalCandidates}</strong>
                        </div>
                        <div>
                          مقبول: <strong style={{ color: '#10b981' }}>{vendor.acceptedCount}</strong>
                        </div>
                        <div>
                          نسبة القبول: <strong>{vendor.acceptanceRate}%</strong>
                        </div>
                      </div>

                      <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.4 }}>
                        💡 {vendor.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 4. Tab: Executive Report & Letters ── */}
            {activeTab === 'executive' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Executive Summary Card */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, hsl(262 72% 38%/0.08), hsl(280 70% 48%/0.08))',
                    border: '1px solid hsl(262 72% 45%/0.25)',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'hsl(var(--primary))', marginBottom: '6px' }}>
                    📊 الموجز التنفيذي للقيادة الأمنية
                  </div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--foreground))', lineHeight: 1.6 }}>
                    {executiveReport.executiveSummary}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px', fontSize: '11.5px' }}>
                    <div>
                      نسبة القبول العامة: <strong>{executiveReport.acceptanceRate}%</strong>
                    </div>
                    <div>
                      توازن الوردية الليلية: <strong>{executiveReport.nightShiftBalance.ratio}</strong>
                    </div>
                  </div>
                </div>

                {/* Official Letter Generator */}
                <div style={{ borderRadius: '14px', border: '1px solid hsl(var(--border))', padding: '14px', background: 'hsl(var(--muted)/0.25)' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '8px' }}>
                    📑 صانع الخطابات والمذكرات الأمنية الرسمية:
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    {(['acceptance', 'exclusion', 'rejection'] as const).map((tType) => (
                      <button
                        key={tType}
                        type="button"
                        onClick={() => setSelectedLetterType(tType)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: selectedLetterType === tType ? '1.5px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
                          background: selectedLetterType === tType ? 'hsl(var(--primary)/0.1)' : 'transparent',
                          color: selectedLetterType === tType ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                          fontWeight: selectedLetterType === tType ? 800 : 600,
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {tType === 'acceptance' ? '✅ خطاب قبول' : tType === 'exclusion' ? '⚠️ مذكرة استبعاد' : '❌ إخطار رفض'}
                      </button>
                    ))}
                  </div>

                  {generatedLetter && (
                    <div style={{ background: 'hsl(var(--card))', padding: '12px', borderRadius: '10px', border: '1px solid hsl(var(--border))' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: 'hsl(var(--primary))', marginBottom: '4px' }}>
                        {generatedLetter.title}
                      </div>
                      <pre style={{ margin: 0, fontSize: '11px', whiteSpace: 'pre-wrap', color: 'hsl(var(--foreground))', fontFamily: 'inherit', lineHeight: 1.5 }}>
                        {generatedLetter.body}
                      </pre>
                      <button
                        onClick={handleCopyLetter}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'hsl(var(--primary))',
                          color: 'white',
                          border: 'none',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'inherit',
                        }}
                      >
                        {copiedText ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedText ? 'تم نسخ المذكرة للحافظة' : 'نسخ الخطاب الرسمي'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 5. Tab: User Guide ── */}
            {activeTab === 'guide' && (() => {
              const CATEGORY_COLORS: Record<string, string> = {
                candidates: '#3b82f6',
                interviews: '#10b981',
                database: '#8b5cf6',
                users: '#f59e0b',
                ai: '#ec4899',
                cards: '#06b6d4',
                uploads: '#f97316',
              }
              const CATEGORIES = [
                { id: 'all', label: 'الكل', icon: '🔍' },
                { id: 'candidates', label: 'المرشحون', icon: '👤' },
                { id: 'interviews', label: 'المقابلات', icon: '📅' },
                { id: 'database', label: 'قاعدة البيانات', icon: '🗄️' },
                { id: 'cards', label: 'الكروت', icon: '🪪' },
                { id: 'uploads', label: 'الرفع', icon: '📤' },
                { id: 'users', label: 'المستخدمون', icon: '⚙️' },
                { id: 'ai', label: 'Marassi AI', icon: '🤖' },
              ]
              const filteredTopics = SYSTEM_USER_GUIDE.filter(t => {
                const matchCategory = guideCategoryFilter === 'all' || t.category === guideCategoryFilter
                const s = guideSearch.trim().toLowerCase()
                const matchSearch = !s || t.title.includes(s) || t.steps.some(st => st.includes(s)) || t.keywords.some(k => k.includes(s))
                return matchCategory && matchSearch
              })
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Header */}
                  <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'linear-gradient(135deg, hsl(262 72% 38%/0.08), hsl(280 70% 48%/0.08))', border: '1px solid hsl(262 72% 45%/0.2)' }}>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <BookOpen size={15} /> دليل استخدام نظام Marassi
                    </div>
                    <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
                      خطوات واضحة لكل إجراء في النظام — ابحث أو اختار القسم اللي محتاجه.
                    </div>
                  </div>

                  {/* Search */}
                  <div style={{ position: 'relative' }}>
                    <Search size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                    <input
                      type="text"
                      value={guideSearch}
                      onChange={e => setGuideSearch(e.target.value)}
                      placeholder="ابحث في الدليل... (مثال: طباعة، مقابلة، رفع)"
                      style={{
                        width: '100%',
                        padding: '8px 32px 8px 12px',
                        borderRadius: '10px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--muted)/0.3)',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Category Filter Pills */}
                  <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setGuideCategoryFilter(cat.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          border: guideCategoryFilter === cat.id ? '1.5px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
                          background: guideCategoryFilter === cat.id ? 'hsl(var(--primary)/0.12)' : 'hsl(var(--muted)/0.35)',
                          color: guideCategoryFilter === cat.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                          fontWeight: guideCategoryFilter === cat.id ? 800 : 600,
                          fontSize: '11px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          fontFamily: 'inherit',
                        }}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Guide Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredTopics.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px', color: 'hsl(var(--muted-foreground))', fontSize: '12.5px' }}>
                        🔍 مش لاقي نتائج — جرب كلمة تانية
                      </div>
                    )}
                    {filteredTopics.map(topic => {
                      const isExpanded = expandedGuideId === topic.id
                      const accentColor = CATEGORY_COLORS[topic.category] || '#8b5cf6'
                      return (
                        <div
                          key={topic.id}
                          style={{
                            borderRadius: '12px',
                            border: `1px solid ${isExpanded ? accentColor + '60' : 'hsl(var(--border))'}`,
                            background: isExpanded ? accentColor + '08' : 'hsl(var(--muted)/0.2)',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {/* Card Header - always visible */}
                          <button
                            onClick={() => setExpandedGuideId(isExpanded ? null : topic.id)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 13px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              gap: '8px',
                              fontFamily: 'inherit',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, textAlign: 'right' }}>
                              <span style={{ fontSize: '17px', lineHeight: 1 }}>{topic.categoryIcon}</span>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'hsl(var(--foreground))' }}>
                                  {topic.title}
                                </div>
                                <div style={{ fontSize: '10.5px', color: accentColor, fontWeight: 600, marginTop: '1px' }}>
                                  {topic.categoryLabel}
                                </div>
                              </div>
                            </div>
                            <ChevronDown
                              size={15}
                              style={{
                                color: 'hsl(var(--muted-foreground))',
                                flexShrink: 0,
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          </button>

                          {/* Expanded Steps */}
                          {isExpanded && (
                            <div style={{ padding: '0 13px 13px' }}>
                              <div style={{ width: '100%', height: '1px', background: accentColor + '30', marginBottom: '10px' }} />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {topic.steps.map((step, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      display: 'flex',
                                      gap: '8px',
                                      alignItems: 'flex-start',
                                      padding: '7px 10px',
                                      borderRadius: '8px',
                                      background: 'hsl(var(--card))',
                                      border: '1px solid hsl(var(--border))',
                                    }}
                                  >
                                    <span
                                      style={{
                                        flexShrink: 0,
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: accentColor,
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                      }}
                                    >
                                      {idx + 1}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'hsl(var(--foreground))', lineHeight: 1.5, flex: 1 }}>
                                      {step}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {topic.tip && (
                                <div
                                  style={{
                                    marginTop: '8px',
                                    padding: '8px 10px',
                                    borderRadius: '8px',
                                    background: '#f59e0b12',
                                    border: '1px solid #f59e0b40',
                                    fontSize: '11.5px',
                                    color: '#d97706',
                                    lineHeight: 1.4,
                                  }}
                                >
                                  💡 <strong>نصيحة:</strong> {topic.tip}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* ── 6. Tab: Candidate AI Copilot ── */}
            {activeTab === 'candidate' && currentAnalysis && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', background: 'hsl(var(--muted)/0.4)' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>المرشح الخاضع للفحص</div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>{selectedCandidate?.name || candidates[0]?.name || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'hsl(var(--primary))' }}>
                      توافق {currentAnalysis.score}%
                    </span>
                  </div>
                </div>

                {/* Risk & Retention Gauges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: currentAnalysis.securityRiskLevel === 'low' ? '#10b98115' : '#ef444415', border: `1px solid ${currentAnalysis.securityRiskLevel === 'low' ? '#10b981' : '#ef4444'}` }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>مؤشر المخاطر الأمنية</div>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: currentAnalysis.securityRiskLevel === 'low' ? '#10b981' : '#ef4444', marginTop: '2px' }}>
                      {currentAnalysis.securityRiskLevel === 'low' ? '🟢 منخفض (آمن)' : currentAnalysis.securityRiskLevel === 'medium' ? '🟡 متوسط' : '🔴 مرتفع (تنبيه)'}
                    </div>
                  </div>

                  <div style={{ padding: '10px', borderRadius: '10px', background: '#3b82f615', border: '1px solid #3b82f6' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>التنبؤ بالاستقرار</div>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#3b82f6', marginTop: '2px' }}>
                      {currentAnalysis.retentionPrediction.stabilityScore}% استقرار متوقع
                    </div>
                  </div>
                </div>

                {/* 5 Targeted Interview Questions */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'hsl(var(--foreground))', marginBottom: '6px' }}>
                    🎯 أسئلة المقابلة الموصى بها لهذا الملف:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {currentAnalysis.recommendedQuestions.map((q, idx) => (
                      <div key={idx} style={{ padding: '8px 10px', borderRadius: '8px', background: 'hsl(var(--muted)/0.3)', border: '1px solid hsl(var(--border))', fontSize: '11.5px', lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>س{idx + 1}: </span> {q}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MarassiAIAssistant
