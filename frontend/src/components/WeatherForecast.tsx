import { useState, useEffect, useRef } from "react";
import { fetchWeatherForecast } from '../services/weatherService';
import { usePageVisibility } from "../hooks/usePageVisibility";
import { WeatherData } from "../types";
import "../styles/WeatherForecast.css";
import WeatherForecastChart from "./WeatherChart";
import { ForecastWidget } from "./ForecastWidget";

const WeatherForecast = () => {
  const [forecast, setForecast] = useState<WeatherData[]>([]);


  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Начало перетаскивания
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    containerRef.current.style.cursor = "grabbing";
  };

  // Перетаскивание
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Скорость прокрутки
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Конец перетаскивания
  const handleMouseUp = () => {
    if (!containerRef.current) return;
    setIsDragging(false);
    containerRef.current.style.cursor = "grab";
  };

  // Выход за пределы контейнера
  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    setIsDragging(false);
    containerRef.current.style.cursor = "grab";
  };

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
    <div className="forecast-container"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
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
