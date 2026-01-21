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

const colors = [
    { bg: '#dbeafe', color: '#1d4ed8' },
    { bg: '#dcfce7', color: '#16a34a' },
    { bg: '#fef3c7', color: '#d97706' },
    { bg: '#fee2e2', color: '#dc2626' },
    { bg: '#f3e8ff', color: '#9333ea' },
    { bg: '#fce7f3', color: '#db2777' },
]

function CoursesPage() {
    const [courses, setCourses] = useLocalStorage('courses', [])
    const [showAdd, setShowAdd] = useState(false)
    const [expanded, setExpanded] = useState(null)
    const [newCourse, setNewCourse] = useState({ name: '', colorIndex: 0 })
    const [newTopic, setNewTopic] = useState('')

    const addCourse = (e) => {
        e.preventDefault()
        if (!newCourse.name.trim()) return
        setCourses([...courses, { id: Date.now(), name: newCourse.name.trim(), colorIndex: newCourse.colorIndex, topics: [] }])
        setNewCourse({ name: '', colorIndex: 0 })
        setShowAdd(false)
    }

    const deleteCourse = (id) => setCourses(courses.filter((c) => c.id !== id))

    const addTopic = (courseId) => {
        if (!newTopic.trim()) return
        setCourses(courses.map((c) => c.id === courseId ? { ...c, topics: [...c.topics, { id: Date.now(), name: newTopic.trim(), completed: false }] } : c))
        setNewTopic('')
    }

    const toggleTopic = (courseId, topicId) => {
        setCourses(courses.map((c) => c.id === courseId ? { ...c, topics: c.topics.map((t) => t.id === topicId ? { ...t, completed: !t.completed } : t) } : c))
    }

    const deleteTopic = (courseId, topicId) => {
        setCourses(courses.map((c) => c.id === courseId ? { ...c, topics: c.topics.filter((t) => t.id !== topicId) } : c))
    }

    const getProgress = (c) => c.topics?.length ? Math.round((c.topics.filter((t) => t.completed).length / c.topics.length) * 100) : 0

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Dersler 📚</h1>
                <p className="page-subtitle">{courses.length} ders takip ediliyor</p>
            </div>

            <button className="btn btn-primary mb-lg" onClick={() => setShowAdd(true)}><PlusIcon /> Yeni Ders Ekle</button>

            <div className="flex flex-col gap-md">
                {courses.length === 0 ? (
                    <div className="card empty-state"><p>Henüz ders eklenmemiş</p></div>
                ) : courses.map((course) => {
                    const c = colors[course.colorIndex] || colors[0]
                    const isExp = expanded === course.id
                    return (
                        <div key={course.id} className="card" style={{ padding: 0 }}>
                            <div style={{ padding: 'var(--space-md)', background: c.bg, cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : course.id)}>
                                <div className="flex items-center justify-between">
                                    <div><h3 style={{ color: c.color }}>{course.name}</h3><p style={{ fontSize: '0.75rem' }}>{course.topics?.length || 0} konu • %{getProgress(course)}</p></div>
                                    <button className="btn btn-icon btn-secondary" onClick={(e) => { e.stopPropagation(); deleteCourse(course.id) }}><TrashIcon /></button>
                                </div>
                                <div className="progress-bar mt-sm" style={{ height: 6 }}><div className="progress-fill" style={{ width: `${getProgress(course)}%`, background: c.color }} /></div>
                            </div>
                            {isExp && (
                                <div style={{ padding: 'var(--space-md)' }}>
                                    <div className="flex gap-sm mb-md">
                                        <input placeholder="Yeni konu..." value={newTopic} onChange={(e) => setNewTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTopic(course.id)} style={{ flex: 1 }} />
                                        <button className="btn btn-primary" onClick={() => addTopic(course.id)}><PlusIcon /></button>
                                    </div>
                                    {course.topics?.map((t) => (
                                        <div key={t.id} className="flex items-center gap-sm mb-sm" style={{ padding: 'var(--space-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                            <label className="checkbox-wrapper" style={{ flex: 1 }}>
                                                <input type="checkbox" checked={t.completed} onChange={() => toggleTopic(course.id, t.id)} />
                                                <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>{t.name}</span>
                                            </label>
                                            <button className="btn btn-icon btn-secondary" onClick={() => deleteTopic(course.id, t.id)} style={{ width: 28, height: 28 }}><TrashIcon /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {showAdd && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 'var(--space-md)' }} onClick={() => setShowAdd(false)}>
                    <div className="card" style={{ maxWidth: 400, width: '100%' }} onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-md">Yeni Ders</h3>
                        <form onSubmit={addCourse} className="flex flex-col gap-md">
                            <input placeholder="Ders adı" value={newCourse.name} onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })} autoFocus />
                            <div className="flex gap-sm">{colors.map((cl, i) => (<button key={i} type="button" onClick={() => setNewCourse({ ...newCourse, colorIndex: i })} style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: cl.bg, border: newCourse.colorIndex === i ? `3px solid ${cl.color}` : 'none', cursor: 'pointer' }} />))}</div>
                            <div className="flex gap-sm"><button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>İptal</button><button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Ekle</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CoursesPage
