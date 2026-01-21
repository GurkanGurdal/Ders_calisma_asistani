import { useState, useEffect, useCallback } from 'react'

// Helper to estimate localStorage usage
const getStorageSize = () => {
    let total = 0
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length * 2 // UTF-16 = 2 bytes per char
        }
    }
    return total
}

// Max file size for PDFs (2MB in base64 ~ 2.7MB)
export const MAX_FILE_SIZE = 2 * 1024 * 1024

export function useLocalStorage(key, initialValue) {
    // Initialize state
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key)
            if (item) {
                return JSON.parse(item)
            }
            return initialValue
        } catch (error) {
            console.error('Error reading localStorage:', error)
            return initialValue
        }
    })

    // Sync state with localStorage
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value

            // Check storage limit before saving (only for large data)
            const dataString = JSON.stringify(valueToStore)
            const dataSize = dataString.length * 2
            const currentSize = getStorageSize()
            const maxSize = 4.5 * 1024 * 1024 // 4.5MB safety limit

            // Only warn if data is > 100KB and total storage is > 4MB
            if (dataSize > 100 * 1024 && currentSize > 4 * 1024 * 1024) {
                console.warn('localStorage limit warning - current size:', (currentSize / 1024 / 1024).toFixed(2), 'MB')
                
                // Only show alert for very large data
                if (dataSize > 500 * 1024) {
                    alert('Depolama alanı dolmak üzere! Bazı büyük dosyaları silmeniz gerekebilir.')
                }
            }

            // Update state first
            setStoredValue(valueToStore)

            // Then try to save
            window.localStorage.setItem(key, dataString)

        } catch (error) {
            console.error('Error setting localStorage:', error)

            // If quota exceeded, show warning
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                alert('Depolama alanı dolu! Lütfen bazı PDF veya notları silin.')
            }
        }
    }, [key, storedValue])

    // Listen for storage changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue) {
                try {
                    setStoredValue(JSON.parse(e.newValue))
                } catch (error) {
                    console.error('Error parsing storage event:', error)
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [key])

    return [storedValue, setValue]
}

export default useLocalStorage
