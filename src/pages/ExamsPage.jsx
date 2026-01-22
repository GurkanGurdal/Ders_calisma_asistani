import { useState } from 'react'
import { useExams, TYT_SUBJECTS, AYT_SAYISAL_SUBJECTS, AYT_ESIT_SUBJECTS, AYT_SOZEL_SUBJECTS, getSubjectsByExamType, getPrefixByExamType, calculateNet } from '../hooks/useExams'
import ConfirmModal from '../components/ConfirmModal'

// Sınav türü etiketleri
const EXAM_TYPE_LABELS = {
    'TYT': 'TYT',
    'AYT': 'AYT',
    'AYT_SAYISAL': 'AYT (Sayısal)',
    'AYT_ESIT': 'AYT (Eşit Ağırlık)',
    'AYT_SOZEL': 'AYT (Sözel)'
}

// AYT türleri (birleştirme için)
const AYT_TYPES = ['AYT_SAYISAL', 'AYT_ESIT', 'AYT_SOZEL']

// Basit çizgi grafik komponenti
const LineChart = ({ data, title, color = '#8B7355' }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{
                padding: 'var(--space-xl)',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)'
            }}>
                <p>Henüz veri yok. Deneme ekleyerek başlayın!</p>
            </div>
        )
    }

    const maxNet = Math.max(...data.map(d => d.totalNet), 1)
    const minNet = Math.min(...data.map(d => d.totalNet), 0)
    const range = maxNet - minNet || 1
    
    const width = Math.max(data.length * 80, 400)
    const height = 250
    const padding = { top: 30, right: 30, bottom: 50, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    const points = data.map((d, i) => ({
        x: padding.left + (i / (data.length - 1 || 1)) * chartWidth,
        y: padding.top + chartHeight - ((d.totalNet - minNet) / range) * chartHeight,
        ...d
    }))

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    return (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>{title}</h4>
            <div style={{ 
                overflowX: 'auto', 
                background: 'var(--glass-bg)', 
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                padding: 'var(--space-md)'
            }}>
                <svg width={width} height={height} style={{ display: 'block' }}>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                        <g key={i}>
                            <line
                                x1={padding.left}
                                y1={padding.top + chartHeight * (1 - ratio)}
                                x2={width - padding.right}
                                y2={padding.top + chartHeight * (1 - ratio)}
                                stroke="var(--border-color)"
                                strokeDasharray="4"
                            />
                            <text
                                x={padding.left - 10}
                                y={padding.top + chartHeight * (1 - ratio) + 4}
                                textAnchor="end"
                                fontSize="11"
                                fill="var(--text-secondary)"
                            >
                                {(minNet + range * ratio).toFixed(1)}
                            </text>
                        </g>
                    ))}

                    {/* Line path */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Area under curve */}
                    <path
                        d={`${pathD} L ${points[points.length - 1]?.x || 0} ${padding.top + chartHeight} L ${points[0]?.x || 0} ${padding.top + chartHeight} Z`}
                        fill={color}
                        fillOpacity="0.1"
                    />

                    {/* Data points */}
                    {points.map((point, i) => (
                        <g key={i}>
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="6"
                                fill={color}
                                stroke="var(--bg-primary)"
                                strokeWidth="2"
                            />
                            <text
                                x={point.x}
                                y={height - 15}
                                textAnchor="middle"
                                fontSize="10"
                                fill="var(--text-secondary)"
                            >
                                {point.date}
                            </text>
                            <text
                                x={point.x}
                                y={point.y - 12}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="600"
                                fill="var(--text-primary)"
                            >
                                {point.totalNet.toFixed(1)}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    )
}

// Ders bazlı net gösterimi
const SubjectNetCard = ({ subject, net, maxQuestions, color }) => {
    const percentage = (net / maxQuestions) * 100
    
    return (
        <div style={{
            padding: 'var(--space-md)',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{subject}</span>
                <span style={{ fontWeight: '600', color }}>{net.toFixed(2)} / {maxQuestions}</span>
            </div>
            <div style={{
                height: '6px',
                background: 'var(--border-color)',
                borderRadius: '3px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${Math.min(percentage, 100)}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                }} />
            </div>
        </div>
    )
}

// Deneme formu
const ExamForm = ({ onSubmit, onCancel, initialData = null }) => {
    const [examType, setExamType] = useState(initialData?.exam_type || 'TYT')
    const [examDate, setExamDate] = useState(initialData?.exam_date || new Date().toISOString().split('T')[0])
    const [formData, setFormData] = useState(initialData || {})
    const [errors, setErrors] = useState({})

    const subjects = getSubjectsByExamType(examType)
    const prefix = getPrefixByExamType(examType)

    // Bugünün tarihi (gelecek tarih engeli için)
    const today = new Date().toISOString().split('T')[0]

    const handleInputChange = (subjectId, field, value) => {
        // Leading zero'ları kaldır ve sayıya çevir
        const cleanValue = value.replace(/^0+/, '') || '0'
        const numValue = Math.max(0, parseInt(cleanValue) || 0)
        const newFormData = {
            ...formData,
            [`${prefix}${subjectId}_${field}`]: numValue
        }
        setFormData(newFormData)
        
        // Hata kontrolü
        validateSubject(subjectId, newFormData)
    }

    const validateSubject = (subjectId, data) => {
        const subject = subjects.find(s => s.id === subjectId)
        if (!subject) return

        const dogru = data[`${prefix}${subjectId}_dogru`] || 0
        const yanlis = data[`${prefix}${subjectId}_yanlis`] || 0
        const total = dogru + yanlis

        if (total > subject.maxQuestions) {
            setErrors(prev => ({
                ...prev,
                [subjectId]: `Doğru + Yanlış toplamı ${subject.maxQuestions}'ü geçemez!`
            }))
        } else {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[subjectId]
                return newErrors
            })
        }
    }

    const getSubjectValue = (subjectId, field) => {
        return formData[`${prefix}${subjectId}_${field}`] || 0
    }

    // Tüm hataları kontrol et
    const validateAllSubjects = () => {
        let hasError = false
        const newErrors = {}

        subjects.forEach(subject => {
            const dogru = getSubjectValue(subject.id, 'dogru')
            const yanlis = getSubjectValue(subject.id, 'yanlis')
            const total = dogru + yanlis

            if (total > subject.maxQuestions) {
                newErrors[subject.id] = `Doğru + Yanlış toplamı ${subject.maxQuestions}'ü geçemez!`
                hasError = true
            }
        })

        setErrors(newErrors)
        return !hasError
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (!validateAllSubjects()) {
            return
        }

        onSubmit({
            ...formData,
            exam_type: examType,
            exam_date: examDate
        })
    }

    // Toplam net hesapla
    let totalNet = 0
    subjects.forEach(subject => {
        const dogru = getSubjectValue(subject.id, 'dogru')
        const yanlis = getSubjectValue(subject.id, 'yanlis')
        totalNet += calculateNet(dogru, yanlis)
    })

    // Max toplam net
    const maxTotalNet = subjects.reduce((sum, s) => sum + s.maxQuestions, 0)

    // Herhangi bir hata var mı?
    const hasErrors = Object.keys(errors).length > 0

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div className="form-group">
                    <label className="form-label">Sınav Türü</label>
                    <select
                        value={examType}
                        onChange={(e) => {
                            setExamType(e.target.value)
                            setFormData({})
                            setErrors({})
                        }}
                        className="form-input"
                        disabled={!!initialData}
                    >
                        <option value="TYT">TYT</option>
                        <option value="AYT_SAYISAL">AYT (Sayısal)</option>
                        <option value="AYT_ESIT">AYT (Eşit Ağırlık)</option>
                        <option value="AYT_SOZEL">AYT (Sözel)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Tarih</label>
                    <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        max={today}
                        className="form-input"
                    />
                </div>
            </div>

            <div style={{ 
                display: 'grid', 
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)'
            }}>
                {subjects.map(subject => {
                    const dogru = getSubjectValue(subject.id, 'dogru')
                    const yanlis = getSubjectValue(subject.id, 'yanlis')
                    const bos = subject.maxQuestions - dogru - yanlis
                    const net = calculateNet(dogru, yanlis)
                    const total = dogru + yanlis
                    const hasSubjectError = !!errors[subject.id]

                    return (
                        <div 
                            key={subject.id}
                            style={{
                                padding: 'var(--space-md)',
                                background: hasSubjectError ? 'rgba(220, 38, 38, 0.1)' : 'var(--glass-bg)',
                                borderRadius: 'var(--radius-md)',
                                border: `1px solid ${hasSubjectError ? 'var(--danger)' : 'var(--border-color)'}`
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                <span style={{ fontWeight: '600' }}>{subject.name}</span>
                                <span style={{ 
                                    fontSize: '0.875rem', 
                                    color: total > subject.maxQuestions ? 'var(--danger)' : 'var(--text-secondary)'
                                }}>
                                    {total} / {subject.maxQuestions} | Boş: {Math.max(0, bos)} | Net: <strong style={{ color: 'var(--primary-500)' }}>{net.toFixed(2)}</strong>
                                </span>
                            </div>

                            {hasSubjectError && (
                                <div style={{
                                    padding: 'var(--space-xs) var(--space-sm)',
                                    background: 'rgba(220, 38, 38, 0.2)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--danger)',
                                    fontSize: '0.75rem',
                                    marginBottom: 'var(--space-sm)'
                                }}>
                                    ⚠️ {errors[subject.id]}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm)' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'block', marginBottom: '4px' }}>Doğru</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={subject.maxQuestions}
                                        value={dogru}
                                        onChange={(e) => handleInputChange(subject.id, 'dogru', e.target.value)}
                                        className="form-input"
                                        style={{ textAlign: 'center' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'block', marginBottom: '4px' }}>Yanlış</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={subject.maxQuestions}
                                        value={yanlis}
                                        onChange={(e) => handleInputChange(subject.id, 'yanlis', e.target.value)}
                                        className="form-input"
                                        style={{ textAlign: 'center' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div style={{
                padding: 'var(--space-md)',
                background: 'linear-gradient(135deg, rgba(139,115,85,0.1) 0%, rgba(160,82,45,0.1) 100%)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-lg)',
                textAlign: 'center'
            }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-500)' }}>
                    Toplam Net: {totalNet.toFixed(2)} / {maxTotalNet}
                </span>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ flex: 1 }}>
                    İptal
                </button>
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    disabled={hasErrors}
                >
                    {initialData ? 'Güncelle' : 'Kaydet'}
                </button>
            </div>
        </form>
    )
}

// Ana sayfa komponenti
export default function ExamsPage() {
    const { exams, loading, addExam, deleteExam, getChartData, getStats, calculateSubjectNets, calculateTotalNet } = useExams()
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedExam, setSelectedExam] = useState(null)
    const [activeTab, setActiveTab] = useState('TYT')
    const [deleteId, setDeleteId] = useState(null)

    const handleAddExam = async (examData) => {
        const result = await addExam(examData)
        if (!result.error) {
            setShowAddModal(false)
        }
    }

    const handleDeleteExam = async () => {
        if (deleteId) {
            await deleteExam(deleteId)
            setDeleteId(null)
        }
    }

    const chartData = getChartData(activeTab)
    const stats = getStats(activeTab)

    // AYT seçili ise tüm AYT türlerini filtrele
    const filteredExams = activeTab === 'AYT' 
        ? exams.filter(exam => AYT_TYPES.includes(exam.exam_type))
        : exams.filter(exam => exam.exam_type === activeTab)

    // Tek renk kullan
    const mainColor = '#8B7355'

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Yükleniyor...</p>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: 'var(--space-xs)' }}>
                        📊 Deneme Analizi
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        TYT ve AYT denemelerinizi takip edin, net gelişiminizi analiz edin
                    </p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                >
                    + Yeni Deneme
                </button>
            </div>

            {/* Tab Buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                {['TYT', 'AYT'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: 'var(--space-sm) var(--space-lg)',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: activeTab === tab ? mainColor : 'var(--glass-bg)',
                            color: activeTab === tab ? 'white' : 'var(--text-primary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '0.875rem'
                        }}
                    >
                        {EXAM_TYPE_LABELS[tab]}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-xl)'
            }}>
                {[
                    { label: 'Deneme Sayısı', value: stats.count, icon: '📝' },
                    { label: 'Ortalama Net', value: stats.avgNet, icon: '📈' },
                    { label: 'En Yüksek', value: stats.maxNet, icon: '🏆' },
                    { label: 'En Düşük', value: stats.minNet, icon: '📉' },
                    { 
                        label: 'Son Değişim', 
                        value: stats.trend, 
                        icon: parseFloat(stats.trend) >= 0 ? '🔼' : '🔽',
                        color: parseFloat(stats.trend) >= 0 ? 'var(--success)' : 'var(--danger)'
                    }
                ].map((stat, i) => (
                    <div 
                        key={i}
                        className="card"
                        style={{ padding: 'var(--space-md)', textAlign: 'center' }}
                    >
                        <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: stat.color || 'var(--text-primary)' }}>
                            {stat.value}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <LineChart 
                    data={chartData}
                    title={`${EXAM_TYPE_LABELS[activeTab]} Net Gelişimi`}
                    color={mainColor}
                />
            </div>

            {/* Exam List */}
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>📋 {EXAM_TYPE_LABELS[activeTab]} Denemeleri</h3>
                
                {filteredExams.length === 0 ? (
                    <div style={{ 
                        padding: 'var(--space-xl)', 
                        textAlign: 'center', 
                        color: 'var(--text-secondary)' 
                    }}>
                        <p>Henüz {EXAM_TYPE_LABELS[activeTab]} denemesi eklenmemiş.</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                            style={{ marginTop: 'var(--space-md)' }}
                        >
                            İlk Denemeyi Ekle
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {filteredExams.map(exam => {
                            const subjectNets = calculateSubjectNets(exam, exam.exam_type)
                            const totalNet = calculateTotalNet(exam, exam.exam_type)
                            
                            return (
                                <div 
                                    key={exam.id}
                                    style={{
                                        padding: 'var(--space-md)',
                                        background: 'var(--glass-bg)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)'
                                    }}
                                >
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginBottom: 'var(--space-md)',
                                        flexWrap: 'wrap',
                                        gap: 'var(--space-sm)'
                                    }}>
                                        <div>
                                            <span style={{ 
                                                fontWeight: '600',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {new Date(exam.exam_date).toLocaleDateString('tr-TR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <span style={{
                                                padding: 'var(--space-xs) var(--space-sm)',
                                                background: mainColor,
                                                color: 'white',
                                                borderRadius: 'var(--radius-sm)',
                                                fontWeight: '600',
                                                fontSize: '0.875rem'
                                            }}>
                                                {totalNet.toFixed(2)} Net
                                            </span>
                                            <button
                                                onClick={() => setSelectedExam(exam)}
                                                className="btn btn-icon btn-secondary"
                                                title="Detay"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(exam.id)}
                                                className="btn btn-icon btn-secondary"
                                                style={{ color: 'var(--danger)' }}
                                                title="Sil"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                        gap: 'var(--space-sm)'
                                    }}>
                                        {subjectNets.map((subject, i) => (
                                            <div 
                                                key={i}
                                                style={{
                                                    padding: 'var(--space-xs) var(--space-sm)',
                                                    background: 'var(--bg-secondary)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.75rem',
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <span style={{ color: 'var(--text-secondary)' }}>{subject.name}</span>
                                                <span style={{ fontWeight: '600' }}>{subject.net.toFixed(1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
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
                        zIndex: 1000,
                        padding: 'var(--space-md)'
                    }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div 
                        className="card"
                        style={{ 
                            maxWidth: '600px', 
                            width: '100%', 
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: 'var(--space-xl)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: 'var(--space-lg)' }}>➕ Yeni Deneme Ekle</h2>
                        <ExamForm 
                            onSubmit={handleAddExam}
                            onCancel={() => setShowAddModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedExam && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: 'var(--space-md)'
                    }}
                    onClick={() => setSelectedExam(null)}
                >
                    <div 
                        className="card"
                        style={{ 
                            maxWidth: '500px', 
                            width: '100%', 
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: 'var(--space-xl)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                            <h2>📊 Deneme Detayı</h2>
                            <button
                                onClick={() => setSelectedExam(null)}
                                className="btn btn-icon btn-secondary"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                            <div style={{ 
                                fontSize: '0.75rem', 
                                color: 'white',
                                background: mainColor,
                                padding: 'var(--space-xs) var(--space-sm)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'inline-block',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                {EXAM_TYPE_LABELS[selectedExam.exam_type]}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                                {new Date(selectedExam.exam_date).toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: mainColor
                            }}>
                                {calculateTotalNet(selectedExam, selectedExam.exam_type).toFixed(2)} Net
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {calculateSubjectNets(selectedExam, selectedExam.exam_type).map((subject, i) => (
                                <SubjectNetCard
                                    key={i}
                                    subject={subject.name}
                                    net={subject.net}
                                    maxQuestions={subject.maxQuestions}
                                    color={mainColor}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDeleteExam}
                title="Denemeyi Sil"
                message="Bu denemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
            />
        </div>
    )
}
