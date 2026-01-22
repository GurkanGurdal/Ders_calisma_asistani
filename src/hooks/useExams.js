import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// TYT Ders Bilgileri
export const TYT_SUBJECTS = [
    { id: 'turkce', name: 'Türkçe', maxQuestions: 40 },
    { id: 'matematik', name: 'Matematik', maxQuestions: 40 },
    { id: 'fen', name: 'Fen Bilimleri', maxQuestions: 20 },
    { id: 'sosyal', name: 'Sosyal Bilimler', maxQuestions: 20 }
]

// AYT Ders Bilgileri
export const AYT_SUBJECTS = [
    { id: 'matematik', name: 'Matematik', maxQuestions: 40 },
    { id: 'fizik', name: 'Fizik', maxQuestions: 14 },
    { id: 'kimya', name: 'Kimya', maxQuestions: 13 },
    { id: 'biyoloji', name: 'Biyoloji', maxQuestions: 13 },
    { id: 'edebiyat', name: 'Edebiyat', maxQuestions: 24 },
    { id: 'tarih1', name: 'Tarih-1', maxQuestions: 10 },
    { id: 'cografya1', name: 'Coğrafya-1', maxQuestions: 6 },
    { id: 'tarih2', name: 'Tarih-2', maxQuestions: 11 },
    { id: 'cografya2', name: 'Coğrafya-2', maxQuestions: 11 },
    { id: 'felsefe', name: 'Felsefe Grubu', maxQuestions: 12 },
    { id: 'din', name: 'Din Kültürü', maxQuestions: 6 }
]

// Net hesaplama fonksiyonu
export const calculateNet = (dogru, yanlis) => {
    return Math.max(0, dogru - (yanlis / 4))
}

// Toplam net hesaplama
export const calculateTotalNet = (examData, examType) => {
    const subjects = examType === 'TYT' ? TYT_SUBJECTS : AYT_SUBJECTS
    const prefix = examType === 'TYT' ? 'tyt_' : 'ayt_'
    
    let totalNet = 0
    subjects.forEach(subject => {
        const dogru = examData[`${prefix}${subject.id}_dogru`] || 0
        const yanlis = examData[`${prefix}${subject.id}_yanlis`] || 0
        totalNet += calculateNet(dogru, yanlis)
    })
    
    return totalNet
}

// Ders bazlı net hesaplama
export const calculateSubjectNets = (examData, examType) => {
    const subjects = examType === 'TYT' ? TYT_SUBJECTS : AYT_SUBJECTS
    const prefix = examType === 'TYT' ? 'tyt_' : 'ayt_'
    
    return subjects.map(subject => {
        const dogru = examData[`${prefix}${subject.id}_dogru`] || 0
        const yanlis = examData[`${prefix}${subject.id}_yanlis`] || 0
        const bos = examData[`${prefix}${subject.id}_bos`] || 0
        const net = calculateNet(dogru, yanlis)
        
        return {
            ...subject,
            dogru,
            yanlis,
            bos,
            net,
            percentage: (net / subject.maxQuestions) * 100
        }
    })
}

export function useExams() {
    const { user } = useAuth()
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)

    // Denemeleri getir
    const fetchExams = async () => {
        if (!user) return
        
        setLoading(true)
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .eq('user_id', user.id)
            .order('exam_date', { ascending: false })
        
        if (error) {
            console.error('Error fetching exams:', error)
        } else {
            setExams(data || [])
        }
        setLoading(false)
    }

    // Yeni deneme ekle
    const addExam = async (examData) => {
        if (!user) return { error: 'User not authenticated' }
        
        const { data, error } = await supabase
            .from('exams')
            .insert([{ ...examData, user_id: user.id }])
            .select()
        
        if (error) {
            console.error('Error adding exam:', error)
            return { error }
        }
        
        setExams(prev => [data[0], ...prev])
        return { data: data[0] }
    }

    // Deneme güncelle
    const updateExam = async (id, updates) => {
        const { data, error } = await supabase
            .from('exams')
            .update(updates)
            .eq('id', id)
            .select()
        
        if (error) {
            console.error('Error updating exam:', error)
            return { error }
        }
        
        setExams(prev => prev.map(exam => exam.id === id ? data[0] : exam))
        return { data: data[0] }
    }

    // Deneme sil
    const deleteExam = async (id) => {
        const { error } = await supabase
            .from('exams')
            .delete()
            .eq('id', id)
        
        if (error) {
            console.error('Error deleting exam:', error)
            return { error }
        }
        
        setExams(prev => prev.filter(exam => exam.id !== id))
        return { success: true }
    }

    // Grafik verilerini hazırla
    const getChartData = (examType) => {
        const filteredExams = exams
            .filter(exam => exam.exam_type === examType)
            .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
        
        return filteredExams.map(exam => ({
            date: new Date(exam.exam_date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
            fullDate: exam.exam_date,
            totalNet: calculateTotalNet(exam, examType),
            subjectNets: calculateSubjectNets(exam, examType)
        }))
    }

    // İstatistikler
    const getStats = (examType) => {
        const filteredExams = exams.filter(exam => exam.exam_type === examType)
        
        if (filteredExams.length === 0) {
            return { count: 0, avgNet: 0, maxNet: 0, minNet: 0, trend: 0 }
        }
        
        const nets = filteredExams.map(exam => calculateTotalNet(exam, examType))
        const avgNet = nets.reduce((a, b) => a + b, 0) / nets.length
        const maxNet = Math.max(...nets)
        const minNet = Math.min(...nets)
        
        // Son 2 deneme arasındaki fark
        let trend = 0
        if (filteredExams.length >= 2) {
            const sorted = [...filteredExams].sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date))
            const lastNet = calculateTotalNet(sorted[0], examType)
            const prevNet = calculateTotalNet(sorted[1], examType)
            trend = lastNet - prevNet
        }
        
        return {
            count: filteredExams.length,
            avgNet: avgNet.toFixed(2),
            maxNet: maxNet.toFixed(2),
            minNet: minNet.toFixed(2),
            trend: trend.toFixed(2)
        }
    }

    useEffect(() => {
        fetchExams()
    }, [user])

    return {
        exams,
        loading,
        addExam,
        updateExam,
        deleteExam,
        fetchExams,
        getChartData,
        getStats,
        calculateTotalNet,
        calculateSubjectNets
    }
}
