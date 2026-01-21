import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useLinks() {
    const { user } = useAuth()
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch links
    const fetchLinks = async () => {
        if (!user) return

        try {
            setLoading(true)
            const { data, error: fetchError } = await supabase
                .from('links')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError
            setLinks(data || [])
        } catch (err) {
            setError(err.message)
            console.error('Error fetching links:', err)
        } finally {
            setLoading(false)
        }
    }

    // Add link
    const addLink = async (name, url, logoUrl = null, emoji = null) => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('links')
                .insert([
                    {
                        user_id: user.id,
                        name,
                        url,
                        logo_url: logoUrl,
                        emoji
                    }
                ])
                .select()

            if (error) throw error
            setLinks(prev => [data[0], ...prev])
            return data[0]
        } catch (err) {
            setError(err.message)
            console.error('Error adding link:', err)
        }
    }

    // Delete link
    const deleteLink = async (id) => {
        if (!user) return

        try {
            const { error } = await supabase
                .from('links')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error
            setLinks(prev => prev.filter(link => link.id !== id))
        } catch (err) {
            setError(err.message)
            console.error('Error deleting link:', err)
        }
    }

    // Update link
    const updateLink = async (id, updates) => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('links')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()

            if (error) throw error
            setLinks(prev => prev.map(link => link.id === id ? data[0] : link))
            return data[0]
        } catch (err) {
            setError(err.message)
            console.error('Error updating link:', err)
        }
    }

    useEffect(() => {
        if (user) {
            fetchLinks()
        } else {
            setLinks([])
            setLoading(false)
        }
    }, [user])

    return {
        links,
        loading,
        error,
        addLink,
        deleteLink,
        updateLink,
        refetch: fetchLinks
    }
}
