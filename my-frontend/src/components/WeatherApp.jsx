import React, { useState, useEffect } from "react";
import "./WeatherApp.css";
import { WiRain, WiDaySunny, WiCloudy, WiNightClear, WiDayCloudy } from "react-icons/wi";

const HourlyForecastCard = ({
  hour,
  temperature_2m,
  apparenttemperature,
  precipitation,
}) => {
  const isRaining = precipitation > 0;

  const getWeatherIcon = () => {
    if (isRaining) return <WiRain size={24} color="blue" />;
    if (temperature_2m < 0) return <WiCloudy size={24} color="gray" />;
    return <WiDaySunny size={24} color="orange" />;
  };

  const getTimeOfDayIcon = () => {
    if (hour >= 6 && hour < 12) return <WiDaySunny size={24} color="gold" />;
    if (hour >= 12 && hour < 18) return <WiDayCloudy size={24} color="orange" />;
    if (hour >= 18 && hour < 21) return <WiCloudy size={24} color="gray" />;
    return <WiNightClear size={24} color="navy" />;
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
      <p>Temperature: {temperature_2m}°C</p>
      <p>Apparent Temperature: {apparenttemperature}°C</p>
      <p>{isRaining ? "Rain" : "No rain"}</p>
      <div className="icons">
        {getWeatherIcon()} {getTimeOfDayIcon()}
      </div>
    </div>
  );
};

const WeatherIcon = ({ isRaining }) => {
  if (isRaining) return <WiRain />;
  return <WiDaySunny />;
};

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("Belgrade");
  const [inputValue, setInputValue] = useState("Belgrade");

  const fetchCoordinates = async (cityName) => {
    const apiKey = "7f83ca25f80f40b6b8aacd66203fb05b";
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      cityName
    )}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Unable to fetch city coordinates");
      }
      const data = await response.json();
      if (data.results.length === 0) {
        throw new Error("City not found");
      }
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

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature,precipitation,rain,wind_speed_10m&current=temperature_2m,apparent_temperature,precipitation,rain,wind_speed_10m&timezone=auto&forecast_days=1`;

      const response = await fetch(weatherUrl);
      if (!response.ok) {
        throw new Error("Unable to fetch weather data");
      }
      const data = await response.json();
      setWeatherData(data);
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

  const getHourlyData = (index, type) => {
    if (hourlyData && hourlyData[type]) {
      return hourlyData[type][index] ?? "N/A";
    }
    return "N/A";
  };

  const isRaining = weatherData?.current?.precipitation > 0;

  const currentHour = new Date().getHours();

  const filteredHourlyData = hourlyData?.time?.filter((time) => {
    const hour = new Date(time).getHours();
    return hour >= currentHour;
  });

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
      {weatherData && weatherData.current && (
        <div className="weather-details">
          <h3>
            Weather in {city} on{" "}
            {new Date(weatherData.current.time).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date(weatherData.current.time).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
            })}
          </h3>
          <p>Current Temperature: {weatherData.current.temperature_2m}°C</p>
          <p>Apparent Temperature: {weatherData.current.apparent_temperature}°C</p>
          <p>Current Wind: {weatherData.current.wind_speed_10m} m/s</p>
          <p>{isRaining ? "It is raining" : "No rain at the moment"}</p>
        </div>
      )}

      {filteredHourlyData && (
        <div className="hourly-forecast-container">
          <h3>
            Hourly Forecast for {city} on{" "}
            {new Date(hourlyData.time[0]).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <div className="hourly-forecast-cards">
            {filteredHourlyData.map((time) => {
              const hour = new Date(time).getHours();
              const index = hourlyData.time.findIndex((t) => t === time);
              const temperature = getHourlyData(index, "temperature_2m");
              const apparentTemperature = getHourlyData(
                index,
                "apparent_temperature"
              );
              const precipitation = getHourlyData(index, "precipitation");
              const windSpeed = getHourlyData(index, "wind_speed_10m");
              return (
                <HourlyForecastCard
                  key={index}
                  hour={hour}
                  temperature_2m={temperature}
                  apparenttemperature={apparentTemperature}
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
