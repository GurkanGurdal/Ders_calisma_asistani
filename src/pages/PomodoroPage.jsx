import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

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

const modeConfig = {
    work: { label: 'Çalışma', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', glow: 'rgba(102, 126, 234, 0.4)' },
    break: { label: 'Kısa Mola', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', glow: 'rgba(17, 153, 142, 0.4)' },
    longBreak: { label: 'Uzun Mola', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', glow: 'rgba(250, 112, 154, 0.4)' },
}

function PomodoroPage() {
    const [settings, setSettings] = useLocalStorage('pomodoroSettings', { work: 25, break: 5, longBreak: 15 })
    const [stats, setStats] = useLocalStorage('pomodoroStats', { totalSessions: 0, totalMinutes: 0, today: 0 })
    const [mode, setMode] = useState('work')
    const [timeLeft, setTimeLeft] = useState(settings.work * 60)
    const [isRunning, setIsRunning] = useState(false)
    const [sessions, setSessions] = useState(0)
    const [showSettings, setShowSettings] = useState(false)
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
                setStats({ ...stats, totalSessions: stats.totalSessions + 1, totalMinutes: stats.totalMinutes + settings.work, today: stats.today + 1 })
                setMode(newSessions % 4 === 0 ? 'longBreak' : 'break')
                setTimeLeft(newSessions % 4 === 0 ? settings.longBreak * 60 : settings.break * 60)
            } else {
                setMode('work')
                setTimeLeft(settings.work * 60)
            }
            setIsRunning(false)
        }
        return () => clearInterval(interval)
    }, [isRunning, timeLeft, mode, sessions, settings, stats, setStats])

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
    const progress = ((getModeTime(mode) - timeLeft) / getModeTime(mode)) * 100
    const circumference = 2 * Math.PI * 140

    const reset = () => { setIsRunning(false); setTimeLeft(getModeTime(mode)) }
    const skip = () => { setIsRunning(false); setMode(mode === 'work' ? 'break' : 'work'); setTimeLeft(mode === 'work' ? settings.break * 60 : settings.work * 60) }
    const switchMode = (m) => { setMode(m); setTimeLeft(getModeTime(m)); setIsRunning(false) }

    const config = modeConfig[mode]

    return (
        <div className="fade-in">
            <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" />

            <div className="page-header">
                <h1 className="page-title">Pomodoro ⏱️</h1>
                <p className="page-subtitle">Bugün {stats.today || 0} seans tamamladın</p>
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
                                    <stop offset="0%" stopColor={mode === 'work' ? '#667eea' : mode === 'break' ? '#11998e' : '#fa709a'} />
                                    <stop offset="100%" stopColor={mode === 'work' ? '#764ba2' : mode === 'break' ? '#38ef7d' : '#fee140'} />
                                </linearGradient>
                            </defs>
                            <circle cx="150" cy="150" r="140" stroke="url(#progressGradient)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * progress) / 100} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                        </svg>

                        {/* Time Display */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '4rem', fontWeight: 800, background: config.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>{formatTime(timeLeft)}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>{config.label}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: 'var(--space-lg)', justifyContent: 'center', alignItems: 'center' }}>
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
                </div>

                {/* Stats */}
                <div className="card" style={{ maxWidth: 420, width: '100%' }}>
                    <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700 }}>📊 İstatistikler</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', textAlign: 'center' }}>
                        {[
                            { value: sessions, label: 'Bu Oturum', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
                            { value: stats.totalSessions, label: 'Toplam', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
                            { value: stats.totalMinutes, label: 'Dakika', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: 'var(--space-md)', background: 'rgba(99,102,241,0.05)', borderRadius: 'var(--radius-lg)' }}>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, background: item.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{item.value}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings */}
                <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)}>⚙️ Ayarlar</button>
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
            </div>
        </div>
    )
}

export default PomodoroPage
