import React, { useState, useEffect } from 'react';
import './WeatherApp.css';

const HourlyForecastCard = ({ hour, temperature_2m, precipitation, windSpeed }) => {
    const isRaining = precipitation > 0;
  return (
    <div className="hourly-forecast-card">
      <h4>{hour}:00</h4>
      <p>Temperature: {temperature_2m}°C</p>
      <p>Precipitation: {precipitation} mm</p>
      <p>Wind: {windSpeed} m/s</p>
      <p>{isRaining ? 'Rain' : 'No rain'}</p>
    </div>
  );
};

const WeatherApp = () => {
  const [city, setCity] = useState('Belgrade');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=44.8031&longitude=20.4814&hourly=temperature_2m,precipitation,wind_speed_10m&temperature_unit=celsius&precipitation_unit=mm&forecast_days=1`
      );

      if (!response.ok) {
        throw new Error('Unable to fetch weather data');
      }
      const data = await response.json();
      console.log(data);
      setWeatherData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [city]);

  const handleCityChange = (event) => {
    setCity(event.target.value);
    fetchWeather();
  };

  const hourlyData = weatherData?.hourly;

  const getHourlyData = (index, type) => {
    if (hourlyData && hourlyData[type]) {
      return hourlyData[type][index] ?? 'N/A'; 
    }
    return 'N/A';
  };

  return (
    <div className="weather-container">
      <h2>Weather App</h2>
      <input
        type="text"
        value={city}
        onChange={handleCityChange}
        placeholder="Enter city name"
      />
      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {weatherData && weatherData.current_weather && (
        <div className="weather-details">
          <h3>Weather in {city}</h3>
          <p>Current Temperature: {weatherData.current_weather.temperature_2m}°C</p>
          <p>Current Wind: {weatherData.current_weather.windspeed} m/s</p>
          <p>{isRaining ? 'It is raining' : 'No rain at the moment'}</p>
        </div>
      )}

      {hourlyData && (
        <div className="hourly-forecast-container">
          <h3>Hourly Forecast</h3>
          <div className="hourly-forecast-cards">
            {hourlyData.time?.map((time, index) => {
              const hour = new Date(time).getHours();
              const temperature = getHourlyData(index, 'temperature_2m');
              const precipitation = getHourlyData(index, 'precipitation');
              const windSpeed = getHourlyData(index, 'wind_speed_10m');
              return (
                <HourlyForecastCard
                  key={index}
                  hour={hour}
                  temperature_2m={temperature}
                  precipitation={precipitation}
                  windSpeed={windSpeed}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
