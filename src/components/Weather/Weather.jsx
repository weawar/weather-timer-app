import { useState, useEffect, useRef } from 'react'
import './Weather.css'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const DEFAULT_CITY = 'Тюмень'

function Weather({ onClose }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [inputCity, setInputCity] = useState('')
  const [geoError, setGeoError] = useState('')
  const [weatherError, setWeatherError] = useState('')
  const [failedCities, setFailedCities] = useState(new Set())
  const abortControllerRef = useRef(null)

  const fetchWeather = async (lat, lon) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
        { signal: abortControllerRef.current.signal }
      )

      if (!response.ok) {
        throw new Error('Weather fetch failed')
      }

      const data = await response.json()
      setWeather({
        city: data.name,
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity
      })
      setWeatherError('')
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Weather fetch error:', error)
        setWeather(null)
        setWeatherError('Не удалось получить данные')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchCoordinates = async (cityName) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`,
        { signal: abortControllerRef.current.signal }
      )

      if (!response.ok) {
        throw new Error('Geocoding fetch failed')
      }

      const data = await response.json()

      if (data.length === 0) {
        throw new Error('City not found')
      }

      setGeoError('')
      await fetchWeather(data[0].lat, data[0].lon)
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Geocoding error:', error)
        setGeoError(`Не удалось получить данные для города ${cityName}`)
        setFailedCities(prev => new Set(prev).add(cityName.toLowerCase()))
        setInputCity('')
        setLoading(false)
      }
    }
  }

  const handleGetWeather = async () => {
    if (!inputCity.trim()) return

    const cityName = inputCity.trim()
    
    if (failedCities.has(cityName.toLowerCase())) {
      setGeoError(`Не удалось получить данные для города ${cityName}`)
      return
    }

    setCity(inputCity)
    setLoading(true)
    setWeatherError('')
    setGeoError('')
    await fetchCoordinates(cityName)
  }

  const handleCityChange = (e) => {
    setInputCity(e.target.value)
    setGeoError('')
  }

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGetWeather()
    }
  }

  // Initial load with geolocation or default city
  useEffect(() => {
    const initializeData = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // User allowed geolocation
            await fetchWeather(position.coords.latitude, position.coords.longitude)
            setCity('Your Location')
            setInputCity('Your Location')
          },
          async () => {
            // User denied or error, fallback to default city
            setCity(DEFAULT_CITY)
            setInputCity(DEFAULT_CITY)
            await fetchCoordinates(DEFAULT_CITY)
          }
        )
      } else {
        // Geolocation not supported, use default city
        setCity(DEFAULT_CITY)
        setInputCity(DEFAULT_CITY)
        await fetchCoordinates(DEFAULT_CITY)
      }
    }

    initializeData()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="weather-widget">
      <button className="close-btn" onClick={onClose}>✕</button>
      <h2>Погода</h2>

      {loading ? (
        <div className="loading-skeleton">
          <div className="skeleton-box skeleton-weather-icon"></div>
          <div className="skeleton-box skeleton-temp"></div>
          <div className="skeleton-box skeleton-desc"></div>
          <div className="skeleton-box skeleton-details"></div>
        </div>
      ) : (
        <div className="weather-content">
          {weather ? (
            <div className="weather-data">
              <div className="weather-main">
                <img 
                  src={`https://openweathermap.org/img/w/${weather.icon}.png`}
                  alt={weather.description}
                  className="weather-icon"
                />
                <div className="weather-temp">{weather.temp}°C</div>
              </div>
              <div className="weather-description">{weather.description}</div>
              <div className="weather-details">
                <span>Ощущается как: {weather.feelsLike}°C</span>
                <span>Влажность: {weather.humidity}%</span>
              </div>
            </div>
          ) : (
            <div className="weather-data empty">
              <p>Нет данных о погоде</p>
              {weatherError && <div className="error-message">{weatherError}</div>}
            </div>
          )}

          <div className="weather-search">
            <input
              type="text"
              value={inputCity}
              onChange={handleCityChange}
              onKeyPress={handleInputKeyPress}
              placeholder="Введите название города"
              disabled={loading}
              className="city-input"
            />
            <button 
              onClick={handleGetWeather}
              disabled={loading || !inputCity.trim()}
              className="get-weather-btn"
            >
              Получить погоду
            </button>
            {geoError && <div className="error-message geo-error">{geoError}</div>}
            {weatherError && <div className="error-message">{weatherError}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather