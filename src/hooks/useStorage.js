import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useStorage() {
    const { user } = useAuth()
    const [storageStats, setStorageStats] = useState({
        pdfSize: 0,
        imageSize: 0,
        totalSize: 0,
        fileCount: 0,
        loading: true
    })

    const calculateStorage = async () => {
        if (!user) return

        try {
            // Get PDF files
            const { data: pdfs } = await supabase
                .from('pdfs')
                .select('file_size')
                .eq('user_id', user.id)

            // Get post-its (we'll estimate image sizes)
            const { data: postits } = await supabase
                .from('postits')
                .select('type')
                .eq('user_id', user.id)
                .eq('type', 'image')

            const pdfSize = pdfs?.reduce((sum, pdf) => sum + (pdf.file_size || 0), 0) || 0
            const imageCount = postits?.length || 0
            const estimatedImageSize = imageCount * 200000 // ~200KB per image average

            const totalSize = pdfSize + estimatedImageSize
            const fileCount = (pdfs?.length || 0) + imageCount

            setStorageStats({
                pdfSize,
                imageSize: estimatedImageSize,
                totalSize,
                fileCount,
                loading: false
            })
        } catch (error) {
            console.error('Error calculating storage:', error)
            setStorageStats(prev => ({ ...prev, loading: false }))
        }
    }

    useEffect(() => {
        calculateStorage()
    }, [user])

    return {
        storageStats,
        refetch: calculateStorage
    }
}

// Format bytes to human readable
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
