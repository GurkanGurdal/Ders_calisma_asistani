import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
)

function Dashboard() {
    const { user } = useAuth()
    const [todos] = useLocalStorage('todos', [])
    const [courses] = useLocalStorage('courses', [])
    const [pomodoroStats] = useLocalStorage('pomodoroStats', { totalSessions: 0, totalMinutes: 0 })

    const userName = user?.user_metadata?.full_name || 'Öğrenci'

    const today = new Date()
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const formattedDate = today.toLocaleDateString('tr-TR', options)

    const completedTodos = todos.filter(t => t.completed).length
    const totalTodos = todos.length
    const todoProgress = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

    const totalTopics = courses.reduce((acc, course) => acc + (course.topics?.length || 0), 0)
    const completedTopics = courses.reduce((acc, course) =>
        acc + (course.topics?.filter(t => t.completed).length || 0), 0
    )

    const stats = [
        {
            title: 'Yapılacaklar',
            value: `${completedTodos}/${totalTodos}`,
            icon: '✓',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            link: '/todo',
            progress: todoProgress,
        },
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

    return (
        <div className="fade-in">
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
                {/* Pending Todos */}
                <div className="card">
                    <div className="flex items-center justify-between mb-lg">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>📋 Bekleyen Görevler</h3>
                        <Link to="/todo" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                            Tümü
                        </Link>
                    </div>
                    {pendingTodos.length > 0 ? (
                        <div className="flex flex-col gap-sm">
                            {pendingTodos.map((todo, i) => (
                                <div key={todo.id} className="slide-in" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', animationDelay: `${i * 0.1}s` }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: todo.priority === 'high' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : todo.priority === 'medium' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)' }} />
                                    <span style={{ flex: 1, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{todo.text}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🎉</div>
                            <p>Tebrikler! Bekleyen görev yok</p>
                        </div>
                    )}
                </div>

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
            </div>
        </div>
    )
}

export default Dashboard
