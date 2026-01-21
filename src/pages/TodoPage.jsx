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

const priorityColors = {
    high: { bg: 'var(--danger-light)', color: 'var(--danger)', label: 'Yüksek' },
    medium: { bg: 'var(--warning-light)', color: 'var(--warning)', label: 'Orta' },
    low: { bg: 'var(--success-light)', color: 'var(--success)', label: 'Düşük' },
}

function TodoPage() {
    const [todos, setTodos] = useLocalStorage('todos', [])
    const [newTodo, setNewTodo] = useState('')
    const [priority, setPriority] = useState('medium')
    const [filter, setFilter] = useState('all')

    const addTodo = (e) => {
        e.preventDefault()
        if (!newTodo.trim()) return

        const todo = {
            id: Date.now(),
            text: newTodo.trim(),
            completed: false,
            priority,
            createdAt: new Date().toISOString(),
        }

        setTodos([todo, ...todos])
        setNewTodo('')
        setPriority('medium')
    }

    const toggleTodo = (id) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        )
    }

    const deleteTodo = (id) => {
        setTodos(todos.filter((todo) => todo.id !== id))
    }

    const clearCompleted = () => {
        setTodos(todos.filter((todo) => !todo.completed))
    }

    const filteredTodos = todos.filter((todo) => {
        if (filter === 'active') return !todo.completed
        if (filter === 'completed') return todo.completed
        return true
    })

    const completedCount = todos.filter((t) => t.completed).length
    const activeCount = todos.length - completedCount

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Yapılacaklar 📝</h1>
                <p className="page-subtitle">
                    {activeCount} aktif görev • {completedCount} tamamlandı
                </p>
            </div>

            {/* Add Todo Form */}
            <form onSubmit={addTodo} className="card mb-lg">
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Yeni görev ekle..."
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        style={{ flex: 1, minWidth: '200px' }}
                    />
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        style={{ width: 'auto', minWidth: '120px' }}
                    >
                        <option value="low">🟢 Düşük</option>
                        <option value="medium">🟡 Orta</option>
                        <option value="high">🔴 Yüksek</option>
                    </select>
                    <button type="submit" className="btn btn-primary">
                        <PlusIcon />
                        Ekle
                    </button>
                </div>
            </form>

            {/* Filters */}
            <div className="flex gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
                {['all', 'active', 'completed'].map((f) => (
                    <button
                        key={f}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Tamamlanan'}
                    </button>
                ))}
                {completedCount > 0 && (
                    <button
                        className="btn btn-secondary"
                        onClick={clearCompleted}
                        style={{ marginLeft: 'auto' }}
                    >
                        <TrashIcon />
                        Tamamlananları Temizle
                    </button>
                )}
            </div>

            {/* Todo List */}
            <div className="flex flex-col gap-sm">
                {filteredTodos.length === 0 ? (
                    <div className="card empty-state">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                        <p>
                            {filter === 'all'
                                ? 'Henüz görev eklenmemiş'
                                : filter === 'active'
                                    ? 'Aktif görev yok'
                                    : 'Tamamlanan görev yok'}
                        </p>
                    </div>
                ) : (
                    filteredTodos.map((todo) => (
                        <div
                            key={todo.id}
                            className="card slide-in"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-md)',
                                padding: 'var(--space-md)',
                                opacity: todo.completed ? 0.7 : 1,
                            }}
                        >
                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => toggleTodo(todo.id)}
                                />
                            </label>

                            <div style={{ flex: 1 }}>
                                <p
                                    style={{
                                        textDecoration: todo.completed ? 'line-through' : 'none',
                                        color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                    }}
                                >
                                    {todo.text}
                                </p>
                            </div>

                            <span
                                className="badge"
                                style={{
                                    background: priorityColors[todo.priority].bg,
                                    color: priorityColors[todo.priority].color,
                                }}
                            >
                                {priorityColors[todo.priority].label}
                            </span>

                            <button
                                className="btn btn-icon btn-secondary"
                                onClick={() => deleteTodo(todo.id)}
                                style={{ color: 'var(--danger)' }}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default TodoPage
