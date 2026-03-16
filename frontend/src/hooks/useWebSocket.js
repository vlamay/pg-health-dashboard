import { useEffect, useRef, useState } from 'react'
import { generateMockData, updateMockData } from '../utils/mockData'

export function useWebSocket(url) {
  const ws = useRef(null)
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('connecting')
  const [lastUpdated, setLastUpdated] = useState(null)
  const reconnectTimeoutRef = useRef(null)
  const updateIntervalRef = useRef(null)
  const mockDataRef = useRef(null)

  // Check if demo mode is enabled
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true'

  // Calculate adaptive polling interval based on data severity
  const getPollingInterval = (currentData) => {
    if (!currentData) return 10000 // default 10s

    const hasBlockingQueries = currentData.blocking_queries?.length > 0
    const hasLockWaits = currentData.lock_waits?.length > 0
    const maxReplicationLag = currentData.replication_lag?.reduce((max, r) => Math.max(max, r.replay_lag_s || 0), 0) || 0

    // Critical issues: 2s polling
    if (hasBlockingQueries || hasLockWaits) {
      return 2000
    }

    // High replication lag: 3s polling
    if (maxReplicationLag > 5) {
      return 3000
    }

    // Normal: 10s polling (reduce server load)
    return 10000
  }

  useEffect(() => {
    // Demo mode: use mock data
    if (isDemoMode) {
      console.log('🎨 Demo mode enabled - using mock data')

      // Initialize mock data after a short delay to show connecting state
      setTimeout(() => {
        mockDataRef.current = generateMockData()
        setData(mockDataRef.current)
        setLastUpdated(new Date())
        setStatus('open')
      }, 1000)

      // Update mock data periodically with adaptive interval
      const scheduleNextUpdate = () => {
        if (updateIntervalRef.current) {
          clearTimeout(updateIntervalRef.current)
        }

        const interval = getPollingInterval(mockDataRef.current)
        updateIntervalRef.current = setTimeout(() => {
          mockDataRef.current = updateMockData(mockDataRef.current)
          setData(JSON.parse(JSON.stringify(mockDataRef.current)))
          setLastUpdated(new Date())
          scheduleNextUpdate() // Schedule next update with potentially different interval
        }, interval)
      }

      scheduleNextUpdate()

      return () => {
        if (updateIntervalRef.current) {
          clearTimeout(updateIntervalRef.current)
        }
      }
    }

    // Real WebSocket mode
    const connect = () => {
      try {
        ws.current = new WebSocket(url)

        ws.current.onopen = () => {
          setStatus('open')
          console.log('WebSocket connected')
        }

        ws.current.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data)
            setData(parsed)
            setLastUpdated(new Date())
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e)
          }
        }

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error)
          setStatus('error')
        }

        ws.current.onclose = () => {
          setStatus('closed')
          console.log('WebSocket closed, reconnecting in 3s...')
          // Reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, 3000)
        }
      } catch (e) {
        console.error('Failed to create WebSocket:', e)
        setStatus('error')
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url, isDemoMode])

  return { data, status, lastUpdated }
}
