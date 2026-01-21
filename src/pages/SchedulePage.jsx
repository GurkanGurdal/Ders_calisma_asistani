import { useState } from 'react'
import { useSchedule } from '../hooks/useSchedule'
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

const hours = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = (i % 2) * 30
    return { hour, minute, display: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}` }
}) // 00:00 - 23:30 (48 slots)

function SchedulePage() {
    const { scheduleBlocks, loading, addBlock: addBlockAPI, deleteBlock: deleteBlockAPI } = useSchedule()
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, blockId: null })
    const [newBlock, setNewBlock] = useState({
        title: '',
        start_hour: 9,
        start_minute: 0,
        end_hour: 10,
        end_minute: 0,
        color: '#3b82f6',
        day: 1,
    })
    const [titleError, setTitleError] = useState(false)
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' })

    const days = [
        { id: 1, name: 'Pazartesi', short: 'Pzt' },
        { id: 2, name: 'Salı', short: 'Sal' },
        { id: 3, name: 'Çarşamba', short: 'Çar' },
        { id: 4, name: 'Perşembe', short: 'Per' },
        { id: 5, name: 'Cuma', short: 'Cum' },
        { id: 6, name: 'Cumartesi', short: 'Cmt' },
        { id: 7, name: 'Pazar', short: 'Paz' },
    ]

    const colors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // yellow
        '#ef4444', // red
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#84cc16', // lime
    ]

    const addBlock = async (e) => {
        e.preventDefault()
        console.log('Form submitted, newBlock:', newBlock)
        
        if (!newBlock.title.trim()) {
            console.log('Title is empty!')
            setTitleError(true)
            return
        }
        setTitleError(false)

        // Çakışma kontrolü
        const newStartTime = newBlock.start_hour * 60 + newBlock.start_minute
        const newEndTime = newBlock.end_hour * 60 + newBlock.end_minute
        
        console.log('Checking overlap for new block:', {
            start: `${newBlock.start_hour}:${newBlock.start_minute}`,
            end: `${newBlock.end_hour}:${newBlock.end_minute}`,
            startMinutes: newStartTime,
            endMinutes: newEndTime
        })
        
        console.log('Existing blocks:', dayBlocks.map(b => ({
            title: b.title,
            start: `${b.start_hour}:${b.start_minute || 0}`,
            end: `${b.end_hour}:${b.end_minute || 0}`,
            startMinutes: b.start_hour * 60 + (b.start_minute || 0),
            endMinutes: b.end_hour * 60 + (b.end_minute || 0)
        })))
        
        const hasOverlap = dayBlocks.some(block => {
            const existingStart = block.start_hour * 60 + (block.start_minute || 0)
            const existingEnd = block.end_hour * 60 + (block.end_minute || 0)
            
            const overlaps = (newStartTime < existingEnd && newEndTime > existingStart)
            
            console.log('Comparing with:', {
                title: block.title,
                existingStart,
                existingEnd,
                check1: `${newStartTime} < ${existingEnd} = ${newStartTime < existingEnd}`,
                check2: `${newEndTime} > ${existingStart} = ${newEndTime > existingStart}`,
                overlaps
            })
            
            return overlaps
        })
        
        console.log('Has overlap:', hasOverlap)
        
        if (hasOverlap) {
            setAlertModal({ isOpen: true, message: 'Bu zaman diliminde zaten bir görev var. Lütfen farklı bir zaman seçin.' })
            return
        }

        const block = {
            ...newBlock,
            day: selectedDay,
        }

        console.log('Calling API with block:', block)
        const result = await addBlockAPI(block)
        console.log('API result:', result)
        
        if (result?.error) {
            console.error('Error from API:', result.error)
            setAlertModal({ isOpen: true, message: 'Zaman bloğu eklenirken hata oluştu: ' + result.error })
            return
        }
        
        console.log('Success! Closing modal')
        setNewBlock({
            title: '',
            start_hour: 9,
            start_minute: 0,
            end_hour: 10,
            end_minute: 0,
            color: '#3b82f6',
            day: selectedDay,
        })
        setShowAddModal(false)
    }

    const deleteBlock = (id) => {
        setConfirmModal({ isOpen: true, blockId: id })
    }

    const handleConfirmDelete = async () => {
        await deleteBlockAPI(confirmModal.blockId)
        setConfirmModal({ isOpen: false, blockId: null })
    }

    const dayBlocks = scheduleBlocks.filter((b) => b.day === selectedDay)

    return (
        <div className="fade-in schedule-container">
            <div className="page-header">
                <h1 className="page-title">Haftalık Program 📅</h1>
                <p className="page-subtitle">Günlük çalışma planını oluştur</p>
            </div>

            {/* Day Selector */}
            <div
                className="card mb-lg"
                style={{ padding: 'var(--space-sm)' }}
            >
                <div className="schedule-day-buttons">
                    {days.map((day) => (
                        <button
                            key={day.id}
                            className={`btn schedule-day-btn ${selectedDay === day.id ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedDay(day.id)}
                        >
                            <span className="hide-mobile">{day.name}</span>
                            <span className="show-mobile">{day.short}</span>
                        </button>
                    ))}
                </div>
                <style>{`
          .hide-mobile { display: inline; }
          .show-mobile { display: none; }
          @media (max-width: 768px) {
            .hide-mobile { display: none; }
            .show-mobile { display: inline; }
          }
        `}</style>
            </div>

            {/* Add Button */}
            <button
                className="btn btn-primary mb-lg"
                onClick={() => setShowAddModal(true)}
            >
                <PlusIcon />
                Zaman Bloğu Ekle
            </button>

            {/* Loading State */}
            {loading && (
                <div className="card empty-state">
                    <p>Yükleniyor...</p>
                </div>
            )}

            {/* Schedule Grid */}
            {!loading && (
            <div className="card schedule-grid" style={{ padding: 0, overflow: 'hidden', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>
                    {/* Time Column */}
                    <div
                        className="schedule-time-column"
                        style={{
                            borderRight: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            position: 'sticky',
                            left: 0,
                            zIndex: 1,
                            paddingTop: '8px',
                            paddingBottom: '8px'
                        }}
                    >
                        {hours.map((slot, idx) => (
                            <div
                                key={idx}
                                style={{
                                    height: '40px',
                                    padding: 'var(--space-xs)',
                                    fontSize: slot.minute === 0 ? '0.75rem' : '0.625rem',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                    borderBottom: slot.minute === 0 ? '1px solid var(--border-color)' : '1px dashed rgba(var(--border-color-rgb, 200,200,200), 0.3)',
                                    fontWeight: slot.minute === 0 ? 600 : 400,
                                    background: 'var(--bg-secondary)'
                                }}
                            >
                                {slot.minute === 0 ? slot.display : ''}
                            </div>
                        ))}
                    </div>

                    {/* Schedule Column */}
                    <div style={{ flex: 1, position: 'relative', minHeight: `${hours.length * 40}px`, paddingTop: '8px', paddingBottom: '8px' }}>
                        {hours.map((slot, idx) => (
                            <div
                                key={idx}
                                style={{
                                    height: '40px',
                                    borderBottom: slot.minute === 0 ? '1px solid var(--border-color)' : '1px dashed rgba(var(--border-color-rgb, 200,200,200), 0.3)',
                                }}
                            />
                        ))}

                        {/* Blocks */}
                        {dayBlocks.map((block) => {
                            const startSlot = block.start_hour * 2 + Math.floor(block.start_minute || 0) / 30
                            const endSlot = block.end_hour * 2 + Math.floor(block.end_minute || 0) / 30
                            const top = startSlot * 40
                            const height = (endSlot - startSlot) * 40

                            return (
                                <div
                                    key={block.id}
                                    style={{
                                        position: 'absolute',
                                        top: `${top}px`,
                                        left: '8px',
                                        right: '8px',
                                        height: `${height - 4}px`,
                                        background: block.color,
                                        borderRadius: 'var(--radius-md)',
                                        padding: 'var(--space-sm)',
                                        color: 'white',
                                        boxShadow: 'var(--shadow-md)',
                                        cursor: 'default',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div className="schedule-block-content">
                                        <p className="schedule-block-time">
                                            {block.start_hour.toString().padStart(2, '0')}:{(block.start_minute || 0).toString().padStart(2, '0')} - {block.end_hour.toString().padStart(2, '0')}:{(block.end_minute || 0).toString().padStart(2, '0')}
                                        </p>
                                        <p className="schedule-block-title">{block.title}</p>
                                        <button
                                            onClick={() => deleteBlock(block.id)}
                                            style={{
                                                background: 'rgba(255,255,255,0.2)',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                padding: '4px',
                                                cursor: 'pointer',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '24px',
                                                height: '24px',
                                                flexShrink: 0
                                            }}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 200,
                        padding: 'var(--space-md)',
                    }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="card"
                        style={{ maxWidth: '400px', width: '100%' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-md">Zaman Bloğu Ekle</h3>
                        <form onSubmit={addBlock} className="flex flex-col gap-md">
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>
                                    Başlık
                                </label>
                                <input
                                    type="text"
                                    placeholder="örn: Matematik Çalış"
                                    value={newBlock.title}
                                    onChange={(e) => {
                                        setNewBlock({ ...newBlock, title: e.target.value })
                                        setTitleError(false)
                                    }}
                                    autoFocus
                                    style={{ borderColor: titleError ? '#ef4444' : undefined }}
                                />
                                {titleError && (
                                    <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 'var(--space-xs)' }}>
                                        Lütfen bir başlık girin
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-md">
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>
                                        Başlangıç
                                    </label>
                                    <div className="flex gap-xs">
                                        <select
                                            value={newBlock.start_hour}
                                            onChange={(e) => {
                                                const hour = parseInt(e.target.value)
                                                const startTime = hour * 60 + newBlock.start_minute
                                                const endTime = newBlock.end_hour * 60 + newBlock.end_minute
                                                
                                                // Eğer bitiş başlangıçtan önceyse veya eşitse, bitiş saatini ayarla
                                                if (endTime <= startTime) {
                                                    if (newBlock.start_minute === 0) {
                                                        setNewBlock({ ...newBlock, start_hour: hour, end_hour: hour, end_minute: 30 })
                                                    } else {
                                                        setNewBlock({ ...newBlock, start_hour: hour, end_hour: hour + 1, end_minute: 0 })
                                                    }
                                                } else {
                                                    setNewBlock({ ...newBlock, start_hour: hour })
                                                }
                                            }}
                                            style={{ flex: 1 }}
                                        >
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={i}>
                                                    {i.toString().padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={newBlock.start_minute}
                                            onChange={(e) => {
                                                const minute = parseInt(e.target.value)
                                                const startTime = newBlock.start_hour * 60 + minute
                                                const endTime = newBlock.end_hour * 60 + newBlock.end_minute
                                                
                                                // Eğer bitiş başlangıçtan önceyse veya eşitse, bitiş saatini ayarla
                                                if (endTime <= startTime) {
                                                    if (minute === 0) {
                                                        setNewBlock({ ...newBlock, start_minute: minute, end_minute: 30 })
                                                    } else {
                                                        setNewBlock({ ...newBlock, start_minute: minute, end_hour: newBlock.start_hour + 1, end_minute: 0 })
                                                    }
                                                } else {
                                                    setNewBlock({ ...newBlock, start_minute: minute })
                                                }
                                            }}
                                            style={{ flex: 1 }}
                                        >
                                            <option value={0}>00</option>
                                            <option value={30}>30</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>
                                        Bitiş
                                    </label>
                                    <div className="flex gap-xs">
                                        <select
                                            value={newBlock.end_hour}
                                            onChange={(e) => {
                                                const hour = parseInt(e.target.value)
                                                const startTime = newBlock.start_hour * 60 + newBlock.start_minute
                                                
                                                // Aynı saat seçilirse, dakikayı otomatik ayarla
                                                if (hour === newBlock.start_hour) {
                                                    if (newBlock.start_minute === 0) {
                                                        setNewBlock({ ...newBlock, end_hour: hour, end_minute: 30 })
                                                    } else {
                                                        // Başlangıç 30 ise, aynı saat olamaz, bir sonraki saate git
                                                        setNewBlock({ ...newBlock, end_hour: hour + 1, end_minute: 0 })
                                                    }
                                                } else {
                                                    const endTime = hour * 60 + newBlock.end_minute
                                                    // Eğer seçilen saat başlangıçtan önceyse, dakikayı 00 yap
                                                    if (endTime <= startTime) {
                                                        setNewBlock({ ...newBlock, end_hour: hour, end_minute: 0 })
                                                    } else {
                                                        setNewBlock({ ...newBlock, end_hour: hour })
                                                    }
                                                }
                                            }}
                                            style={{ flex: 1 }}
                                            disabled={newBlock.start_hour === null}
                                        >
                                            {Array.from({ length: 24 }, (_, i) => {
                                                const startTime = newBlock.start_hour * 60 + newBlock.start_minute
                                                const endTime = i * 60
                                                // Sadece başlangıçtan sonraki saatleri göster
                                                if (endTime <= startTime && !(i === newBlock.start_hour && newBlock.start_minute === 0)) {
                                                    return null
                                                }
                                                return (
                                                    <option key={i} value={i}>
                                                        {i.toString().padStart(2, '0')}
                                                    </option>
                                                )
                                            })}
                                        </select>
                                        <select
                                            value={newBlock.end_minute}
                                            onChange={(e) => setNewBlock({ ...newBlock, end_minute: parseInt(e.target.value) })}
                                            style={{ flex: 1 }}
                                            disabled={newBlock.start_hour === null}
                                        >
                                            {newBlock.end_hour === newBlock.start_hour ? (
                                                <>
                                                    {newBlock.start_minute === 0 && <option value={30}>30</option>}
                                                    {newBlock.start_minute === 30 && <option value={0} disabled style={{ display: 'none' }}>00</option>}
                                                </>
                                            ) : (
                                                <>
                                                    <option value={0}>00</option>
                                                    <option value={30}>30</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>
                                    Renk
                                </label>
                                <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewBlock({ ...newBlock, color })}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: 'var(--radius-full)',
                                                background: color,
                                                border: newBlock.color === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-sm" style={{ marginTop: 'var(--space-sm)' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAddModal(false)}
                                    style={{ flex: 1 }}
                                >
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Ekle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, blockId: null })}
                onConfirm={handleConfirmDelete}
                title="Zaman bloğunu silmek istediğinize emin misiniz?"
                message="Bu zaman bloğu kalıcı olarak silinecek. Bu işlem geri alınamaz."
            />

            {/* Alert Modal */}
            {alertModal.isOpen && (
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
                    onClick={() => setAlertModal({ isOpen: false, message: '' })}
                >
                    <div
                        className="card"
                        style={{
                            maxWidth: '400px',
                            width: '100%',
                            padding: 'var(--space-xl)',
                            textAlign: 'center',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>⚠️</div>
                        <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
                            {alertModal.message}
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setAlertModal({ isOpen: false, message: '' })}
                            style={{ width: '100%' }}
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SchedulePage
