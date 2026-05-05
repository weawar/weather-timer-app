import { useState } from 'react'
import Timer from './components/Timer/Timer'
import Weather from './components/Weather/Weather'
import ModalButton from './components/Modal/ModalButton'
import './App.css'

function App() {
  const [showTimer, setShowTimer] = useState(true)
  const [showWeather, setShowWeather] = useState(true)

  return (
    <div className="app">
      <h1>Weather & Timer Application</h1>
      <div className="widgets-container">
        {showTimer ? (
          <Timer onClose={() => setShowTimer(false)} />
        ) : (
          <button className="show-widget-btn" onClick={() => setShowTimer(true)}>
            Show Timer
          </button>
        )}
        
        {showWeather ? (
          <Weather onClose={() => setShowWeather(false)} />
        ) : (
          <button className="show-widget-btn" onClick={() => setShowWeather(true)}>
            Show Weather
          </button>
        )}
        
        <ModalButton />
      </div>
    </div>
  )
}

export default App