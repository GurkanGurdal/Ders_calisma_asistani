import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useSchedule() {
    const { user } = useAuth()
    const [scheduleBlocks, setScheduleBlocks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch schedule blocks
    const fetchScheduleBlocks = async () => {
        if (!user) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('schedule_blocks')
                .select('*')
                .eq('user_id', user.id)
                .order('day', { ascending: true })
                .order('start_hour', { ascending: true })

            if (error) throw error
            setScheduleBlocks(data || [])
        } catch (err) {
            setError(err.message)
            console.error('Error fetching schedule blocks:', err)
        } finally {
            setLoading(false)
        }
    }

    // Add schedule block
    const addBlock = async (blockData) => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('schedule_blocks')
                .insert([{ user_id: user.id, ...blockData }])
                .select()
                .single()

            if (error) throw error
            setScheduleBlocks(prev => [...prev, data])
            return { data, error: null }
        } catch (err) {
            console.error('Error adding schedule block:', err)
            return { data: null, error: err.message }
        }
    }

    // Delete schedule block
    const deleteBlock = async (id) => {
        try {
            const { error } = await supabase
                .from('schedule_blocks')
                .delete()
                .eq('id', id)

            if (error) throw error
            setScheduleBlocks(scheduleBlocks.filter(b => b.id !== id))
        } catch (err) {
            console.error('Error deleting schedule block:', err)
        }
    }

    useEffect(() => {
        fetchScheduleBlocks()

        // Subscribe to realtime changes
        const channel = supabase
            .channel('schedule_blocks_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'schedule_blocks',
                    filter: `user_id=eq.${user?.id}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setScheduleBlocks(prev => [...prev, payload.new])
                    } else if (payload.eventType === 'DELETE') {
                        setScheduleBlocks(prev => prev.filter(b => b.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    return {
        scheduleBlocks,
        loading,
        error,
        addBlock,
        deleteBlock,
        refetch: fetchScheduleBlocks
    }
}
