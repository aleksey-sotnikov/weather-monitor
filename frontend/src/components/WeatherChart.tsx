import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import Loader from "./Loader";
import { WeatherData, Metrics } from "../types";
import { fetchWeatherData } from "../services/weatherService";
import "../styles/WeatherChart.css";
import { usePageVisibility } from "../hooks/usePageVisibility";
import WeatherForecastChart from "./WeatherForecastChart";

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

const WeatherChart: React.FC = () => {
    const [data, setData] = useState<WeatherData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [minTemp, setMinTemp] = useState<WeatherData | null>();
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

    const [selectedMetrics, setSelectedMetrics] = useState<(keyof Omit<WeatherData, 'source' | 'timestamp'>)[]>(["temperature", "pressure"]);
    const [selectedSources, setSelectedSources] = useState<string[]>(["pro_main"]);

    const [startDate, setStartDate] = useState<string>(getLocalDateTime(new Date(Date.now() - (isMobile ? 12:24) * 60 * 60 * 1000)));
    const [endDate, setEndDate] = useState<string>("");
    const [activeFilter, setActiveFilter] = useState<number | null>(isMobile ? 12 : 24);

    const loadData = async () => {
        setLoading(true);
        const result = await fetchWeatherData(selectedSources, startDate, endDate);
        setData(smoothData(result, 4));

        if (selectedMetrics.includes("temperature") && result.length) {
            const minEntry = result.reduce((min, entry) => 
                entry.temperature !== undefined && (min === null || min.temperature === undefined || entry.temperature < min.temperature) 
                    ? entry 
                    : min, 
                null as WeatherData | null
            );

            setMinTemp(minEntry)
        } else {
            setMinTemp(null)
        }
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
                data={data} 
                parameters={selectedMetrics} 
                title=" "
                height={isMobile ? 260 : 400}
                />
                
                {/* <ResponsiveContainer width="100%" height={isMobile ? 260 : 400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
                        <XAxis
                            dataKey="timestamp"
                            padding={{ right: 10 }} 
                            tickFormatter={tickFormatter}
                        />

                        <Tooltip
                            contentStyle={{ backgroundColor: "var(--chart-bg)", color: "var(--chart-text)" }} 
                            labelFormatter={tickFormatter}
                        />

                        <Legend />

                        {/* Графики * /}
                        
                        {selectedMetrics.includes("humidity") && (
                            <Line type="monotone" yAxisId="humidity" dataKey="humidity" stroke="#52be80" name="Влажность" dot={false} />
                        )}
                        {selectedMetrics.includes("wind_speed") && (
                            <Line type="monotone" yAxisId="wind_speed" dataKey="wind_speed" stroke="#52be80" name="Ветер" dot={false} />
                        )}
                        {selectedMetrics.includes("illuminance") && (
                            <Line type="monotone" yAxisId="illuminance" dataKey="illuminance" stroke="#f3b700" name="Освещенность" dot={false} />
                        )}
                        {selectedMetrics.includes("uv_index") && (
                            <Line type="monotone" yAxisId="uv_index" dataKey="uv_index" stroke="#876FD4" name="УФ индекс" dot={false} />
                        )}
                        {selectedMetrics.includes("ir_value") && (
                            <Line type="monotone" yAxisId="ir_value" dataKey="ir_value" stroke="#F5921B" name="ИК индекс" dot={false} />
                        )}
                        {selectedMetrics.includes("pressure") && (
                            <Line type="monotone" yAxisId="pressure" dataKey="pressure" stroke="#2471a3" name="Давление" dot={false} strokeWidth={3}/>
                        )}
                        {selectedMetrics.includes("temperature") && (
                            <Line type="monotone" yAxisId="temperature" dataKey="temperature" stroke="#e74c3c" name="Температура" dot={false} strokeWidth={4} />
                        )}

                        {/* Определение осей * /}
                        {selectedMetrics.includes("humidity") && (<YAxis yAxisId="humidity" stroke="#52be80" orientation="right" domain={["auto", "auto"]} />)}
                        {selectedMetrics.includes("wind_speed") && (<YAxis yAxisId="wind_speed" stroke="#52be80" orientation="right" domain={["auto", "auto"]} />)}
                        {selectedMetrics.includes("illuminance") && (<YAxis yAxisId="illuminance" stroke="#f3b700" domain={["auto", "auto"]} />)}
                        {selectedMetrics.includes("uv_index") && (<YAxis yAxisId="uv_index" stroke="#876FD4" orientation="right" domain={["auto", "auto"]} />)}
                        {selectedMetrics.includes("ir_value") && (<YAxis yAxisId="ir_value" stroke="#F5921B" orientation="right" domain={["auto", "auto"]} />)}
                        <YAxis yAxisId="pressure" stroke="#2471a3"  domain={["auto", "auto"]} interval={'preserveStart'} strokeWidth={2} />
                        <YAxis yAxisId="temperature" stroke="#e74c3c" orientation="right" domain={["auto", "auto"]} interval={'preserveStartEnd'} strokeWidth={3}/>
                        
                        {selectedMetrics.includes('temperature') && minTemp && (
                            <ReferenceLine yAxisId="temperature" y={minTemp.temperature} stroke="#e74c3c" 
                            label={minTemp.temperature + "°С"} strokeWidth={0.4} strokeDasharray="6 3"/>)}
                        
                    </LineChart>
                </ResponsiveContainer> */}
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
