import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { usePomodoro } from '../hooks/usePomodoro'

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" style={{ width: 32, height: 32 }}>
        <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
)

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" style={{ width: 32, height: 32 }}>
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
)

const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
    </svg>
)

const SkipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
)

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
)

const modeConfig = {
    work: { label: 'Çalışma', gradient: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)', glow: 'rgba(139, 115, 85, 0.4)', color: '#8B7355' },
    break: { label: 'Kısa Mola', gradient: 'linear-gradient(135deg, #6B8E23 0%, #9ACD32 100%)', glow: 'rgba(107, 142, 35, 0.4)', color: '#6B8E23' },
    longBreak: { label: 'Uzun Mola', gradient: 'linear-gradient(135deg, #DAA520 0%, #FFD700 100%)', glow: 'rgba(218, 165, 32, 0.4)', color: '#DAA520' },
}

function PomodoroPage() {
    const { stats, addSession } = usePomodoro()
    const [settings, setSettings] = useLocalStorage('pomodoroSettings', { work: 25, break: 5, longBreak: 15 })
    const [mode, setMode] = useState('work')
    const [timeLeft, setTimeLeft] = useState(settings.work * 60)
    const [isRunning, setIsRunning] = useState(false)
    const [sessions, setSessions] = useState(0)
    const [showSettings, setShowSettings] = useState(false)
    const [focusMode, setFocusMode] = useState(false)
    const audioRef = useRef(null)

    const getModeTime = (m) => ({ break: settings.break, longBreak: settings.longBreak }[m] || settings.work) * 60

    useEffect(() => {
        let interval
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
        } else if (isRunning && timeLeft === 0) {
            audioRef.current?.play()
            if (mode === 'work') {
                const newSessions = sessions + 1
                setSessions(newSessions)
                // Save to database (don't await to not block UI)
                addSession('work', settings.work).catch(console.error)
                setMode(newSessions % 4 === 0 ? 'longBreak' : 'break')
                setTimeLeft(newSessions % 4 === 0 ? settings.longBreak * 60 : settings.break * 60)
            } else {
                setMode('work')
                setTimeLeft(settings.work * 60)
            }
            setIsRunning(false)
        }
        return () => clearInterval(interval)
    }, [isRunning, timeLeft, mode, sessions, settings, addSession])

    // Update timer when settings change (only if not running)
    useEffect(() => {
        if (!isRunning) {
            setTimeLeft(getModeTime(mode))
        }
    }, [settings, mode, isRunning])

    // ESC key to exit focus mode
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && focusMode) {
                setFocusMode(false)
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [focusMode])

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
    const progress = ((getModeTime(mode) - timeLeft) / getModeTime(mode)) * 100
    const circumference = 2 * Math.PI * 140

    const reset = () => { setIsRunning(false); setTimeLeft(getModeTime(mode)) }
    const skip = () => { setIsRunning(false); setMode(mode === 'work' ? 'break' : 'work'); setTimeLeft(mode === 'work' ? settings.break * 60 : settings.work * 60) }
    const switchMode = (m) => { setMode(m); setTimeLeft(getModeTime(m)); setIsRunning(false) }

    const config = modeConfig[mode]

    // Focus Mode Fullscreen View
    if (focusMode) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--bg-gradient)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 'var(--space-xl)'
            }}>
                <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" />
                
                {/* Exit Button */}
                <button 
                    onClick={() => setFocusMode(false)}
                    style={{
                        position: 'absolute',
                        top: 'var(--space-lg)',
                        right: 'var(--space-lg)',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        transition: 'all 0.3s'
                    }}
                    title="Çıkış (ESC)"
                >
                    ×
                </button>

                {/* Mode Label */}
                <div style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', color: config.color, fontWeight: 700 }}>{config.label}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>Odaklanma Modu</p>
                </div>

                {/* Circular Timer */}
                <div style={{ position: 'relative', width: 400, height: 400, marginBottom: 'var(--space-xl)' }}>
                    {/* Glow effect */}
                    <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', background: config.gradient, opacity: 0.2, filter: 'blur(40px)' }} />

                    {/* SVG Circle */}
                    <svg width="400" height="400" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
                        <circle cx="200" cy="200" r="180" stroke="var(--border-color)" strokeWidth="10" fill="none" />
                        <defs>
                            <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={mode === 'work' ? '#8B7355' : mode === 'break' ? '#6B8E23' : '#DAA520'} />
                                <stop offset="100%" stopColor={mode === 'work' ? '#A0522D' : mode === 'break' ? '#9ACD32' : '#FFD700'} />
                            </linearGradient>
                        </defs>
                        <circle 
                            cx="200" 
                            cy="200" 
                            r="180" 
                            stroke="url(#focusGradient)" 
                            strokeWidth="12" 
                            fill="none" 
                            strokeLinecap="round" 
                            strokeDasharray={2 * Math.PI * 180} 
                            strokeDashoffset={2 * Math.PI * 180 - (2 * Math.PI * 180 * progress) / 100} 
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }} 
                        />
                    </svg>

                    {/* Time Display */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '6rem', fontWeight: 900, color: config.color, letterSpacing: '-0.02em' }}>{formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    <button 
                        onClick={reset} 
                        style={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: '50%', 
                            border: 'none', 
                            background: 'var(--glass-bg)', 
                            color: 'var(--text-secondary)', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            transition: 'all 0.3s' 
                        }}
                    >
                        <ResetIcon />
                    </button>
                    <button 
                        onClick={() => setIsRunning(!isRunning)} 
                        style={{ 
                            width: 100, 
                            height: 100, 
                            borderRadius: '50%', 
                            border: 'none', 
                            background: config.gradient, 
                            color: 'white', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            boxShadow: `0 10px 40px ${config.glow}`, 
                            transition: 'all 0.3s', 
                            transform: isRunning ? 'scale(1.05)' : 'scale(1)' 
                        }}
                    >
                        {isRunning ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button 
                        onClick={skip} 
                        style={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: '50%', 
                            border: 'none', 
                            background: 'var(--glass-bg)', 
                            color: 'var(--text-secondary)', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            transition: 'all 0.3s' 
                        }}
                    >
                        <SkipIcon />
                    </button>
                </div>

                {/* Hint */}
                <p style={{ position: 'absolute', bottom: 'var(--space-lg)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    ESC tuşuna basın veya × butonuna tıklayın
                </p>
            </div>
        )
    }

    return (
        <div className="fade-in">
            <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" />

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)', position: 'relative', zIndex: 10 }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <h1 className="page-title">Pomodoro ⏱️</h1>
                    <p className="page-subtitle">Bugün {stats.today || 0} seans tamamladın</p>
                </div>
                <button 
                    className="btn btn-secondary" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Settings button clicked, current state:', showSettings);
                        setShowSettings(!showSettings);
                    }}
                    style={{ 
                        flexShrink: 0, 
                        cursor: 'pointer', 
                        position: 'relative', 
                        zIndex: 11,
                        background: showSettings ? 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)' : 'var(--glass-bg)',
                        color: showSettings ? 'white' : 'var(--text-primary)',
                        border: showSettings ? 'none' : '1px solid rgba(139,115,85,0.2)'
                    }}
                >
                    <SettingsIcon />
                    Ayarlar
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xl)' }}>
                {/* Timer Card */}
                <div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center', padding: 'var(--space-xl)' }}>
                    {/* Mode Selector */}
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                        {Object.entries(modeConfig).map(([key, val]) => (
                            <button key={key} onClick={() => switchMode(key)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.3s', background: mode === key ? val.gradient : 'var(--glass-bg)', color: mode === key ? 'white' : 'var(--text-secondary)', boxShadow: mode === key ? `0 4px 20px ${val.glow}` : 'none' }}>
                                {val.label}
                            </button>
                        ))}
                    </div>

                    {/* Circular Timer */}
                    <div style={{ position: 'relative', width: 300, height: 300, margin: '0 auto var(--space-xl)' }}>
                        {/* Glow effect */}
                        <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', background: config.gradient, opacity: 0.15, filter: 'blur(30px)' }} />

                        {/* SVG Circle */}
                        <svg width="300" height="300" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
                            {/* Background circle */}
                            <circle cx="150" cy="150" r="140" stroke="var(--border-color)" strokeWidth="8" fill="none" />
                            {/* Progress circle */}
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={mode === 'work' ? '#8B7355' : mode === 'break' ? '#6B8E23' : '#DAA520'} />
                                    <stop offset="100%" stopColor={mode === 'work' ? '#A0522D' : mode === 'break' ? '#9ACD32' : '#FFD700'} />
                                </linearGradient>
                            </defs>
                            <circle cx="150" cy="150" r="140" stroke="url(#progressGradient)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * progress) / 100} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                        </svg>

                        {/* Time Display */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '4rem', fontWeight: 800, color: config.color, letterSpacing: '-0.02em' }}>{formatTime(timeLeft)}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>{config.label}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: 'var(--space-lg)', justifyContent: 'center', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <button onClick={reset} style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', background: 'var(--glass-bg)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                            <ResetIcon />
                        </button>
                        <button onClick={() => setIsRunning(!isRunning)} style={{ width: 80, height: 80, borderRadius: '50%', border: 'none', background: config.gradient, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 30px ${config.glow}`, transition: 'all 0.3s', transform: isRunning ? 'scale(1.05)' : 'scale(1)' }}>
                            {isRunning ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <button onClick={skip} style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', background: 'var(--glass-bg)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                            <SkipIcon />
                        </button>
                    </div>

                    {/* Focus Mode Button */}
                    <button className="btn btn-primary" onClick={() => setFocusMode(true)} style={{ width: '100%' }}>
                        🎯 Odaklanma Modu
                    </button>
                </div>

                {/* Settings Panel - Right after timer */}
                {showSettings && (
                    <div className="card" style={{ maxWidth: 420, width: '100%' }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700 }}>Süre Ayarları (dk)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {[
                                { key: 'work', label: 'Çalışma' },
                                { key: 'break', label: 'Kısa Mola' },
                                { key: 'longBreak', label: 'Uzun Mola' },
                            ].map((item) => (
                                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ fontWeight: 500 }}>{item.label}</label>
                                    <input type="number" value={settings[item.key]} onChange={(e) => setSettings({ ...settings, [item.key]: +e.target.value })} style={{ width: 80, textAlign: 'center' }} min={1} max={60} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="card" style={{ maxWidth: 420, width: '100%' }}>
                    <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700 }}>📊 İstatistikler</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', textAlign: 'center' }}>
                        {[
                            { value: sessions, label: 'Bu Oturum', color: '#8B7355' },
                            { value: stats.totalSessions, label: 'Toplam', color: '#6B8E23' },
                            { value: stats.totalMinutes, label: 'Dakika', color: '#DAA520' },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: 'var(--space-md)', background: 'rgba(139,115,85,0.08)', borderRadius: 'var(--radius-lg)' }}>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: item.color }}>{item.value}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PomodoroPage
