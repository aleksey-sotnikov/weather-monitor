import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { WeatherData, Metrics } from "../types";
import { fetchWeatherData } from "../services/weatherService";
import "../styles/WeatherChart.css";
import { usePageVisibility } from "../hooks/usePageVisibility";
import WeatherForecastChart from "./ApexChart";

const sources: Record<string, string> = {
    pro_main: "Основная станция",
    pro_second: "Вторая погодная станция",
    pro_old: "Старая погодная станция",
    owm_real: "Open weather map"
};

const timeRanges = [
    { label: "3 ч", value: 3 },
    { label: "6 ч", value: 6 },
    { label: "12 ч", value: 12 },
    { label: "1 д", value: 24 },
    { label: "2 д", value: 48 },
    { label: "3 д", value: 72 },
    { label: "4 д", value: 96 },
    { label: "Неделя", value: 168 },
    { label: "2 недели", value: 336 },
];

const getLocalDateTime = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000; // Смещение в миллисекундах
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
};

const tickFormatter = (tick: number) => {
    const date = new Date(tick * 1000);
    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).replace(",", "");
}

const smoothData = (data: WeatherData[], level: number): WeatherData[] => {
    if (data.length < level * 2 + 1) return data; // Если данных меньше окна сглаживания, возвращаем как есть

    const round = (value: number | undefined) => 
        value !== undefined && !isNaN(value) ? Math.round(value * 100) / 100 : undefined;

    return data.map((entry, index) => {
        if (index < level || index > data.length - level - 1) {
            return entry; // Первые и последние level точек оставляем без изменений
        }

        const neighbors = data.slice(index - level, index + level + 1);

        const avg = (key: keyof WeatherData) => {
            const values = neighbors
                .map((item) => item[key])
                .filter((val): val is number => typeof val === "number" && !isNaN(val)); // Оставляем только числа

            if (values.length === 0) return undefined;

            return round(values.reduce((sum, v) => sum + v, 0) / values.length);
        };

        return {
            ...entry,
            temperature: avg("temperature"),
            humidity: avg("humidity"),
            pressure: avg("pressure"),
            illuminance: avg("illuminance"),
            uv_index: avg("uv_index"),
            ir_value: avg("ir_value"),
            wind_speed: avg("wind_speed"),
        };
    });
};

export function smoothDataPreservingExtremes(data: WeatherData[], alpha: number, threshold: number): WeatherData[] {
    if (data.length === 0) return [];

    let smoothedData: WeatherData[] = [];
    let prevSmoothed: WeatherData | null = null;

    for (const entry of data) {
        let smoothedEntry: WeatherData = { ...entry };

        if (prevSmoothed) {
            for (const key of Object.keys(entry) as (keyof WeatherData)[]) {
                if (typeof entry[key] === "number" && typeof prevSmoothed[key] === "number") {
                    let diff = Math.abs((entry[key] as number) - (prevSmoothed[key] as number));
                    
                    // Если изменение слишком резкое, ослабляем сглаживание
                    let adjustedAlpha = diff > threshold ? alpha * 0.5 : alpha;

                    (smoothedEntry[key] as number) = 
                        adjustedAlpha * (entry[key] as number) + (1 - adjustedAlpha) * (prevSmoothed[key] as number);
                }
            }
        }

        smoothedData.push(smoothedEntry);
        prevSmoothed = smoothedEntry;
    }

    return smoothedData;
}

