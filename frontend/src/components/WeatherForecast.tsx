import { useState, useEffect } from "react";
import { fetchWeatherForecast } from '../services/weatherService';
import { usePageVisibility } from "../hooks/usePageVisibility";
import { WeatherData } from "../types";
import "../styles/WeatherForecast.css";
import WeatherForecastChart from "./ApexChart";
import { ForecastWidget } from "./ForecastWidget";

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
          <ForecastWidget key={index} data = {entry} />
        ))
      )}
    </div>
    <WeatherForecastChart
           data={forecast} 
           parameters={["temperature", "pressure"]} 
           brash={true}
        />
    </>
  );
};

export default WeatherForecast;
