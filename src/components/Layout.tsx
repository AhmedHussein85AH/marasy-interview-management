import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { usePermissions } from '../hooks/usePermissions'
import Footer from './Footer'
import MarassiAIAssistant from './MarassiAIAssistant'
import InstallPWAPrompt from './InstallPWAPrompt'
import {
  LayoutDashboard, Users, Calendar, BarChart3,
  Database, Upload, UserCog, Settings, ShieldCheck,
  LogOut, ChevronLeft, PanelRightClose, PanelRightOpen,
  Sun, Moon, Globe, User, MessageCircle, Mail
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/dashboard',   labelKey: 'dashboard',     icon: LayoutDashboard, permissionKey: null },
  { path: '/candidates',  labelKey: 'candidates',    icon: Users,           permissionKey: 'canViewCandidates' },
  { path: '/interviews',  labelKey: 'interviews',    icon: Calendar,        permissionKey: 'canViewCandidates' },
  { path: '/analytics',   labelKey: 'analytics',     icon: BarChart3,       permissionKey: 'canViewAnalytics' },
  { path: '/database',    labelKey: 'database',      icon: Database,        permissionKey: 'canViewDatabase' },
  { path: '/bulk-upload', labelKey: 'bulkUpload',    icon: Upload,          permissionKey: 'canBulkUpload' },
  { path: '/users',       labelKey: 'users',         icon: UserCog,         permissionKey: 'canManageUsers' },
  { path: '/settings',    labelKey: 'settings',      icon: Settings,        permissionKey: 'canAccessSettings' },
  { path: '/security',    labelKey: 'security',      icon: ShieldCheck,     permissionKey: 'canViewSecurity' },
]

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const { currentUser, logout } = useStore()
  const { theme, toggleTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const permissions = usePermissions()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(newLang)
  }

  const filtered = NAV_ITEMS.filter(item => {
    if (!currentUser) return false
    if (!item.permissionKey) return true
    return permissions[item.permissionKey as keyof typeof permissions] === true
  })

  const handleLogout = () => {
    if (window.confirm(t('layout.logoutConfirm', 'هل أنت متأكد من تسجيل الخروج؟'))) logout()
  }

  // إنهاء الجلسات القديمة عند فتح التطبيق وكل 5 دقايق
  useEffect(() => {
    const { currentUser: user, expireStaleSessions } = useStore.getState()
    if (!user) return
    expireStaleSessions()
    const interval = setInterval(() => {
      useStore.getState().expireStaleSessions()
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const userName = currentUser?.name?.split(' - ')[0] ?? ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ===== Support Bar ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #3d1a78 0%, #6C3FC5 50%, #8B5CF6 100%)',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        direction: 'rtl',
        boxShadow: '0 2px 16px rgba(108,63,197,0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 999,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <MessageCircle size={14} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '14px', letterSpacing: '0.02em' }}>دعم فني</span>
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px' }}>Twins Development</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <a href="https://wa.me/201552962516" target="_blank" rel="noopener noreferrer" title="واتساب"
            style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)', transition: 'background 0.2s, transform 0.15s' }}
            onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(37,211,102,0.35)'); (e.currentTarget.style.transform = 'scale(1.1)') }}
            onMouseLeave={e => { (e.currentTarget.style.background = 'rgba(255,255,255,0.1)'); (e.currentTarget.style.transform = 'scale(1)') }}>
            <MessageCircle size={18} style={{ color: '#25D366' }} />
          </a>
          <a href="mailto:AhmedHusseinElsayed@outlook.com" title="إيميل"
            style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)', transition: 'background 0.2s, transform 0.15s' }}
            onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(241,196,15,0.3)'); (e.currentTarget.style.transform = 'scale(1.1)') }}
            onMouseLeave={e => { (e.currentTarget.style.background = 'rgba(255,255,255,0.1)'); (e.currentTarget.style.transform = 'scale(1)') }}>
            <Mail size={18} style={{ color: '#f1c40f' }} />
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, direction: i18n.language === 'en' ? 'ltr' : 'rtl' }}>

      {/* ===== Sidebar ===== */}
      <aside style={{
        width: collapsed ? '56px' : '256px',
        minWidth: collapsed ? '56px' : '256px',
        background: 'hsl(258 42% 12%)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        transition: 'width 0.22s ease, min-width 0.22s ease',
        flexShrink: 0,
        zIndex: 10,
        alignSelf: 'flex-start',
        borderRight: i18n.language === 'en' ? '1px solid rgba(139,92,246,0.12)' : 'none',
        borderLeft: i18n.language === 'ar' ? '1px solid rgba(139,92,246,0.12)' : 'none',
      }}>

        {/* Logo + toggle */}
        <div style={{
          padding: collapsed ? '16px 10px' : '20px 16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {/* Top row: logo + toggle button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: '34px', height: '34px', flexShrink: 0,
                  background: 'linear-gradient(135deg, hsl(262 72% 45%), hsl(280 70% 55%))',
                  borderRadius: '9px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px hsl(262 72% 45% / 0.45)',
                  fontSize: '15px', fontWeight: 800, color: 'white', letterSpacing: '-1px',
                }}>
                  V
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                    {t('nav.systemName')}
                  </div>
                  <div style={{ fontSize: '11px', color: 'hsl(258 20% 60%)', whiteSpace: 'nowrap' }}>
                    {t('nav.systemDesc')}
                  </div>
                </div>
              </div>
            )}

            {collapsed && (
              <div style={{
                width: '34px', height: '34px',
                background: 'linear-gradient(135deg, hsl(262 72% 45%), hsl(280 70% 55%))',
                borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px hsl(262 72% 45% / 0.4)',
                fontSize: '15px', fontWeight: 800, color: 'white', letterSpacing: '-1px',
              }}>
                V
              </div>
            )}

            <button
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? t('layout.expandSidebar', 'توسيع الشريط') : t('layout.collapseSidebar', 'طي الشريط')}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '7px',
                width: '28px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'hsl(215 25% 65%)',
                flexShrink: 0,
                marginRight: collapsed ? '0' : undefined,
                marginTop: collapsed ? '8px' : undefined,
              }}
            >
              {collapsed
                ? <PanelRightOpen size={14} />
                : <PanelRightClose size={14} />
              }
            </button>
          </div>

          {/* User chip - only when expanded */}
          {!collapsed && currentUser && (
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '8px', padding: '7px 10px',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'background 0.15s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <div style={{
                  width: '26px', height: '26px', flexShrink: 0,
                  background: 'linear-gradient(135deg, hsl(262 72% 52%), hsl(280 70% 62%))',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: 'white',
                  boxShadow: '0 2px 8px hsl(262 72% 52% / 0.4)',
                }}>
                  {userName.charAt(0)}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'hsl(215 25% 55%)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.department}
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {filtered.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? t(`nav.${item.labelKey}`) : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: collapsed ? '10px' : '10px 12px',
                  borderRadius: '8px',
                  color: isActive ? 'white' : 'hsl(258 20% 68%)',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  background: isActive
                    ? 'linear-gradient(135deg, hsl(262 72% 50%), hsl(280 68% 58%))'
                    : 'transparent',
                  marginBottom: '2px',
                  transition: 'background 0.15s, color 0.15s',
                  justifyContent: collapsed ? 'center' : undefined,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'hsl(258 42% 18%)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'hsl(258 20% 68%)' } }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{t(`nav.${item.labelKey}`)}</span>
                    {isActive && <ChevronLeft size={13} style={{ opacity: 0.5, flexShrink: 0 }} />}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Theme + Profile + Logout */}
        <div style={{ padding: '8px 8px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {!collapsed && (
            <Link to="/profile"
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                color: 'hsl(215 25% 65%)', background: 'transparent',
                textDecoration: 'none', fontSize: '13.5px', fontWeight: 500,
                marginBottom: '6px', transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'hsl(215 25% 65%)' }}
            >
              <User size={16} />
              <span style={{ flex: 1 }}>{t('nav.profile', 'الملف الشخصي')}</span>
            </Link>
          )}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? t('layout.themeLight') : t('layout.themeDark')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              color: 'hsl(215 25% 65%)', background: 'transparent', border: 'none',
              cursor: 'pointer', fontSize: '13.5px', fontWeight: 500,
              textAlign: 'right', transition: 'background 0.15s, color 0.15s',
              justifyContent: collapsed ? 'center' : undefined,
              marginBottom: '6px'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'hsl(215 25% 65%)' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed && t(theme === 'dark' ? 'layout.themeLight' : 'layout.themeDark')}
          </button>

          <button
            onClick={toggleLanguage}
            title={t('layout.language')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              color: 'hsl(215 25% 65%)', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              fontSize: '13.5px', fontWeight: 500, textAlign: 'right',
              transition: 'all 0.15s',
              justifyContent: collapsed ? 'center' : undefined,
              marginBottom: '16px'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'hsl(215 25% 65%)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            <Globe size={16} />
            {!collapsed && t('layout.language')}
          </button>

          <button
            onClick={handleLogout}
            title={t('layout.logout')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              color: 'hsl(4 86% 58%)', background: 'transparent',
              border: 'none', cursor: 'pointer', fontSize: '13.5px',
              fontWeight: 600, textAlign: 'right', transition: 'background 0.15s',
              justifyContent: collapsed ? 'center' : undefined
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(231, 76, 60, 0.1)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <LogOut size={16} />
            {!collapsed && t('layout.logout')}
          </button>
        </div>
      </aside>

      {/* ===== Main content ===== */}
      <main style={{ flex: 1, background: 'hsl(250 15% 97%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <InstallPWAPrompt />
        {children}
        <MarassiAIAssistant />
        <Footer />
      </main>

      </div>{/* نهاية الحاوية الداخلية (sidebar + main) */}
    </div>
  )
}

export default Layout
