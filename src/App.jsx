import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import TodoPage from './pages/TodoPage'
import SchedulePage from './pages/SchedulePage'
import CoursesPage from './pages/CoursesPage'
import PomodoroPage from './pages/PomodoroPage'
import NotesPage from './pages/NotesPage'
import LinksPage from './pages/LinksPage'
import AuthPage from './pages/AuthPage'
import capybaraLogo from './assets/capybara_logo.png'
import capybaraLogoDark from './assets/capybara_logo_dark.png'
import './index.css'

// Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
)

const ChecklistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
)

const TimerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const NotesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
)

const LinksIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
  </svg>
)

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
)

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
)

function Sidebar({ theme, toggleTheme, isOpen, setIsOpen, onSignOut, userEmail }) {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: <HomeIcon />, label: 'Ana Sayfa' },
    { path: '/todo', icon: <ChecklistIcon />, label: 'Yapılacaklar' },
    { path: '/schedule', icon: <CalendarIcon />, label: 'Program' },
    { path: '/courses', icon: <BookIcon />, label: 'Dersler' },
    { path: '/notes', icon: <NotesIcon />, label: 'Notlar' },
    { path: '/links', icon: <LinksIcon />, label: 'Bağlantılar' },
    { path: '/pomodoro', icon: <TimerIcon />, label: 'Pomodoro' },
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <img src={theme === 'dark' ? capybaraLogoDark : capybaraLogo} alt="Capybara" style={{ width: '180px', height: 'auto', objectFit: 'contain' }} />
        </h1>
        {userEmail && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userEmail}
          </p>
        )}
      </div>

      <nav style={{ flex: 1 }}>
        <div className="flex flex-col gap-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <div className="theme-toggle-container">
          <label className="theme-toggle-label" htmlFor="theme-switch">
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            {theme === 'dark' ? 'Karanlık Mod' : 'Aydınlık Mod'}
          </label>
          <label className="theme-toggle-switch">
            <input
              id="theme-switch"
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <span className="theme-toggle-slider"></span>
          </label>
        </div>
        {onSignOut && (
          <button
            className="btn btn-icon btn-secondary"
            onClick={onSignOut}
            style={{ 
              color: 'var(--danger)', 
              width: '100%', 
              padding: 'var(--space-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Çıkış Yap"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor"
              style={{ width: '18px', height: '18px' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  )
}

function MobileNav() {
  const navItems = [
    { path: '/', icon: <HomeIcon />, label: 'Ana Sayfa' },
    { path: '/todo', icon: <ChecklistIcon />, label: 'Yapılacaklar' },
    { path: '/schedule', icon: <CalendarIcon />, label: 'Program' },
    { path: '/courses', icon: <BookIcon />, label: 'Dersler' },
    { path: '/notes', icon: <NotesIcon />, label: 'Notlar' },
    { path: '/links', icon: <LinksIcon />, label: 'Bağlantılar' },
    { path: '/pomodoro', icon: <TimerIcon />, label: 'Pomodoro' },
  ]

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-items">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function MobileHeader({ theme, toggleTheme, setIsOpen }) {
  return (
    <header
      className="mobile-header"
      style={{
        display: 'none',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: 'var(--space-md)',
        zIndex: 50,
      }}
    >
      <div className="flex items-center justify-between">
        <button className="btn btn-icon btn-secondary" onClick={() => setIsOpen(true)}>
          <MenuIcon />
        </button>
        <h1 style={{ fontSize: '1rem', fontWeight: 600 }}>📚 Ders Asistanı</h1>
        <label className="theme-toggle-switch" style={{ width: '44px', height: '24px' }}>
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <span className="theme-toggle-slider" style={{ borderRadius: '24px' }}></span>
        </label>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: block !important; }
        }
      `}</style>
    </header>
  )
}

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
)

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-md)',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: 'var(--space-xl)',
          textAlign: 'center',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>⚠️</div>
        <h3 style={{ marginBottom: 'var(--space-sm)', fontSize: '1.25rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            İptal
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            style={{ flex: 1, background: 'var(--danger)' }}
          >
            Çıkış Yap
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

function AppContent() {
  const { user, signOut } = useAuth()
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleSignOut = async () => {
    setShowLogoutModal(true)
  }

  const confirmSignOut = async () => {
    await signOut()
  }

  return (
    <div className="app-container">
      <Sidebar
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onSignOut={handleSignOut}
        userEmail={user?.email}
      />

      <main className="main-content">
        <MobileHeader theme={theme} toggleTheme={toggleTheme} setIsOpen={setSidebarOpen} />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
        </Routes>
      </main>

      <MobileNav />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmSignOut}
        title="Çıkış Yap"
        message="Çıkış yapmak istediğinizden emin misiniz? Tüm kaydedilmemiş değişiklikler kaybolabilir."
      />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-gradient)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📚</div>
          <p style={{ color: 'var(--text-secondary)' }}>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
