import ApexCharts from 'react-apexcharts';
import { WeatherData, Metrics } from '../types';
import { ApexOptions } from 'apexcharts';
import { useDarkMode } from "../context/DarkModeContext";
import { useEffect, useMemo, useState } from 'react';

interface TimeSeriesChartProps {
    data: WeatherData[];
    parameters: (keyof Omit<WeatherData, 'source' | 'timestamp'>)[];
    title?: string;
    height?: number;
    brash?: boolean;
  }
  
 
const WeatherForecastChart: React.FC<TimeSeriesChartProps> = ({ data, parameters, height, brash }) => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const { darkMode } = useDarkMode();

  const yAxis = (() => parameters.map((parameter, index) => ({
    title: {
      text: isMobile ? undefined :  Metrics[parameter], // Название оси Y
    },
    axisBorder: {
      show: true,
    },
    opposite: index % 2 === 0,
    labels: {
      formatter: function (val: number) {
        return (parameter === 'temperature' && val > 0 ? '+' : '') + val.toFixed(0);
      },
    },
  })));

  // Подготовка данных для графика
  const series = parameters.map(parameter => ({
    name: Metrics[parameter],
    data: data.map(item => ({
      x: item.timestamp * 1000, // Временная метка
      y: item[parameter], // Значение параметра
    })),
  }));
  const r = useMemo(() => ((Math.random()* 10).toFixed(0)), []);
  // Настройки графика с явным указанием типа ApexOptions
  const [options, setOptions] = useState<ApexOptions>( {
    chart: {
      id: 'chart1' + r,
      type: 'line',
      background: "var(--chart-color)",
      foreColor: "var(--text-color)",
      parentHeightOffset: 10,
      zoom: {
        enabled: false, // Включить зум
      },
      toolbar: {
        show: false
      }
    },
    theme: {
        mode: darkMode ? 'dark' : 'light'
    },
    xaxis: {
      type: 'datetime', // Ось X — время
      labels: {
        datetimeUTC: false,
        format: 'dd.MM HH:mm', // Формат даты и времени
      },
    },
    yaxis: yAxis(),
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

  const opts : ApexOptions = { 
    chart: {
      id: 'chart2' + r,
      height: 130,
      type: 'area',
      brush:{
        target: 'chart1' + r,
        enabled: brash
      },
      selection: {
        enabled: true,
        fill: {
          color: 'var(--text-color)'
        },
        stroke: {
          color: 'var(--text-color)'
        },
        xaxis: {
          min: new Date().getTime(),
          max: new Date().getTime() + 3600 * 24 * 1000
        }
      },
    },
  legend: {
    show: false
  },
  stroke: {
    width: [1, 3],
    curve: ['straight', 'monotoneCubic']
  },
  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.31,
      opacityTo: 0.1,
    }
  },
  xaxis: {
    type: 'datetime',
    tooltip: {
      enabled: false
    }
  },
  yaxis: yAxis()
};

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

useEffect(() => {
  setOptions({
    ...options,
    yaxis: yAxis(),
  })
}, [parameters]);

  return (
    <>
    <ApexCharts 
      options={options} 
      series={series} 
      height={height ?? 400} 
    />
    {brash && (<ApexCharts options={opts} series={series} type="area" height={130} />)}
    </>
  );
};

export default WeatherForecastChart;