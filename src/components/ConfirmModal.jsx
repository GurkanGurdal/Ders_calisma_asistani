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
                        Sil
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

export default ConfirmModal
