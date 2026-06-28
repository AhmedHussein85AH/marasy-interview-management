import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { usePermissions } from '../hooks/usePermissions'
import Footer from './Footer'
import {
  LayoutDashboard, Users, BarChart3,
  Database, Upload, UserCog, Settings, ShieldCheck,
  LogOut, ChevronLeft, PanelRightClose, PanelRightOpen,
  Sun, Moon, Globe
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/dashboard',   labelKey: 'dashboard',     icon: LayoutDashboard, permissionKey: null },
  { path: '/candidates',  labelKey: 'candidates',    icon: Users,           permissionKey: 'canViewCandidates' },
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

  const userName = currentUser?.name?.split(' - ')[0] ?? ''

  return (
    <div style={{ display: 'flex', minHeight: '100vh', direction: i18n.language === 'en' ? 'ltr' : 'rtl' }}>

      {/* ===== Sidebar ===== */}
      <aside style={{
        width: collapsed ? '56px' : '256px',
        minWidth: collapsed ? '56px' : '256px',
        background: 'hsl(222 47% 13%)',
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
                  background: 'linear-gradient(135deg, hsl(217 91% 48%), hsl(262 83% 58%))',
                  borderRadius: '9px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px hsl(217 91% 48% / 0.4)'
                }}>
                  <ShieldCheck size={17} color="white" />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                    {t('nav.systemName')}
                  </div>
                  <div style={{ fontSize: '11px', color: 'hsl(215 25% 55%)', whiteSpace: 'nowrap' }}>
                    {t('nav.systemDesc')}
                  </div>
                </div>
              </div>
            )}

            {collapsed && (
              <div style={{
                width: '34px', height: '34px',
                background: 'linear-gradient(135deg, hsl(217 91% 48%), hsl(262 83% 58%))',
                borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={17} color="white" />
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
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '8px', padding: '7px 10px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{
                width: '26px', height: '26px', flexShrink: 0,
                background: 'linear-gradient(135deg, hsl(217 91% 55%), hsl(262 83% 65%))',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: 'white',
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
                  color: isActive ? 'white' : 'hsl(215 25% 65%)',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? 'hsl(217 91% 48%)' : 'transparent',
                  marginBottom: '2px',
                  transition: 'background 0.15s, color 0.15s',
                  justifyContent: collapsed ? 'center' : undefined,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'hsl(222 47% 18%)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'hsl(215 25% 65%)' } }}
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

        {/* Theme + Logout */}
        <div style={{ padding: '8px 8px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
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
      <main style={{ flex: 1, background: 'hsl(210 20% 98%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
        <Footer />
      </main>

    </div>
  )
}

export default Layout
