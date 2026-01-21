import { useState } from 'react'
import { useLinks } from '../hooks/useLinks'
import ConfirmModal from '../components/ConfirmModal'

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 20, height: 20 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
)

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
)

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
)

const emojiOptions = [
    '🌐', '📚', '💻', '🎮', '🎵', '📧', '📱', '🛒',
    '📰', '🎬', '📷', '💼', '🏠', '🔧', '📊', '🎨',
    '🚀', '💡', '📝', '🔍', '💬', '🎯', '⭐', '❤️'
]

function LinksPage() {
    const { links, loading, addLink, deleteLink } = useLinks()
    const [showAdd, setShowAdd] = useState(false)
    const [newLink, setNewLink] = useState({ name: '', url: '', logoUrl: '', emoji: '' })
    const [useEmoji, setUseEmoji] = useState(true)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, linkId: null })

    const handleAddLink = async (e) => {
        e.preventDefault()
        if (!newLink.name.trim() || !newLink.url.trim()) return

        let url = newLink.url.trim()
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
        }

        await addLink(
            newLink.name.trim(),
            url,
            useEmoji ? null : newLink.logoUrl.trim() || null,
            useEmoji ? newLink.emoji || '🌐' : null
        )
        setNewLink({ name: '', url: '', logoUrl: '', emoji: '' })
        setShowAdd(false)
    }

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, linkId: id })
    }

    const confirmDelete = async () => {
        await deleteLink(confirmModal.linkId)
    }

    const openLink = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Bağlantılar 🔗</h1>
                <p className="page-subtitle">{links.length} site kayıtlı</p>
            </div>

            <button className="btn btn-primary mb-lg" onClick={() => setShowAdd(true)}>
                <PlusIcon /> Yeni Bağlantı Ekle
            </button>

            {loading && (
                <div className="card empty-state">
                    <p>Yükleniyor...</p>
                </div>
            )}

            {!loading && (
                <div className="links-grid">
                    {links.length === 0 ? (
                        <div className="card empty-state" style={{ gridColumn: '1 / -1' }}>
                            <p>Henüz bağlantı eklenmemiş</p>
                        </div>
                    ) : (
                        links.map((link) => (
                            <div key={link.id} className="link-card card" onClick={() => openLink(link.url)}>
                                <div className="link-card-icon">
                                    {link.emoji ? (
                                        <span style={{ fontSize: '2rem' }}>{link.emoji}</span>
                                    ) : link.logo_url ? (
                                        <img 
                                            src={link.logo_url} 
                                            alt={link.name} 
                                            style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '2rem' }}>🌐</span>
                                    )}
                                    {link.logo_url && !link.emoji && (
                                        <span style={{ fontSize: '2rem', display: 'none' }}>🌐</span>
                                    )}
                                </div>
                                <div className="link-card-content">
                                    <h3 className="link-card-title">{link.name}</h3>
                                    <p className="link-card-url">{link.url.replace(/^https?:\/\//, '').split('/')[0]}</p>
                                </div>
                                <div className="link-card-actions">
                                    <button 
                                        className="btn btn-icon btn-secondary" 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(link.id) }}
                                        style={{ width: 32, height: 32 }}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                                <div className="link-card-external">
                                    <ExternalLinkIcon />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add Link Modal */}
            {showAdd && (
                <div 
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 'var(--space-md)' }} 
                    onClick={() => setShowAdd(false)}
                >
                    <div className="card" style={{ maxWidth: 450, width: '100%' }} onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-md">Yeni Bağlantı</h3>
                        <form onSubmit={handleAddLink} className="flex flex-col gap-md">
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Site Adı</label>
                                <input 
                                    placeholder="Örn: YouTube" 
                                    value={newLink.name} 
                                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Site URL</label>
                                <input 
                                    placeholder="Örn: youtube.com" 
                                    value={newLink.url} 
                                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>İkon Türü</label>
                                <div className="flex gap-sm">
                                    <button 
                                        type="button" 
                                        className={`btn ${useEmoji ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setUseEmoji(true)}
                                        style={{ flex: 1 }}
                                    >
                                        Emoji
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`btn ${!useEmoji ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setUseEmoji(false)}
                                        style={{ flex: 1 }}
                                    >
                                        Logo URL
                                    </button>
                                </div>
                            </div>

                            {useEmoji ? (
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Emoji Seç</label>
                                    <div className="emoji-grid">
                                        {emojiOptions.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                className={`emoji-btn ${newLink.emoji === emoji ? 'selected' : ''}`}
                                                onClick={() => setNewLink({ ...newLink, emoji })}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Logo URL</label>
                                    <input 
                                        placeholder="Örn: https://site.com/logo.png" 
                                        value={newLink.logoUrl} 
                                        onChange={(e) => setNewLink({ ...newLink, logoUrl: e.target.value })}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                                        Boş bırakılırsa varsayılan ikon kullanılır
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-sm mt-sm">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>İptal</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, linkId: null })}
                onConfirm={confirmDelete}
                title="Bağlantıyı Sil"
                message="Bu bağlantıyı silmek istediğinize emin misiniz?"
            />
        </div>
    )
}

export default LinksPage