// extrema
function findExtrema(data : WeatherData[], key: keyof Omit<WeatherData, 'source' | 'timestamp'>) {
    // Извлекаем значения и временные метки для указанного ключа
    const values = data
      //.filter(entry => entry[key] !== null && entry[key] !== undefined)
      .map(entry => entry[key]);

    // Вычисляем первую производную (разности между соседними значениями)
    const derivative = [];
    for (let i = 0; i < values.length - 1; i++) {
        values[i + 1] !== undefined && values[i] !== undefined && derivative.push(Math.round((values[i + 1]! - values[i]!) * 1000) / 1000);
    }
  
    //console.log('d', derivative)
    
    // Ищем экстремумы: максимум или минимум
    let extremaMaxIndices: number[] = [];
    let extremaMinIndices: number[] = [];
    for (let i = 1; i < derivative.length - 1; i++) {
      // if (Math.abs(derivative[i - 1]) < threshold ) continue;
      const lastMaxExtIndex = extremaMaxIndices.length ? extremaMaxIndices[extremaMaxIndices.length-1] : -1;  
      const lastMinExtIndex = extremaMinIndices.length ? extremaMinIndices[extremaMinIndices.length-1] : -1;  

      if ((lastMaxExtIndex >= 0 && i - lastMaxExtIndex < 20 && Math.abs(data[i].temperature!-data[lastMaxExtIndex].temperature!) < 3)
        || (lastMinExtIndex >= 0 && i - lastMinExtIndex < 20 && Math.abs(data[i].temperature!-data[lastMinExtIndex].temperature!) < 3))
            continue;

      if (derivative[i - 1] > 0 && derivative[i] <= 0) {
        //extremaIndices.push(i);
        // Максимум: производная меняет знак с положительного на отрицательное
        if (!extremaMaxIndices.length){
            //console.log("push first up", i, data[i])
            extremaMaxIndices.push(i);
        }
        else if ((lastMaxExtIndex < lastMinExtIndex || lastMinExtIndex === -1) && Math.abs(Math.abs(data[i].temperature ?? 0) - Math.abs(data[lastMaxExtIndex > lastMinExtIndex? lastMaxExtIndex : lastMinExtIndex].temperature ?? 0)) > 3 ){
            //console.log("push up", i, data[i])
            extremaMaxIndices.push(i);
        } 
        else if (lastMaxExtIndex > lastMinExtIndex && (data[i].temperature ?? 0) > (data[lastMaxExtIndex].temperature ?? 0)) {
            //console.log("move up" , i, lastMaxExtIndex, ': ' , derivative[i - 1], derivative[i], ' : ' ,  data[i].temperature, data[lastMaxExtIndex].temperature)
            extremaMaxIndices[extremaMaxIndices.length - 1] = i;
         }
         
            
      } else if (derivative[i - 1] < 0 && derivative[i] >= 0) {
        //extremaIndices.push(i);
        // Минимум: производная меняет знак с отрицательного на положительное
        if (!extremaMinIndices.length){
            //console.log("push first down", i, data[i])
            extremaMinIndices.push(i);
        }
        else if ((lastMaxExtIndex > lastMinExtIndex  || lastMaxExtIndex === -1) && Math.abs(Math.abs(data[i].temperature ?? 0) - Math.abs(data[lastMaxExtIndex > lastMinExtIndex ? lastMaxExtIndex : lastMinExtIndex].temperature ?? 0)) > 3){
            //console.log("push down", i, data[i].temperature)
            extremaMinIndices.push(i);
        } 
        else if (lastMaxExtIndex < lastMinExtIndex && (data[i].temperature ?? 0) < (data[lastMinExtIndex].temperature ?? 0)) {
            //console.log("move down", i, data[i])
            extremaMinIndices[extremaMinIndices.length - 1] = i;
         }
         
      }
    }
    
    const corrWindow = 100
    // локальная корректировка
    extremaMaxIndices = extremaMaxIndices.map((exIdx) => {
        let min = exIdx - corrWindow / 2
        if (min < 0) min = 0
        let max = exIdx + corrWindow / 2
        if (max > data.length) max = data.length
        const windowSet = data.slice(min, max)
        let maxVal = [exIdx, data[exIdx].temperature!]
        for (let i = 0; i < windowSet.length; i++) {
            if (windowSet[i].temperature! > maxVal[1])
                maxVal = [min + i, windowSet[i].temperature!]
        }

        return maxVal[0]
    })

    extremaMinIndices = extremaMinIndices.map((exIdx) => {
        let min = exIdx - corrWindow / 2
        if (min < 0) min = 0
        let max = exIdx + corrWindow / 2
        if (max > data.length) max = data.length
        const windowSet = data.slice(min, max)
        let minVal = [exIdx, data[exIdx].temperature!]
        for (let i = 0; i < windowSet.length; i++) {
            if (windowSet[i].temperature! < minVal[1])
                minVal = [min + i, windowSet[i].temperature!]
        }

        return minVal[0]
    })

    extremaMaxIndices = extremaMaxIndices.filter((exIdx, index) => index == 0 || exIdx - extremaMaxIndices[index - 1] > 60)
    extremaMinIndices = extremaMinIndices.filter((exIdx, index) => index == 0 || exIdx - extremaMinIndices[index - 1] > 60)

    // Возвращаем данные экстремумов
    return data.filter((data, index) => extremaMaxIndices.includes(index) || extremaMinIndices.includes(index));
  }

