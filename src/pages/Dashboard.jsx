import { useState, useEffect, useMemo } from 'react'
import { useTodos } from '../hooks/useTodos'
import { useCourses } from '../hooks/useCourses'
import { usePomodoro } from '../hooks/usePomodoro'
import { useStorage, formatBytes } from '../hooks/useStorage'
import { useNotes } from '../hooks/useNotes'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import capybaraImg from '../assets/capybara.png'

const postItColors = [
    { bg: '#fef08a', shadow: 'rgba(234, 179, 8, 0.3)' },    // Yellow
    { bg: '#fed7aa', shadow: 'rgba(249, 115, 22, 0.3)' },   // Orange
    { bg: '#fecaca', shadow: 'rgba(239, 68, 68, 0.3)' },    // Red/Pink
    { bg: '#bbf7d0', shadow: 'rgba(34, 197, 94, 0.3)' },    // Green
    { bg: '#bfdbfe', shadow: 'rgba(59, 130, 246, 0.3)' },   // Blue
    { bg: '#ddd6fe', shadow: 'rgba(139, 92, 246, 0.3)' },   // Purple
]

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
)

function Dashboard() {
    const { user } = useAuth()
    const { todos, loading: todosLoading, toggleTodo } = useTodos()
    const { courses, loading: coursesLoading } = useCourses()
    const { stats: pomodoroStats, loading: pomodoroLoading } = usePomodoro()
    const { storageStats, loading: storageLoading } = useStorage()
    const { postits, loading: notesLoading } = useNotes()
    
    const [showNoteModal, setShowNoteModal] = useState(false)
    const [completingTodos, setCompletingTodos] = useState(new Set())

    const userName = user?.user_metadata?.full_name || 'Öğrenci'

    const today = new Date()
    const todayKey = today.toISOString().split('T')[0] // YYYY-MM-DD formatı
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const formattedDate = today.toLocaleDateString('tr-TR', options)
    
    // Günün notu - Shuffle Bag algoritması
    const dailyNote = useMemo(() => {
        if (!postits || postits.length === 0 || !user) return null
        
        const storageKey = `dailyNote_${user.id}`
        const shownKey = `shownNotes_${user.id}`
        
        // localStorage'dan mevcut durumu al
        let stored = null
        try {
            stored = JSON.parse(localStorage.getItem(storageKey))
        } catch (e) {}
        
        // Eğer bugün için zaten bir not seçilmişse ve o not hala mevcutsa, onu göster
        if (stored && stored.date === todayKey) {
            const existingNote = postits.find(p => p.id === stored.noteId)
            if (existingNote) return existingNote
        }
        
        // Gösterilmiş notları al
        let shownNotes = []
        try {
            shownNotes = JSON.parse(localStorage.getItem(shownKey)) || []
        } catch (e) {}
        
        // Henüz gösterilmemiş notları filtrele
        let availableNotes = postits.filter(p => !shownNotes.includes(p.id))
        
        // Eğer tüm notlar gösterildiyse, listeyi sıfırla
        if (availableNotes.length === 0) {
            shownNotes = []
            availableNotes = postits
            localStorage.setItem(shownKey, JSON.stringify([]))
        }
        
        // Random bir not seç
        const randomIndex = Math.floor(Math.random() * availableNotes.length)
        const selectedNote = availableNotes[randomIndex]
        
        // Seçilen notu kaydet
        localStorage.setItem(storageKey, JSON.stringify({ date: todayKey, noteId: selectedNote.id }))
        
        // Gösterilmiş notlara ekle
        shownNotes.push(selectedNote.id)
        localStorage.setItem(shownKey, JSON.stringify(shownNotes))
        
        return selectedNote
    }, [postits, user, todayKey])

    const completedTodos = todos.filter(t => t.completed).length
    const totalTodos = todos.length
    const todoProgress = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

    const totalTopics = courses.reduce((acc, course) => acc + (course.topics?.length || 0), 0)
    const completedTopics = courses.reduce((acc, course) =>
        acc + (course.topics?.filter(t => t.completed).length || 0), 0
    )

    const loading = todosLoading || coursesLoading || pomodoroLoading || storageLoading || notesLoading

    // Storage limits (Free tier)
    const STORAGE_LIMIT = 1 * 1024 * 1024 * 1024 // 1GB in bytes
    const storagePercentage = Math.min((storageStats.totalSize / STORAGE_LIMIT) * 100, 100)

    const stats = [
        {
            title: 'Dersler',
            value: `${courses.length}`,
            subtitle: `${completedTopics}/${totalTopics} konu`,
            icon: '📚',
            gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            link: '/courses',
        },
        {
            title: 'Pomodoro',
            value: `${pomodoroStats.totalSessions}`,
            subtitle: `${pomodoroStats.totalMinutes} dk`,
            icon: '⏱️',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            link: '/pomodoro',
        },
    ]

    const pendingTodos = todos.filter(t => !t.completed).slice(0, 4)

    const handleToggleTodo = async (id) => {
        // Önce completing state'e ekle (üstü çizilsin)
        setCompletingTodos(prev => new Set([...prev, id]))
        
        // 600ms bekle, sonra gerçek toggle işlemini yap
        setTimeout(async () => {
            await toggleTodo(id)
            setCompletingTodos(prev => {
                const newSet = new Set(prev)
                newSet.delete(id)
                return newSet
            })
        }, 600)
    }

    return (
        <div className="fade-in">
            {loading && (
                <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Yükleniyor...</p>
                </div>
            )}

            {!loading && (
                <>
            {/* Hero Section */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-xs)', textTransform: 'capitalize' }}>
                    {formattedDate}
                </p>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
                    <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Hoş Geldin, {userName}!
                    </span>
                    {' '}👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    Bugün harika şeyler başaracaksın!
                </p>
            </div>

            {/* Capybara + Pending Todos Section */}
            <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)', alignItems: 'stretch', flexWrap: 'wrap' }}>
                {/* Capybara Mascot Card with Daily Note */}
                <div 
                    className="card" 
                    style={{ flex: '1 1 320px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)', position: 'relative', cursor: dailyNote ? 'pointer' : 'default' }}
                    onClick={() => dailyNote && setShowNoteModal(true)}
                >
                    <div style={{ position: 'relative' }}>
                        <img 
                            src={capybaraImg} 
                            alt="Capybara" 
                            style={{ 
                                maxWidth: '580px', 
                                width: '100%',
                                height: 'auto'
                            }} 
                        />
                        {/* Günün Notu - Kağıdın üstünde */}
                        {dailyNote && (
                            <div style={{
                                position: 'absolute',
                                top: '30%',
                                left: '62%',
                                width: '33%',
                                aspectRatio: '1 / 1',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                padding: 'var(--space-sm)',
                                paddingTop: 'var(--space-md)',
                                overflow: 'hidden'
                            }}>
                                {dailyNote.type === 'image' ? (
                                    <img 
                                        src={dailyNote.image_url} 
                                        alt="Günün Notu" 
                                        style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover', 
                                            borderRadius: 'var(--radius-sm)' 
                                        }} 
                                    />
                                ) : (
                                    <p style={{
                                        fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)',
                                        color: '#5c4a3a',
                                        textAlign: 'center',
                                        lineHeight: 1.4,
                                        fontFamily: "'Caveat', cursive",
                                        fontWeight: 500,
                                        wordBreak: 'break-word',
                                        maxHeight: '100%',
                                        overflow: 'hidden'
                                    }}>
                                        {dailyNote.text?.length > 120 ? dailyNote.text.substring(0, 120) + '...' : dailyNote.text}
                                    </p>
                                )}
                            </div>
                        )}
                        {!dailyNote && postits.length === 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '30%',
                                left: '62%',
                                width: '33%',
                                aspectRatio: '1/1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 'var(--space-sm)'
                            }}>
                                <p style={{
                                    fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)',
                                    color: '#8b7355',
                                    textAlign: 'center',
                                    fontFamily: "'Caveat', cursive",
                                    fontStyle: 'italic'
                                }}>
                                    Notlar sayfasından post-it ekle!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Todos Card */}
                <Link 
                    to="/todo" 
                    className="card" 
                    style={{ 
                        flex: '1 1 320px', 
                        display: 'flex', 
                        flexDirection: 'column',
                        textDecoration: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <div className="flex items-center justify-between mb-md">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>📋 Yapılacaklar</h3>
                        <div style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            background: 'var(--bg-secondary)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'var(--text-secondary)'
                        }}>
                            <ArrowRightIcon />
                        </div>
                    </div>
                    <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tamamlanan</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{completedTodos}/{totalTodos}</span>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: 'var(--space-md)' }}>
                        <div className="progress-fill" style={{ width: `${todoProgress}%` }} />
                    </div>
                    {pendingTodos.length > 0 ? (
                        <div className="flex flex-col gap-sm" style={{ flex: 1 }}>
                            {pendingTodos.map((todo, i) => {
                                const isCompleting = completingTodos.has(todo.id)
                                return (
                                <div 
                                    key={todo.id} 
                                    className="card slide-in" 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 'var(--space-md)', 
                                        padding: 'var(--space-md)',
                                        animationDelay: `${i * 0.1}s`,
                                        opacity: isCompleting ? 0.5 : 1,
                                        transition: 'opacity 0.3s ease'
                                    }}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <label className="checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={todo.completed || isCompleting}
                                            onChange={(e) => {
                                                e.stopPropagation()
                                                handleToggleTodo(todo.id)
                                            }}
                                            disabled={isCompleting}
                                        />
                                    </label>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: todo.priority === 'high' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : todo.priority === 'medium' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)' }} />
                                    <span style={{ 
                                        flex: 1, 
                                        fontSize: '0.875rem', 
                                        color: 'var(--text-primary)',
                                        textDecoration: isCompleting ? 'line-through' : 'none',
                                        transition: 'text-decoration 0.3s ease'
                                    }}>{todo.text}</span>
                                </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--text-muted)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🎉</div>
                            <p>Tebrikler! Bekleyen görev yok</p>
                        </div>
                    )}
                </Link>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                {stats.map((stat, index) => (
                    <Link key={index} to={stat.link} className="card stat-card" style={{ textDecoration: 'none', padding: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-xl)', background: stat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                                {stat.icon}
                            </div>
                            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s' }}>
                                <ArrowRightIcon />
                            </div>
                        </div>
                        <p style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                            {stat.value}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
                            {stat.title}
                        </p>
                        {stat.subtitle && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.subtitle}</p>
                        )}
                        {stat.progress !== undefined && (
                            <div className="progress-bar" style={{ marginTop: 'var(--space-md)' }}>
                                <div className="progress-fill" style={{ width: `${stat.progress}%` }} />
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
                {/* Quick Start Pomodoro */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>🚀 Hızlı Başlat</h3>
                    <Link to="/pomodoro" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-xl)', color: 'white', textDecoration: 'none', position: 'relative', overflow: 'hidden', minHeight: 180 }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                        <div className="float" style={{ fontSize: '4rem', marginBottom: 'var(--space-md)', position: 'relative', zIndex: 1 }}>⏱️</div>
                        <p style={{ fontWeight: 700, fontSize: '1.25rem', position: 'relative', zIndex: 1 }}>Pomodoro Başlat</p>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9, position: 'relative', zIndex: 1 }}>25 dakika odaklan</p>
                    </Link>
                </div>

                {/* Storage Widget */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        💾 Depolama Kullanımı
                    </h3>
                    
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {formatBytes(storageStats.totalSize)} / 1 GB
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: storagePercentage > 80 ? 'var(--danger)' : 'var(--primary-500)' }}>
                                {storagePercentage.toFixed(1)}%
                            </span>
                        </div>
                        <div className="progress-bar" style={{ height: 12 }}>
                            <div 
                                className="progress-fill" 
                                style={{ 
                                    width: `${storagePercentage}%`,
                                    background: storagePercentage > 80 
                                        ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                                        : storagePercentage > 50 
                                            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                            : 'var(--gradient-primary)'
                                }} 
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm)' }}>
                        <div style={{ padding: 'var(--space-md)', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem' }}>📄</div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 'var(--space-xs)' }}>
                                {formatBytes(storageStats.pdfSize)}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF'ler</p>
                        </div>
                        <div style={{ padding: 'var(--space-md)', background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem' }}>🖼️</div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 'var(--space-xs)' }}>
                                {formatBytes(storageStats.imageSize)}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resimler</p>
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            📦 Toplam {storageStats.fileCount} dosya
                        </p>
                    </div>

                    {storagePercentage > 80 && (
                        <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--danger)', textAlign: 'center', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                                ⚠️ Depolama alanınız dolmak üzere!
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                Yeni dosya yükleyemezsiniz. Eski dosyaları silin veya Pro plana geçin.
                            </p>
                        </div>
                    )}

                    {storagePercentage >= 100 && (
                        <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.3))', borderRadius: 'var(--radius-md)', border: '2px solid var(--danger)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--danger)', textAlign: 'center', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                                🚫 Depolama Alanı Dolu!
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--danger)', textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
                                Dosya yükleyemezsiniz. Hemen eski dosyaları silin!
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
                                <a 
                                    href="/notes" 
                                    className="btn btn-secondary"
                                    style={{ flex: 1, fontSize: '0.75rem', padding: 'var(--space-xs) var(--space-sm)' }}
                                >
                                    📝 Dosyaları Yönet
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </>
            )}
            
            {/* Daily Note Modal */}
            {showNoteModal && dailyNote && (() => {
                const color = postItColors[dailyNote.color_index] || postItColors[0];
                
                // Eğer fotoğraf tipindeyse farklı modal göster
                if (dailyNote.type === 'image') {
                    return (
                        <div 
                            style={{ 
                                position: 'fixed', 
                                inset: 0, 
                                background: 'rgba(0,0,0,0.9)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                zIndex: 200, 
                                padding: 'var(--space-md)',
                                cursor: 'pointer'
                            }} 
                            onClick={() => setShowNoteModal(false)}
                        >
                            <img 
                                src={dailyNote.image_url} 
                                alt="Günün Notu" 
                                style={{ 
                                    maxWidth: '90%', 
                                    maxHeight: '90%', 
                                    objectFit: 'contain',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                                }} 
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button 
                                onClick={() => setShowNoteModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: 'var(--space-lg)',
                                    right: 'var(--space-lg)',
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                ×
                            </button>
                        </div>
                    );
                }
                
                // Text tipi için post-it modal
                return (
                    <div 
                        style={{ 
                            position: 'fixed', 
                            inset: 0, 
                            background: 'rgba(0,0,0,0.8)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            zIndex: 200, 
                            padding: 'var(--space-md)',
                            cursor: 'pointer'
                        }} 
                        onClick={() => setShowNoteModal(false)}
                    >
                        <div
                            style={{ 
                                background: color.bg,
                                borderRadius: 'var(--radius-md)',
                                padding: 'calc(var(--space-lg) * 2.5)',
                                width: '500px',
                                height: '450px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                boxShadow: `10px 10px 40px ${color.shadow}`,
                                position: 'relative',
                                cursor: 'default'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                        {/* Pin */}
                        <div style={{ 
                            position: 'absolute', 
                            top: -20, 
                            left: '50%', 
                            transform: 'translateX(-50%)', 
                            width: 50, 
                            height: 50, 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                            boxShadow: '0 8px 16px rgba(0,0,0,0.3)' 
                        }} />
                        
                        <p style={{ 
                            color: '#1a1a1a', 
                            fontSize: '2.25rem', 
                            lineHeight: 1.5, 
                            fontFamily: "'Caveat', cursive", 
                            fontWeight: 500,
                            textAlign: 'left',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            width: '100%'
                        }}>
                            {dailyNote.text}
                        </p>
                    </div>
                </div>
                );
            })()}
        </div>
    )
}

export default Dashboard
