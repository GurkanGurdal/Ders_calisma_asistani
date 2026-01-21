import { useState, useRef } from 'react'
import { useNotes } from '../hooks/useNotes'
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

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
)

const PhotoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
)

const postItColors = [
    { bg: '#fef08a', shadow: 'rgba(234, 179, 8, 0.3)' },    // Yellow
    { bg: '#fed7aa', shadow: 'rgba(249, 115, 22, 0.3)' },   // Orange
    { bg: '#fecaca', shadow: 'rgba(239, 68, 68, 0.3)' },    // Red/Pink
    { bg: '#bbf7d0', shadow: 'rgba(34, 197, 94, 0.3)' },    // Green
    { bg: '#bfdbfe', shadow: 'rgba(59, 130, 246, 0.3)' },   // Blue
    { bg: '#ddd6fe', shadow: 'rgba(139, 92, 246, 0.3)' },   // Purple
]

function NotesPage() {
    const { pdfs, postits, loading, uploading, uploadPdf, deletePdf: deletePdfAPI, addTextPostit, uploadImagePostit, deletePostit: deletePostitAPI } = useNotes()
    const [activeTab, setActiveTab] = useState('postits') // 'pdfs' or 'postits'
    const [showAddPostit, setShowAddPostit] = useState(false)
    const [newPostit, setNewPostit] = useState({ text: '', colorIndex: 0 })
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null, type: '' })
    const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: '' })
    const [textModal, setTextModal] = useState({ isOpen: false, text: '', color: null })
    const pdfInputRef = useRef(null)
    const imageInputRef = useRef(null)

    // PDF Functions
    const handlePdfUpload = async (e) => {
        const files = Array.from(e.target.files)

        for (const file of files) {
            if (file.type === 'application/pdf') {
                const { error } = await uploadPdf(file)
                if (error) {
                    alert(error)
                }
            }
        }
        e.target.value = ''
    }

    const openPdf = (pdf) => {
        window.open(pdf.file_url, '_blank')
    }

    // Post-it Functions
    const addPostit = async () => {
        if (!newPostit.text.trim()) return
        await addTextPostit(newPostit.text.trim(), newPostit.colorIndex)
        setNewPostit({ text: '', colorIndex: 0 })
        setShowAddPostit(false)
    }

    // Handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith('image/')) {
            // Compress image
            const compressedImage = await compressImage(file)
            
            // Convert base64 to blob
            const blob = await fetch(compressedImage).then(r => r.blob())
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' })
            
            const { error } = await uploadImagePostit(compressedFile, Math.floor(Math.random() * postItColors.length))
            if (error) {
                alert('Resim yüklenirken hata oluştu!')
            }
        }
        e.target.value = ''
    }

    // Compress image before saving
    const compressImage = (file, maxWidth = 800) => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let width = img.width
                    let height = img.height

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width
                        width = maxWidth
                    }

                    canvas.width = width
                    canvas.height = height

                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)

                    // Convert to JPEG with compression
                    resolve(canvas.toDataURL('image/jpeg', 0.7))
                }
                img.src = e.target.result
            }
            reader.readAsDataURL(file)
        })
    }

    const deletePdf = (pdf) => {
        setConfirmModal({ isOpen: true, item: pdf, type: 'pdf' })
    }

    const deletePostit = (postit) => {
        setConfirmModal({ isOpen: true, item: postit, type: 'postit' })
    }

    const handleConfirmDelete = async () => {
        if (confirmModal.type === 'pdf') {
            await deletePdfAPI(confirmModal.item)
        } else if (confirmModal.type === 'postit') {
            await deletePostitAPI(confirmModal.item)
        }
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Notlar 📝</h1>
                <p className="page-subtitle">PDF dosyaları ve post-it notların</p>
            </div>

            {/* Tab Selector */}
            <div className="card" style={{ padding: 'var(--space-sm)', marginBottom: 'var(--space-lg)', display: 'inline-flex', gap: 'var(--space-sm)' }}>
                <button onClick={() => setActiveTab('postits')} style={{ padding: '12px 24px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.3s', background: activeTab === 'postits' ? 'var(--gradient-primary)' : 'transparent', color: activeTab === 'postits' ? 'white' : 'var(--text-secondary)' }}>
                    🗒️ Post-it'ler
                </button>
                <button onClick={() => setActiveTab('pdfs')} style={{ padding: '12px 24px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.3s', background: activeTab === 'pdfs' ? 'var(--gradient-primary)' : 'transparent', color: activeTab === 'pdfs' ? 'white' : 'var(--text-secondary)' }}>
                    📄 PDF'ler
                </button>
            </div>

            {/* PDFs Tab */}
            {activeTab === 'pdfs' && (
                <div>
                    <input type="file" ref={pdfInputRef} accept=".pdf" multiple onChange={handlePdfUpload} style={{ display: 'none' }} />
                    <button className="btn btn-primary mb-lg" onClick={() => pdfInputRef.current?.click()} disabled={uploading}>
                        <PlusIcon /> {uploading ? 'Yükleniyor...' : 'PDF Ekle'}
                    </button>

                    {loading && (
                        <div className="card empty-state">
                            <p>Yükleniyor...</p>
                        </div>
                    )}

                    {!loading && pdfs.length === 0 ? (
                        <div className="card empty-state">
                            <PdfIcon />
                            <p style={{ marginTop: 'var(--space-md)' }}>Henüz PDF eklenmemiş</p>
                            <p style={{ fontSize: '0.75rem' }}>Ders notlarını, kitap bölümlerini buraya ekleyebilirsin</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                            {pdfs.map(pdf => (
                                <div key={pdf.id} className="card" style={{ padding: 'var(--space-md)', cursor: 'pointer', position: 'relative' }} onClick={() => openPdf(pdf)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <PdfIcon />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pdf.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF Dosyası</p>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); deletePdf(pdf) }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 'var(--radius-full)', border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Post-its Tab */}
            {activeTab === 'postits' && (
                <div>
                    <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <div className="flex gap-sm mb-lg" style={{ flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={() => setShowAddPostit(true)}>
                            <PlusIcon /> Yeni Not
                        </button>
                        <button className="btn btn-secondary" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
                            <PhotoIcon /> {uploading ? 'Yükleniyor...' : 'Fotoğraf Ekle'}
                        </button>
                    </div>

                    {loading && (
                        <div className="card empty-state">
                            <p>Yükleniyor...</p>
                        </div>
                    )}

                    {!loading && postits.length === 0 ? (
                        <div className="card empty-state">
                            <div style={{ fontSize: '4rem' }}>🗒️</div>
                            <p style={{ marginTop: 'var(--space-md)' }}>Henüz not eklenmemiş</p>
                            <p style={{ fontSize: '0.75rem' }}>Dijital not yaz veya fotoğraf çekerek ekle</p>
                        </div>
                    ) : !loading && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-lg)', justifyContent: 'flex-start' }}>
                            {postits.map((postit, i) => {
                                const color = postItColors[postit.color_index] || postItColors[0]
                                return (
                                    <div 
                                        key={postit.id} 
                                        style={{
                                            background: color.bg,
                                            borderRadius: 'var(--radius-md)',
                                            padding: 'var(--space-lg)',
                                            width: '200px',
                                            height: '200px',
                                            minWidth: '200px',
                                            minHeight: '200px',
                                            maxWidth: '200px',
                                            maxHeight: '200px',
                                            position: 'relative',
                                            boxShadow: `4px 4px 15px ${color.shadow}`,
                                            transform: `rotate(${(i % 5 - 2) * 1.5}deg)`,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            if (postit.type === 'image') {
                                                setImageModal({ isOpen: true, imageUrl: postit.image_url });
                                            } else {
                                                setTextModal({ isOpen: true, text: postit.text, color });
                                            }
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = `rotate(${(i % 5 - 2) * 1.5}deg)`}
                                    >
                                        {/* Pin */}
                                        <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />

                                        {postit.type === 'image' ? (
                                            <img 
                                                src={postit.image_url} 
                                                alt="Post-it" 
                                                style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                                            />
                                        ) : (
                                            <div
                                                style={{ 
                                                    color: '#1a1a1a', 
                                                    fontSize: '0.9375rem', 
                                                    lineHeight: 1.5, 
                                                    fontFamily: "'Caveat', cursive", 
                                                    fontWeight: 500,
                                                    wordWrap: 'break-word',
                                                    overflowWrap: 'break-word',
                                                    maxHeight: '140px',
                                                    overflow: 'hidden',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 6,
                                                    WebkitBoxOrient: 'vertical',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {postit.text}
                                            </div>
                                        )}

                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deletePostit(postit);
                                            }} 
                                            style={{ position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderRadius: 'var(--radius-full)', border: 'none', background: 'rgba(0,0,0,0.1)', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6, transition: 'opacity 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
            {showAddPostit && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 'var(--space-md)' }} onClick={() => { setShowAddPostit(false); setNewPostit({ text: '', colorIndex: 0 }); }}>
                    <div className="card" style={{ maxWidth: 400, width: '100%' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700 }}>🗒️ Yeni Not</h3>
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem', fontWeight: 500 }}>Not</label>
                            <textarea 
                                value={newPostit.text} 
                                onChange={e => {
                                    let text = e.target.value;
                                    
                                    // İlk karakter büyük
                                    if (text.length === 1) {
                                        text = text.toUpperCase();
                                    }
                                    // Nokta/ünlem/soru + boşluk sonrası ilk harf
                                    else {
                                        text = text.replace(/([.!?]\s+)([a-zçğıöşü])/g, (match, punctuation, letter) => {
                                            return punctuation + letter.toUpperCase();
                                        });
                                    }
                                    
                                    setNewPostit({ ...newPostit, text });
                                }} 
                                placeholder="Notunuzu yazın..." 
                                rows={4} 
                                style={{ resize: 'none' }} 
                                autoFocus 
                            />
                        </div>
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem', fontWeight: 500 }}>Renk</label>
                            <div className="flex gap-sm">
                                {postItColors.map((c, i) => (
                                    <button key={i} type="button" onClick={() => setNewPostit({ ...newPostit, colorIndex: i })} style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: c.bg, border: newPostit.colorIndex === i ? '3px solid #666' : '2px solid transparent', cursor: 'pointer' }} />
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-sm">
                            <button className="btn btn-secondary" onClick={() => { setShowAddPostit(false); setNewPostit({ text: '', colorIndex: 0 }); }} style={{ flex: 1 }}>İptal</button>
                            <button className="btn btn-primary" onClick={addPostit} style={{ flex: 1 }}>Ekle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, item: null, type: '' })}
                onConfirm={handleConfirmDelete}
                title="Silmek istediğinize emin misiniz?"
                message={confirmModal.type === 'pdf' 
                    ? 'Bu PDF dosyası kalıcı olarak silinecek. Bu işlem geri alınamaz.'
                    : 'Bu not kalıcı olarak silinecek. Bu işlem geri alınamaz.'}
            />

            {/* Image Preview Modal */}
            {imageModal.isOpen && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        inset: 0, 
                        background: 'rgba(0,0,0,0.9)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        zIndex: 9999, 
                        padding: 'var(--space-md)',
                        cursor: 'pointer'
                    }} 
                    onClick={() => setImageModal({ isOpen: false, imageUrl: '' })}
                >
                    <img 
                        src={imageModal.imageUrl} 
                        alt="Preview" 
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
                        onClick={() => setImageModal({ isOpen: false, imageUrl: '' })}
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
            )}

            {/* Text Preview Modal */}
            {textModal.isOpen && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        inset: 0, 
                        background: 'rgba(0,0,0,0.8)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        zIndex: 9999, 
                        padding: 'var(--space-md)',
                        cursor: 'pointer'
                    }} 
                    onClick={() => setTextModal({ isOpen: false, text: '', color: null })}
                >
                    <div
                        style={{ 
                            background: textModal.color?.bg || '#fef08a',
                            borderRadius: 'var(--radius-md)',
                            padding: 'calc(var(--space-lg) * 2.5)',
                            width: '500px',
                            height: '450px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            boxShadow: `10px 10px 40px ${textModal.color?.shadow || 'rgba(234, 179, 8, 0.5)'}`,
                            position: 'relative'
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
                            width: '100%',
                            maxHeight: '100%',
                            overflowY: 'auto',
                            paddingRight: 'var(--space-sm)'
                        }}>
                            {textModal.text}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setTextModal({ isOpen: false, text: '', color: null })}
                        style={{
                            position: 'absolute',
                            top: 'var(--space-lg)',
                            right: 'var(--space-lg)',
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    )
}

export default NotesPage
