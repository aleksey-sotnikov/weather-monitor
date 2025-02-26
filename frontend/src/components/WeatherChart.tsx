import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { WeatherData } from "../types";
import { fetchWeatherData } from "../services/weatherService";
import "../styles/WeatherChart.css";

const metrics: Record<string, string> = {
    temperature: "Температура",
    pressure: "Давление",
    illuminance: "Освещенность",
    humidity: "Влажность",
    uv_index: "УФ индекс",
    ir_value: "ИК индекс",
};

const sources: Record<string, string> = {
    pro_main: "Основная станция",
    pro_second: "Вторая погодная станция",
    pro_old: "Старая погодная станция"
};

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
        };
    });
};

const WeatherChart: React.FC = () => {
    const [data, setData] = useState<WeatherData[]>([]);
    const [minTemp, setMinTemp] = useState<WeatherData | null>();
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["temperature", "pressure"]);
    const [selectedSorces, setSelectedSources] = useState<string[]>(["pro_main"]);

    const [startDate, setStartDate] = useState<string>(getLocalDateTime(new Date(Date.now() - (isMobile ? 12:24) * 60 * 60 * 1000)));
    const [endDate, setEndDate] = useState<string>();

    useEffect(() => {
        const loadData = async () => {
            const result = await fetchWeatherData(selectedSorces, startDate, endDate);
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
        };
        
        loadData();
    }, [startDate, endDate, selectedSorces]);

    const toggleMetric = (metric: string) => {
        setSelectedMetrics((prev) =>
            prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
        );
    };

    const toggleSource = (source: string) => {
        setSelectedSources((prev) =>
            [source] //prev.includes(source) ? prev.filter((m) => m !== source) : [source] //TMP single src supported [...prev, source]
        );
    };

    return (
        <div className="dashboard-content">
            {/* Блок с графиком */}
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
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

                        {/* Графики */}
                        
                        {selectedMetrics.includes("humidity") && (
                            <Line type="monotone" yAxisId="humidity" dataKey="humidity" stroke="#52be80" name="Влажность" dot={false} />
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

                        {/* Определение осей */}
                        {selectedMetrics.includes("humidity") && (<YAxis yAxisId="humidity" stroke="#52be80" orientation="right" domain={["auto", "auto"]} />)}
                        {selectedMetrics.includes("illuminance") && (<YAxis yAxisId="illuminance" stroke="#f3b700" domain={["auto", "auto"]} />)}
                        {selectedMetrics.includes("uv_index") && (<YAxis yAxisId="uv_index" stroke="#876FD4" orientation="right" domain={["auto", "auto"]} />)}
                        {selectedMetrics.includes("ir_value") && (<YAxis yAxisId="ir_value" stroke="#F5921B" orientation="right" domain={["auto", "auto"]} />)}
                        <YAxis yAxisId="pressure" stroke="#2471a3" orientation="right" domain={["auto", "auto"]} interval={'preserveStart'} strokeWidth={2} />
                        <YAxis yAxisId="temperature" stroke="#e74c3c" domain={["auto", "auto"]} interval={'preserveStartEnd'} strokeWidth={3}/>
                        
                        {selectedMetrics.includes('temperature') && minTemp && (
                            <ReferenceLine yAxisId="temperature" y={minTemp.temperature} stroke="#e74c3c" 
                            label={minTemp.temperature + "°С"} strokeWidth={0.4} strokeDasharray="6 3"/>)}
                        
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {/* Блок с фильтрами */}
            <div className="filters-container">
                <h3>Выберите показатели:</h3>
                {Object.keys(metrics).map((metric) => (
                    <label key={metric} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={selectedMetrics.includes(metric)}
                            onChange={() => toggleMetric(metric)}
                        />
                        {metrics[metric]}
                    </label>
                ))}

                <h3>Выберите источник:</h3>
                {Object.keys(sources).map((source) => (
                    <label key={source} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={selectedSorces.includes(source)}
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
                        value={startDate}
                        className="date-input"
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <h3>Конец периода:</h3>
                    <input
                        type="datetime-local"
                        value={endDate}
                        className="date-input"
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default WeatherChart;
