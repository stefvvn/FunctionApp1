import React, { useState, useEffect } from "react";
import "./WeatherApp.css";

const HourlyForecastCard = ({
  hour,
  temperature_2m,
  apparenttemperature,
  precipitation,
  windSpeed,
}) => {
  const isRaining = precipitation > 0;
  return (
    <div className="hourly-forecast-card">
      <h4>{hour}:00</h4>
      <p>Temperature: {temperature_2m}°C</p>
      <p>Apparent Temperature: {apparenttemperature}°C</p>
      <p>Precipitation: {precipitation} mm</p>
      <p>Wind: {windSpeed} m/s</p>
      <p>{isRaining ? "Rain" : "No rain"}</p>
    </div>
  );
};

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const city = "Belgrade";

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=44.804&longitude=20.4651&hourly=temperature_2m,apparent_temperature,precipitation,rain,wind_speed_10m&current=temperature_2m,apparent_temperature,precipitation,rain,wind_speed_10m&timezone=auto&forecast_days=1`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch weather data");
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
  }, []);

  const hourlyData = weatherData?.hourly;

  const getHourlyData = (index, type) => {
    if (hourlyData && hourlyData[type]) {
      return hourlyData[type][index] ?? "N/A";
    }
    return "N/A";
  };

  const isRaining = weatherData?.current_weather?.precipitation > 0;

  return (
    <div className="weather-container">
      <h2>Weather App</h2>
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
          <p>Current Wind: {weatherData.current.wind_speed_10m} m/s</p>
          <p>{isRaining ? "It is raining" : "No rain at the moment"}</p>
        </div>
      )}

      {hourlyData && (
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
            {hourlyData.time?.map((time, index) => {
              const hour = new Date(time).getHours();
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
