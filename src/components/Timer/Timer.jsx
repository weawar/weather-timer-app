import { useState, useEffect, useRef, useCallback } from 'react'
import './Timer.css'

const INITIAL_TIME = 3599 

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function Timer({ onClose }) {
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME)
  const [isRunning, setIsRunning] = useState(true)
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef(null)
  const isRunningRef = useRef(true)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    isRunningRef.current = true
    setIsRunning(true)
    
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer()
          isRunningRef.current = false
          setIsRunning(false)
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  useEffect(() => {
    startTimer()
    
    return () => {
      clearTimer()
    }
  }, [startTimer, clearTimer])

  const handleTogglePause = () => {
    if (isExpired) return
    
    if (isRunning) {
      clearTimer()
      isRunningRef.current = false
      setIsRunning(false)
    } else {
      startTimer()
    }
  }

  const handleRestart = () => {
    clearTimer()
    setTimeLeft(INITIAL_TIME)
    setIsExpired(false)
    
    if (!isRunning && !isExpired) {
      setIsRunning(false)
      isRunningRef.current = false
    } else {
      startTimer()
    }
  }

  return (
    <div className="timer-widget">
      <button className="close-btn" onClick={onClose}>✕</button>
      <h2>Таймер</h2>
      <div className="timer-display">
        {isExpired ? (
          <span className="expired-text">таймер истёк</span>
        ) : (
          <span className="time-text">{formatTime(timeLeft)}</span>
        )}
      </div>
      <div className="timer-controls">
        <button 
          className={`toggle-btn ${!isRunning ? 'running' : ''}`}
          onClick={handleTogglePause}
          disabled={isExpired}
        >
          {isRunning ? 'стоп' : 'возобновить'}
        </button>
        <button 
          className={`restart-btn ${isExpired ? 'highlight' : ''}`}
          onClick={handleRestart}
        >
          рестарт
        </button>
      </div>
    </div>
  )
}

export default Timer