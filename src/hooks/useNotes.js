import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useNotes() {
    const { user } = useAuth()
    const [pdfs, setPdfs] = useState([])
    const [postits, setPostits] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    // Fetch PDFs
    const fetchPdfs = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('pdfs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPdfs(data || [])
        } catch (err) {
            console.error('Error fetching pdfs:', err)
        }
    }

    // Fetch Post-its
    const fetchPostits = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('postits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPostits(data || [])
        } catch (err) {
            console.error('Error fetching postits:', err)
        }
    }

    // Upload PDF
    const uploadPdf = async (file) => {
        if (!user) return { data: null, error: 'No user' }

        // Check storage limit
        const { data: pdfs } = await supabase
            .from('pdfs')
            .select('file_size')
            .eq('user_id', user.id)

        const { data: postits } = await supabase
            .from('postits')
            .select('type')
            .eq('user_id', user.id)
            .eq('type', 'image')

        const currentPdfSize = pdfs?.reduce((sum, pdf) => sum + (pdf.file_size || 0), 0) || 0
        const estimatedImageSize = (postits?.length || 0) * 200000
        const totalUsed = currentPdfSize + estimatedImageSize
        const storageLimit = 1 * 1024 * 1024 * 1024 // 1GB

        if (totalUsed + file.size > storageLimit) {
            return { 
                data: null, 
                error: `Depolama alanı yetersiz! \nKullanılan: ${formatBytes(totalUsed)} \nGereken: ${formatBytes(file.size)} \nLimit: 1 GB\n\nEski dosyaları silin veya pro plana geçin.`
            }
        }

        try {
            setUploading(true)
            
            // Upload to storage
            const fileName = `${user.id}/${Date.now()}_${file.name}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('pdfs')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('pdfs')
                .getPublicUrl(fileName)

            // Save metadata to database
            const { data, error } = await supabase
                .from('pdfs')
                .insert([
                    {
                        user_id: user.id,
                        name: file.name,
                        file_url: publicUrl,
                        file_size: file.size
                    }
                ])
                .select()
                .single()

            if (error) throw error

            setPdfs([data, ...pdfs])
            return { data, error: null }
        } catch (err) {
            console.error('Error uploading PDF:', err)
            return { data: null, error: err.message }
        } finally {
            setUploading(false)
        }
    }

// Helper function
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

    // Delete PDF
    const deletePdf = async (pdf) => {
        try {
            // Delete from storage
            const fileName = pdf.file_url.split('/').pop()
            const { error: storageError } = await supabase.storage
                .from('pdfs')
                .remove([`${user.id}/${fileName}`])

            if (storageError) console.error('Storage deletion error:', storageError)

            // Delete from database
            const { error } = await supabase
                .from('pdfs')
                .delete()
                .eq('id', pdf.id)

            if (error) throw error
            setPdfs(pdfs.filter(p => p.id !== pdf.id))
        } catch (err) {
            console.error('Error deleting PDF:', err)
        }
    }

    // Add text post-it
    const addTextPostit = async (text, colorIndex = 0) => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('postits')
                .insert([
                    {
                        user_id: user.id,
                        type: 'text',
                        text,
                        color_index: colorIndex
                    }
                ])
                .select()
                .single()

            if (error) throw error
            setPostits(prev => [data, ...prev])
            return { data, error: null }
        } catch (err) {
            console.error('Error adding post-it:', err)
            return { data: null, error: err.message }
        }
    }

    // Upload image post-it
    const uploadImagePostit = async (file, colorIndex = 0) => {
        if (!user) return { data: null, error: 'No user' }

        // Check storage limit
        const { data: pdfs } = await supabase
            .from('pdfs')
            .select('file_size')
            .eq('user_id', user.id)

        const { data: postits } = await supabase
            .from('postits')
            .select('type')
            .eq('user_id', user.id)
            .eq('type', 'image')

        const currentPdfSize = pdfs?.reduce((sum, pdf) => sum + (pdf.file_size || 0), 0) || 0
        const estimatedImageSize = (postits?.length || 0) * 200000
        const totalUsed = currentPdfSize + estimatedImageSize
        const storageLimit = 1 * 1024 * 1024 * 1024 // 1GB
        const estimatedFileSize = file.size // Use actual file size

        if (totalUsed + estimatedFileSize > storageLimit) {
            return { 
                data: null, 
                error: `Depolama alanı yetersiz! \nKullanılan: ${formatBytes(totalUsed)} \nGereken: ${formatBytes(estimatedFileSize)} \nLimit: 1 GB\n\nEski dosyaları silin veya pro plana geçin.`
            }
        }

        try {
            setUploading(true)
            
            // Upload to storage
            const fileName = `${user.id}/${Date.now()}_${file.name}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName)

            // Save to database
            const { data, error } = await supabase
                .from('postits')
                .insert([
                    {
                        user_id: user.id,
                        type: 'image',
                        image_url: publicUrl,
                        color_index: colorIndex
                    }
                ])
                .select()
                .single()

            if (error) throw error

            // Update local state immediately (realtime will sync later)
            setPostits(prev => [data, ...prev])
            return { data, error: null }
        } catch (err) {
            console.error('Error uploading image post-it:', err)
            return { data: null, error: err.message }
        } finally {
            setUploading(false)
        }
    }

    // Delete post-it
    const deletePostit = async (postit) => {
        try {
            // Delete image from storage if exists
            if (postit.type === 'image' && postit.image_url) {
                const fileName = postit.image_url.split('/').pop()
                const { error: storageError } = await supabase.storage
                    .from('images')
                    .remove([`${user.id}/${fileName}`])

                if (storageError) console.error('Storage deletion error:', storageError)
            }

            // Delete from database
            const { error } = await supabase
                .from('postits')
                .delete()
                .eq('id', postit.id)

            if (error) throw error
            setPostits(postits.filter(p => p.id !== postit.id))
        } catch (err) {
            console.error('Error deleting post-it:', err)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await Promise.all([fetchPdfs(), fetchPostits()])
            setLoading(false)
        }

        loadData()

        // Subscribe to realtime changes
        const pdfsChannel = supabase
            .channel('pdfs_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'pdfs',
                    filter: `user_id=eq.${user?.id}`
                },
                () => fetchPdfs()
            )
            .subscribe()

        const postitsChannel = supabase
            .channel('postits_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'postits',
                    filter: `user_id=eq.${user?.id}`
                },
                () => fetchPostits()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(pdfsChannel)
            supabase.removeChannel(postitsChannel)
        }
    }, [user])

    return {
        pdfs,
        postits,
        loading,
        uploading,
        uploadPdf,
        deletePdf,
        addTextPostit,
        uploadImagePostit,
        deletePostit,
        refetch: async () => {
            await Promise.all([fetchPdfs(), fetchPostits()])
        }
    }
}
