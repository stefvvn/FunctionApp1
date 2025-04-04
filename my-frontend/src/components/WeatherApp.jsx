import React, { useState, useEffect, useRef } from "react";
import "./WeatherApp.css";
import { WiRain, WiDaySunny, WiCloudy } from "react-icons/wi";
import {
  OPEN_METEO_API_URL,
  OPEN_CAGE_API_URL,
  OPEN_CAGE_API_KEY,
} from "../service/apiUrl.js";

const HourlyForecastCard = React.forwardRef(
  (
    {
      hour,
      temperature,
      apparentTemperature,
      precipitation,
      precipitationProbability,
      highlight,
    },
    ref
  ) => {
    const getWeatherIcon = () => {
      if (precipitation > 0 || precipitationProbability > 0)
        return <WiRain size={32} />;
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
      <div
        ref={ref}
        className={`hourly-forecast-card ${getTimeOfDayClass()} ${highlight ? "highlighted" : ""}`}
      >
        <h4>{hour}:00</h4>
        <div className="weather-icon">
          {getWeatherIcon()}
          {precipitationProbability > 0 && (
            <span className="precipitation-probability">
              {precipitationProbability}%
            </span>
          )}
        </div>
        <p>Temp: {temperature}°C</p>
        <p>Feels Like: {apparentTemperature}°C</p>
      </div>
    );
  }
);

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("Belgrade");
  const [inputValue, setInputValue] = useState("Belgrade");
  const [currentHourIndex, setCurrentHourIndex] = useState(0);

  const scrollContainerRef = useRef(null);
  const highlightedCardRef = useRef(null);

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
      const weatherUrl = `${OPEN_METEO_API_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,apparent_temperature,precipitation&current=temperature_2m,apparent_temperature,precipitation&timezone=auto&forecast_days=1`;

      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error("Unable to fetch weather data");
      const data = await response.json();
      setWeatherData(data);

      const currentHour = new Date(data.current.time).getHours();

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
  }, [city]);

  useEffect(() => {
    if (highlightedCardRef.current) {
      highlightedCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
      });
    }
  }, [weatherData, currentHourIndex]);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSearch = () => {
    setCity(inputValue);
  };

  const hourlyData = weatherData?.hourly;

  const chunkedHourlyData = [];
  if (hourlyData) {
    for (let i = 0; i < hourlyData.time.length; i += 3) {
      chunkedHourlyData.push(hourlyData.time.slice(i, i + 3));
    }
  }

  const getCurrentTime = () => {
    const currentTime = weatherData?.current?.time;
    if (!currentTime) return "Loading time...";

    const weatherDate = new Date(currentTime);
    const localDate = new Date();

    const hour = weatherDate.getHours();
    const minute = localDate.getMinutes();

    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  };

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
          <h3>
            Current weather in {city}, {getCurrentTime()}
          </h3>

          <div
  className="scrollable-container"
  ref={scrollContainerRef}
  style={{
    overflowX: "auto",
    whiteSpace: "nowrap",
    cursor: "grab",
    userSelect: "none"
  }}
  onMouseDown={(e) => {
    const scrollContainer = scrollContainerRef.current;
    const startX = e.pageX - scrollContainer.offsetLeft;
    const scrollLeft = scrollContainer.scrollLeft;

    const handleMouseMove = (moveEvent) => {
      const x = moveEvent.pageX - scrollContainer.offsetLeft;
      const scroll = scrollLeft - (x - startX);
      scrollContainer.scrollLeft = scroll;
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }}
>
  {chunkedHourlyData.map((chunk, chunkIndex) => (
    <div
      key={chunkIndex}
      className="forecast-chunk"
      style={{
        display: "inline-block"
      }}
    >
      <div className="d-flex justify-content-center">
        {chunk.map((time, index) => {
          const hour = new Date(time).getHours();
          const dataIndex = chunkIndex * 3 + index;

          const highlight =
            hour === new Date(weatherData.current.time).getHours();

          return (
            <HourlyForecastCard
              key={dataIndex}
              hour={hour}
              temperature={hourlyData.temperature_2m[dataIndex]}
              apparentTemperature={hourlyData.apparent_temperature[dataIndex]}
              precipitation={hourlyData.precipitation[dataIndex]}
              precipitationProbability={hourlyData.precipitation_probability[dataIndex]}
              highlight={highlight}
              ref={highlight ? highlightedCardRef : null}
            />
          );
        })}
      </div>
    </div>
  ))}
</div>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
