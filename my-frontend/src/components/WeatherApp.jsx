import React, { useState, useEffect } from "react";
import "./WeatherApp.css";
import { WiRain, WiDaySunny, WiCloudy } from "react-icons/wi";
import { WEATHER_API_URL, OPEN_CAGE_API_URL, OPEN_CAGE_API_KEY } from '../service/apiUrl.js';

const HourlyForecastCard = ({ hour, temperature, apparentTemperature, precipitation, precipitationProbability }) => {
  const getWeatherIcon = () => {
    if (precipitation > 0 || precipitationProbability > 0) return <WiRain size={32} />;
    if (temperature < 0) return <WiCloudy size={32} color="gray" />;
    return <WiDaySunny size={32} color="orange" />;
  };

  const getTimeOfDayClass = () => {
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    if (hour >= 18 && hour < 21) return "evening";
    return "night";
  };

  return (
    <div className={`hourly-forecast-card ${getTimeOfDayClass()}`}>
      <h4>{hour}:00</h4>
      <div className="weather-icon">
        {getWeatherIcon()}
        {precipitationProbability > 0 && (
          <span className="precipitation-probability">
            {precipitationProbability}% chance
          </span>
        )}
      </div>
      <p>Temp: {temperature}°C</p>
      <p>Feels Like: {apparentTemperature}°C</p>
    </div>
  );
};

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("Belgrade");
  const [inputValue, setInputValue] = useState("Belgrade");
  const [currentHourIndex, setCurrentHourIndex] = useState(0);

  const fetchCoordinates = async (cityName) => {
    const url = `${OPEN_CAGE_API_URL}?q=${encodeURIComponent(cityName)}&key=${OPEN_CAGE_API_KEY}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Unable to fetch city coordinates");
      const data = await response.json();
      if (data.results.length === 0) throw new Error("City not found");
      const { lat, lng } = data.results[0].geometry;
      return { latitude: lat, longitude: lng };
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      const coordinates = await fetchCoordinates(city);
      if (!coordinates) return;

      const { latitude, longitude } = coordinates;
      const weatherUrl = `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,apparent_temperature,precipitation&timezone=auto&forecast_days=1`;

      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error("Unable to fetch weather data");
      const data = await response.json();
      setWeatherData(data);

      const currentHour = new Date().getHours();
      const index = data.hourly.time.findIndex((time) => {
        return new Date(time).getHours() === currentHour;
      });
      setCurrentHourIndex(index !== -1 ? index : 0);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSearch = () => {
    setCity(inputValue);
    fetchWeather();
  };

  const hourlyData = weatherData?.hourly;

  const chunkedHourlyData = [];
  if (hourlyData) {
    for (let i = 0; i < hourlyData.time.length; i += 3) {
      chunkedHourlyData.push(hourlyData.time.slice(i, i + 3));
    }
  }

  return (
    <div className="weather-container">
      <div className="search-form">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter city"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {weatherData && (
        <div className="weather-details">
          <h3>Weather in {city}</h3>
          <div id="hourlyForecastCarousel" className="carousel slide">
            <div className="carousel-inner">
              {chunkedHourlyData.map((chunk, chunkIndex) => (
                <div
                  key={chunkIndex}
                  className={`carousel-item ${
                    chunkIndex === Math.floor(currentHourIndex / 3) ? "active" : ""
                  }`}
                >
                  <div className="d-flex justify-content-center">
                    {chunk.map((time, index) => {
                      const hour = new Date(time).getHours();
                      const dataIndex = chunkIndex * 3 + index;
                      return (
                        <HourlyForecastCard
                          key={dataIndex}
                          hour={hour}
                          temperature={hourlyData.temperature_2m[dataIndex]}
                          apparentTemperature={hourlyData.apparent_temperature[dataIndex]}
                          precipitation={hourlyData.precipitation[dataIndex]}
                          precipitationProbability={hourlyData.precipitation_probability[dataIndex]}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#hourlyForecastCarousel"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#hourlyForecastCarousel"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
