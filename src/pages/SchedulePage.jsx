import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

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

const hours = Array.from({ length: 16 }, (_, i) => i + 6) // 06:00 - 21:00

function SchedulePage() {
    const [scheduleBlocks, setScheduleBlocks] = useLocalStorage('scheduleBlocks', [])
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7)
    const [newBlock, setNewBlock] = useState({
        title: '',
        startHour: 9,
        endHour: 10,
        color: '#3b82f6',
        day: 1,
    })

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

    const addBlock = (e) => {
        e.preventDefault()
        if (!newBlock.title.trim()) return

        const block = {
            id: Date.now(),
            ...newBlock,
            day: selectedDay,
        }

        setScheduleBlocks([...scheduleBlocks, block])
        setNewBlock({
            title: '',
            startHour: 9,
            endHour: 10,
            color: '#3b82f6',
            day: selectedDay,
        })
        setShowAddModal(false)
    }

    const deleteBlock = (id) => {
        setScheduleBlocks(scheduleBlocks.filter((b) => b.id !== id))
    }

    const dayBlocks = scheduleBlocks.filter((b) => b.day === selectedDay)

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Haftalık Program 📅</h1>
                <p className="page-subtitle">Günlük çalışma planını oluştur</p>
            </div>

            {/* Day Selector */}
            <div
                className="card mb-lg"
                style={{ padding: 'var(--space-sm)', overflowX: 'auto' }}
            >
                <div className="flex gap-sm">
                    {days.map((day) => (
                        <button
                            key={day.id}
                            className={`btn ${selectedDay === day.id ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedDay(day.id)}
                            style={{ minWidth: '80px' }}
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

            {/* Schedule Grid */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex' }}>
                    {/* Time Column */}
                    <div
                        style={{
                            borderRight: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                        }}
                    >
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                style={{
                                    height: '60px',
                                    padding: 'var(--space-sm)',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                    width: '60px',
                                    borderBottom: '1px solid var(--border-color)',
                                }}
                            >
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                        ))}
                    </div>

                    {/* Schedule Column */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                style={{
                                    height: '60px',
                                    borderBottom: '1px solid var(--border-color)',
                                }}
                            />
                        ))}

                        {/* Blocks */}
                        {dayBlocks.map((block) => {
                            const top = (block.startHour - 6) * 60
                            const height = (block.endHour - block.startHour) * 60

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
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxShadow: 'var(--shadow-md)',
                                        cursor: 'default',
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{block.title}</p>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                            {block.startHour}:00 - {block.endHour}:00
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteBlock(block.id)}
                                        style={{
                                            alignSelf: 'flex-end',
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            color: 'white',
                                            display: 'flex',
                                        }}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

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
                                    onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-md">
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>
                                        Başlangıç
                                    </label>
                                    <select
                                        value={newBlock.startHour}
                                        onChange={(e) => setNewBlock({ ...newBlock, startHour: parseInt(e.target.value) })}
                                    >
                                        {hours.map((h) => (
                                            <option key={h} value={h}>
                                                {h.toString().padStart(2, '0')}:00
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.875rem' }}>
                                        Bitiş
                                    </label>
                                    <select
                                        value={newBlock.endHour}
                                        onChange={(e) => setNewBlock({ ...newBlock, endHour: parseInt(e.target.value) })}
                                    >
                                        {hours.map((h) => (
                                            <option key={h} value={h} disabled={h <= newBlock.startHour}>
                                                {h.toString().padStart(2, '0')}:00
                                            </option>
                                        ))}
                                        <option value={22}>22:00</option>
                                    </select>
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
        </div>
    )
}

export default SchedulePage
