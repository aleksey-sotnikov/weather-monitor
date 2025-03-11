import ApexCharts from 'react-apexcharts';
import { WeatherData, Metrics } from '../types';
import { ApexOptions } from 'apexcharts';
import { useDarkMode } from "../context/DarkModeContext";
import { useEffect, useMemo, useState } from 'react';

interface TimeSeriesChartProps {
    data: WeatherData[];
    points?: WeatherData[];
    parameters: (keyof Omit<WeatherData, 'source' | 'timestamp'>)[];
    title?: string;
    height?: number;
    brash?: boolean;
  }
  
 
const WeatherChart: React.FC<TimeSeriesChartProps> = ({ data, points, parameters, height, brash }) => {
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
        return (parameter === 'temperature' && val > 0 ? '+' : '') + (val !== undefined && val.toFixed(0));
      },
    },
  })));

  const getPoints = (() => (points ? points.map((point) => ({
    x: point.timestamp * 1000,
    y: point.temperature,
    marker: {
      size: 0,
      // fillColor: 'transparent',
      // strokeColor: 'var(--border-color)',
      // radius: 2,
      // cssClass: 'apexcharts-custom-class'
    },
    label: {
      borderColor: 'transparent',
      offsetY: -2,
      offsetX: data[data.length -1].timestamp - point.timestamp < 300 ? -13 : 0,
      style: {
        color: '#999999',
        fontSize: '12px',
        background: 'transparent',
      },

      text: (point.temperature && point.temperature > 0 ? "+":"")+(point.temperature && point.temperature.toFixed(0)),
    }
  } as PointAnnotations)) : []));

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
    colors: ['#66DA26', '#2E93fA', '#f2f754', "#828282", "#9a28e0", '#e91e4d','#FF9800', "#c3ff00"],
    xaxis: {
      type: 'datetime', // Ось X — время
      labels: {
        datetimeUTC: false,
        format: 'dd.MM HH:mm', // Формат даты и времени
      },
    },
    yaxis: yAxis(),
    annotations: {
      points: getPoints(),
    },
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
    yaxis: yAxis()
  })
}, [parameters]);

useEffect(() => {
  setOptions({
    ...options,
    annotations: {
      points: getPoints(),
    },
  })
}, [data, parameters]);

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

export default WeatherChart;