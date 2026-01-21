import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTodos() {
    const { user } = useAuth()
    const [todos, setTodos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch todos
    const fetchTodos = async () => {
        if (!user) return
        
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTodos(data || [])
        } catch (err) {
            setError(err.message)
            console.error('Error fetching todos:', err)
        } finally {
            setLoading(false)
        }
    }

    // Add todo
    const addTodo = async (text, priority = 'medium') => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('todos')
                .insert([
                    {
                        user_id: user.id,
                        text,
                        priority,
                        completed: false
                    }
                ])
                .select()
                .single()

            if (error) throw error
            setTodos([data, ...todos])
            return { data, error: null }
        } catch (err) {
            console.error('Error adding todo:', err)
            return { data: null, error: err.message }
        }
    }

    // Toggle todo
    const toggleTodo = async (id) => {
        const todo = todos.find(t => t.id === id)
        if (!todo) return

        try {
            const { data, error } = await supabase
                .from('todos')
                .update({ completed: !todo.completed })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            setTodos(todos.map(t => t.id === id ? data : t))
        } catch (err) {
            console.error('Error toggling todo:', err)
        }
    }

    // Delete todo
    const deleteTodo = async (id) => {
        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id)

            if (error) throw error
            setTodos(todos.filter(t => t.id !== id))
        } catch (err) {
            console.error('Error deleting todo:', err)
        }
    }

    // Clear completed
    const clearCompleted = async () => {
        const completedIds = todos.filter(t => t.completed).map(t => t.id)
        
        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .in('id', completedIds)

            if (error) throw error
            setTodos(todos.filter(t => !t.completed))
        } catch (err) {
            console.error('Error clearing completed todos:', err)
        }
    }

    useEffect(() => {
        fetchTodos()

        // Subscribe to realtime changes
        const channel = supabase
            .channel('todos_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'todos',
                    filter: `user_id=eq.${user?.id}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTodos(prev => [payload.new, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setTodos(prev => prev.map(t => t.id === payload.new.id ? payload.new : t))
                    } else if (payload.eventType === 'DELETE') {
                        setTodos(prev => prev.filter(t => t.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    return {
        todos,
        loading,
        error,
        addTodo,
        toggleTodo,
        deleteTodo,
        clearCompleted,
        refetch: fetchTodos
    }
}
