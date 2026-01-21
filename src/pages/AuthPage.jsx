import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import capybaraLogo from '../assets/capybara_logo.png'
import capybaraLogoDark from '../assets/capybara_logo_dark.png'

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light')
    const { signIn, signUp } = useAuth()

    // Theme değişikliklerini izle
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.getAttribute('data-theme') || 'light')
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
        return () => observer.disconnect()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        if (!email || !password) {
            setMessage({ type: 'error', text: 'Lütfen tüm alanları doldurun' })
            setLoading(false)
            return
        }

        if (!isLogin && !name.trim()) {
            setMessage({ type: 'error', text: 'Lütfen adınızı girin' })
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalı' })
            setLoading(false)
            return
        }

        const { error } = isLogin
            ? await signIn(email, password)
            : await signUp(email, password, name.trim())

        if (error) {
            setMessage({
                type: 'error',
                text: error.message === 'Invalid login credentials'
                    ? 'E-posta veya şifre hatalı'
                    : error.message
            })
        } else if (!isLogin) {
            setMessage({ type: 'success', text: 'Kayıt başarılı! E-postanızı kontrol edin.' })
        }

        setLoading(false)
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-gradient)',
            backgroundAttachment: 'fixed',
            padding: 'var(--space-md)'
        }}>
            <div className="card fade-in" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
                {/* Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
                    <img src={theme === 'dark' ? capybaraLogoDark : capybaraLogo} alt="Capybara" style={{ width: '200px', height: 'auto' }} />
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', fontSize: '0.875rem' }}>
                    {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
                </p>

                {/* Message */}
                {message.text && (
                    <div style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-md)',
                        fontSize: '0.875rem',
                        background: message.type === 'error' ? 'var(--danger-light)' : 'var(--success-light)',
                        color: message.type === 'error' ? 'var(--danger)' : 'var(--success)'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Adınız"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ textAlign: 'center' }}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ textAlign: 'center' }}
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ textAlign: 'center' }}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        style={{ padding: '14px', fontSize: '1rem' }}
                    >
                        {loading ? '...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                    </button>
                </form>

                {/* Toggle */}
                <div style={{ marginTop: 'var(--space-lg)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setMessage({ type: '', text: '' }) }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary-500)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginLeft: 'var(--space-xs)'
                        }}
                    >
                        {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AuthPage
