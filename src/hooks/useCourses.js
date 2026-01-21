import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useCourses() {
    const { user } = useAuth()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch courses with topics
    const fetchCourses = async () => {
        if (!user) return

        try {
            setLoading(true)
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (coursesError) throw coursesError

            // Fetch topics for each course
            const { data: topicsData, error: topicsError } = await supabase
                .from('topics')
                .select('*')
                .eq('user_id', user.id)

            if (topicsError) throw topicsError

            // Combine courses with their topics
            const coursesWithTopics = coursesData.map(course => ({
                ...course,
                topics: topicsData.filter(topic => topic.course_id === course.id)
            }))

            setCourses(coursesWithTopics)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching courses:', err)
        } finally {
            setLoading(false)
        }
    }

    // Add course
    const addCourse = async (name, colorIndex = 0) => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('courses')
                .insert([
                    {
                        user_id: user.id,
                        name,
                        color_index: colorIndex
                    }
                ])
                .select()
                .single()

            if (error) throw error
            setCourses([{ ...data, topics: [] }, ...courses])
            return { data, error: null }
        } catch (err) {
            console.error('Error adding course:', err)
            return { data: null, error: err.message }
        }
    }

    // Delete course
    const deleteCourse = async (id) => {
        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id)

            if (error) throw error
            setCourses(courses.filter(c => c.id !== id))
        } catch (err) {
            console.error('Error deleting course:', err)
        }
    }

    // Add topic to course
    const addTopic = async (courseId, topicName) => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('topics')
                .insert([
                    {
                        user_id: user.id,
                        course_id: courseId,
                        name: topicName,
                        completed: false
                    }
                ])
                .select()
                .single()

            if (error) throw error
            
            setCourses(courses.map(c => 
                c.id === courseId 
                    ? { ...c, topics: [...c.topics, data] }
                    : c
            ))
            return { data, error: null }
        } catch (err) {
            console.error('Error adding topic:', err)
            return { data: null, error: err.message }
        }
    }

    // Toggle topic
    const toggleTopic = async (courseId, topicId) => {
        const course = courses.find(c => c.id === courseId)
        const topic = course?.topics.find(t => t.id === topicId)
        if (!topic) return

        try {
            const { data, error } = await supabase
                .from('topics')
                .update({ completed: !topic.completed })
                .eq('id', topicId)
                .select()
                .single()

            if (error) throw error
            
            setCourses(courses.map(c => 
                c.id === courseId 
                    ? { ...c, topics: c.topics.map(t => t.id === topicId ? data : t) }
                    : c
            ))
        } catch (err) {
            console.error('Error toggling topic:', err)
        }
    }

    // Delete topic
    const deleteTopic = async (courseId, topicId) => {
        try {
            const { error } = await supabase
                .from('topics')
                .delete()
                .eq('id', topicId)

            if (error) throw error
            
            setCourses(courses.map(c => 
                c.id === courseId 
                    ? { ...c, topics: c.topics.filter(t => t.id !== topicId) }
                    : c
            ))
        } catch (err) {
            console.error('Error deleting topic:', err)
        }
    }

    useEffect(() => {
        fetchCourses()

        // Subscribe to realtime changes
        const coursesChannel = supabase
            .channel('courses_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'courses',
                    filter: `user_id=eq.${user?.id}`
                },
                () => {
                    fetchCourses()
                }
            )
            .subscribe()

        const topicsChannel = supabase
            .channel('topics_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'topics',
                    filter: `user_id=eq.${user?.id}`
                },
                () => {
                    fetchCourses()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(coursesChannel)
            supabase.removeChannel(topicsChannel)
        }
    }, [user])

    return {
        courses,
        loading,
        error,
        addCourse,
        deleteCourse,
        addTopic,
        toggleTopic,
        deleteTopic,
        refetch: fetchCourses
    }
}
