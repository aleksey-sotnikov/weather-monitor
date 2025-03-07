import ApexCharts from 'react-apexcharts';
import { WeatherData, Metrics } from '../types';
import { ApexOptions } from 'apexcharts';
import { useDarkMode } from "../context/DarkModeContext";
import { useEffect, useRef, useState } from 'react';

interface TimeSeriesChartProps {
    data: WeatherData[];
    parameters: (keyof Omit<WeatherData, 'source' | 'timestamp'>)[];
    title?: string;
    height?: number;
  }
  
 
const WeatherForecastChart: React.FC<TimeSeriesChartProps> = ({ data, parameters, height }) => {

  const { darkMode } = useDarkMode();

  // Подготовка данных для графика
  const series = parameters.map(parameter => ({
    name: Metrics[parameter],
    data: data.map(item => ({
      x: item.timestamp * 1000, // Временная метка
      y: item[parameter], // Значение параметра
    })),
  }));

  // Настройки графика с явным указанием типа ApexOptions
  const [options, setOptions] = useState<ApexOptions>( {
    chart: {
      type: 'line',
      background: "var(--chart-color)",
      foreColor: "var(--text-color)",
      zoom: {
        enabled: false, // Включить зум
      },
    },
    theme: {
        mode: darkMode ? 'dark' : 'light'
    },
    xaxis: {
      type: 'datetime', // Ось X — время
      labels: {
        format: 'dd.MM HH:mm', // Формат даты и времени
      },
    },
    yaxis: parameters.map((parameter, index) => ({
      title: {
        text: Metrics[parameter], // Название оси Y
      },
      axisBorder: {
        show: true,
        color: "#247BA0"
      },
      opposite: index % 2 === 0,
    })),
    tooltip: {
      x: {
        format: 'dd MMM yy HH:mm', // Формат даты в тултипе
      },
    },
    stroke: {
      curve: 'smooth', // Сглаживание линии
    },
    grid: {
        borderColor: '#555555',
        strokeDashArray: 3,
        xaxis: {
            lines: {
              show: true, // Включаем вертикальные линии
            },
          },
      },
  });

  // Обновляем конфигурацию графика при изменении темы
  useEffect(() => {
    setOptions({
        ...options,
        chart: {
            ...options.chart,
            
        },
        theme: {
            mode: darkMode ? "dark" : "light",
        },
    });
}, [darkMode]);

  return (
    <ApexCharts 
      options={options} 
      series={series} 
      height={height ?? 400} 
    />
  );
};

export default WeatherForecastChart;