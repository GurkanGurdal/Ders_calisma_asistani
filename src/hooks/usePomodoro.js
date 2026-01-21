import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function usePomodoro() {
    const { user } = useAuth()
    const [sessions, setSessions] = useState([])
    const [stats, setStats] = useState({ totalSessions: 0, totalMinutes: 0, today: 0 })
    const [loading, setLoading] = useState(true)

    // Fetch sessions and calculate stats
    const fetchSessions = async () => {
        if (!user) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('pomodoro_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            setSessions(data || [])

            // Calculate stats
            const workSessions = data.filter(s => s.mode === 'work')
            const totalSessions = workSessions.length
            const totalMinutes = workSessions.reduce((sum, s) => sum + s.duration, 0)
            
            // Today's sessions
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const todaySessions = workSessions.filter(s => {
                const sessionDate = new Date(s.created_at)
                sessionDate.setHours(0, 0, 0, 0)
                return sessionDate.getTime() === today.getTime()
            }).length

            setStats({
                totalSessions,
                totalMinutes,
                today: todaySessions
            })
        } catch (err) {
            console.error('Error fetching pomodoro sessions:', err)
        } finally {
            setLoading(false)
        }
    }

    // Add session
    const addSession = async (mode, duration) => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('pomodoro_sessions')
                .insert([
                    {
                        user_id: user.id,
                        mode,
                        duration,
                        completed: true
                    }
                ])
                .select()
                .single()

            if (error) throw error

            setSessions([data, ...sessions])
            
            // Update stats
            if (mode === 'work') {
                setStats(prev => ({
                    totalSessions: prev.totalSessions + 1,
                    totalMinutes: prev.totalMinutes + duration,
                    today: prev.today + 1
                }))
            }

            return { data, error: null }
        } catch (err) {
            console.error('Error adding pomodoro session:', err)
            return { data: null, error: err.message }
        }
    }

    useEffect(() => {
        fetchSessions()

        // Subscribe to realtime changes
        const channel = supabase
            .channel('pomodoro_sessions_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'pomodoro_sessions',
                    filter: `user_id=eq.${user?.id}`
                },
                () => {
                    fetchSessions()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    return {
        sessions,
        stats,
        loading,
        addSession,
        refetch: fetchSessions
    }
}
