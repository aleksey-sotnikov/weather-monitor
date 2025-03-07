import { useState, useEffect } from "react";
import { fetchWeatherForecast } from '../services/weatherService';
import { usePageVisibility } from "../hooks/usePageVisibility";
import { WeatherData } from "../types";
import "../styles/WeatherForecast.css";
import WeatherForecastChart from "./WeatherForecastChart";

const tickFormatter = (tick: number) => {
  const date = new Date(tick * 1000);
  return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
  }).replace(",", "");
}

function getWindDirection(degrees: number): string {
  const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ", "С"];
  const index = Math.round(degrees / 45);
  return directions[index];
}

const WeatherForecast = () => {
  const [forecast, setForecast] = useState<WeatherData[]>([]);

  // Функция загрузки данных
  const loadData = async () => {
    const data = await fetchWeatherForecast(['owm_fc'], new Date().toDateString());
    setForecast(data);
  };

  useEffect(() => {
     // Загружаем данные при изменении зависимостей
     loadData();
  }, []);

  usePageVisibility(loadData);

  return (
    <>
    <h2 style={{margin:"10px 0"}}>Прогноз</h2>
    <div className="forecast-container">
      {forecast.length > 0 && (
        forecast.map((entry, index) => (
          <div key={index} className="forecast-card">
            <div className="forecast-date">
              {tickFormatter(entry.timestamp)}
            </div>
            <div className="forecast-temp">{entry.temperature && Math.round(entry.temperature)}°C</div>
            <div className="forecast-pressure">{entry.pressure} mm</div>
            <div className="forecast-humidity">{entry.humidity} %</div>
            <div className="forecast-wind">
              {entry.wind_speed && Math.round(entry.wind_speed)} м/с {entry.wind_dir && getWindDirection(entry.wind_dir)} {entry.wind_gust && (<span>до {Math.round(entry.wind_gust!)} м/с</span>)}
            </div>
          </div>
        ))
      )}
    </div>
    <WeatherForecastChart
           data={forecast} 
           parameters={["temperature", "pressure"]} 
           title="Температура (°C)" 
        />
    </>
  );
};

export default WeatherForecast;