const WeatherChart: React.FC = () => {
    const [data, setData] = useState<WeatherData[]>([]);
    const [points, setPoints] = useState<WeatherData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

    const [selectedMetrics, setSelectedMetrics] = useState<(keyof Omit<WeatherData, 'source' | 'timestamp'>)[]>(["temperature", "pressure"]);
    const [selectedSources, setSelectedSources] = useState<string[]>(["pro_main"]);

    const [startDate, setStartDate] = useState<string>(getLocalDateTime(new Date(Date.now() - (isMobile ? 12:24) * 60 * 60 * 1000)));
    const [endDate, setEndDate] = useState<string>("");
    const [activeFilter, setActiveFilter] = useState<number | null>(isMobile ? 12 : 24);

    const loadData = async () => {
        setLoading(true);
        const result = await fetchWeatherData(selectedSources, startDate, endDate);
        const smoothResult = smoothDataPreservingExtremes(result, 0.25, 8);
        setData(smoothResult);

        setPoints(findExtrema(smoothResult, 'temperature'))

        setLoading(false);
      };

    useEffect(() => {
        loadData();
    }, [startDate, endDate, selectedSources]);

    usePageVisibility(loadData);

    const toggleMetric = (metric: keyof Omit<WeatherData, 'source' | 'timestamp'>) => {
        setSelectedMetrics((prev) =>
            prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
        );
    };

    const toggleSource = (source: string) => {
        setSelectedSources((prev) =>
            [source] //prev.includes(source) ? prev.filter((m) => m !== source) : [source] //TMP single src supported [...prev, source]
        );
    };

    const setQuickFilter = (hours: number) => {
        const end = new Date();
        const start = new Date();
        start.setHours(end.getHours() - hours);
        setStartDate(start.toISOString().slice(0, 16));
        setActiveFilter(hours);
    };

    return (
        <div className="dashboard-content">
            {/* Блок с графиком */}
            <div className="chart-container">
                { loading && (<Loader />) }
                <WeatherForecastChart
                data={data} points={points}
                parameters={selectedMetrics} 
                height={isMobile ? 260 : 400}
                />
                <div className="filter-buttons">
                    {timeRanges.map(({ label, value }) => (
                        <button 
                            key={value} 
                            className={`filter-button ${activeFilter === value ? "active" : ""}`} 
                            onClick={() => setQuickFilter(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            {/* Блок с фильтрами */}
            <div className="filters-container">
                <h3>Выберите показатели:</h3>
                {Object.keys(Metrics).map((metric: string) => (
                    <label key={metric} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={selectedMetrics.includes(metric as keyof Omit<WeatherData, 'source' | 'timestamp'>)}
                            onChange={() => toggleMetric(metric as keyof Omit<WeatherData, 'source' | 'timestamp'>)}
                        />
                        {Metrics[metric as keyof Omit<WeatherData, 'source' | 'timestamp'>]}
                    </label>
                ))}

                <h3>Выберите источник:</h3>
                {Object.keys(sources).map((source) => (
                    <label key={source} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={selectedSources.includes(source)}
                            onChange={() => toggleSource(source)}
                        />
                        {sources[source]}
                    </label>
                ))}
                {/* Блок фильтров периода */}
                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column" }}>
                    <h3>Начало периода:</h3>
                    <input
                        type="datetime-local"
                        value={startDate ?? ""}
                        className="date-input"
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <h3>Конец периода:</h3>
                    <input
                        type="datetime-local"
                        value={endDate ?? ""}
                        className="date-input"
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default WeatherChart;
