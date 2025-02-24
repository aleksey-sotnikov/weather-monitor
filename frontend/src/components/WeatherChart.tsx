import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { WeatherData } from "../types";
import { fetchWeatherData } from "../services/weatherService";

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

const WeatherChart: React.FC = () => {
    const [data, setData] = useState<WeatherData[]>([]);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["temperature", "pressure"]);
    const [selectedSorces, setSelectedSources] = useState<string[]>(["pro_main"]);

    const [startDate, setStartDate] = useState<string>(getLocalDateTime(new Date(Date.now() - (isMobile ? 12:24) * 60 * 60 * 1000)));
    const [endDate, setEndDate] = useState<string>(getLocalDateTime(new Date()));

    useEffect(() => {
        const loadData = async () => {
            const result = await fetchWeatherData(selectedSorces, startDate, endDate);
            setData(result);
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
        <div className="flex-container" style={{ padding: "10px" }}>
            {/* Блок с графиком */}
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={(tick) => {
                            const date = new Date(tick * 1000);
                            return date.toLocaleString("ru-RU", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                            });
                        }}
                    />

                    {/* Определение осей */}
                    <YAxis yAxisId="temperature" stroke="#00FF00" domain={["auto", "auto"]} />
                    <YAxis yAxisId="pressure" stroke="#FF0000" orientation="right" domain={["auto", "auto"]} />
                    {selectedMetrics.includes("humidity") && (<YAxis yAxisId="humidity" stroke="#0000FF" orientation="right" domain={["auto", "auto"]} />)}
                    {selectedMetrics.includes("illuminance") && (<YAxis yAxisId="illuminance" stroke="#f3b700" domain={["auto", "auto"]} />)}
                    {selectedMetrics.includes("uv_index") && (<YAxis yAxisId="uv_index" stroke="#FFA500" orientation="right" domain={["auto", "auto"]} />)}
                    {selectedMetrics.includes("ir_value") && (<YAxis yAxisId="ir_value" stroke="#32cd32" orientation="right" domain={["auto", "auto"]} />)}

                    <Tooltip
                        wrapperStyle={{ backgroundColor: "#333", color: "#333", border: "1px solid #666", borderRadius: "5px", padding: "5px" }}

                        labelFormatter={(label) => {
                            const date = new Date(label * 1000); // Преобразуем timestamp в миллисекунды
                            return date.toLocaleString("ru-RU", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                            });
                        }}
                    />

                    <Legend />

                    {/* Графики */}
                    {selectedMetrics.includes("temperature") && (
                        <Line type="monotone" yAxisId="temperature" dataKey="temperature" stroke="#00FF00" name="Температура" dot={false} />
                    )}
                    {selectedMetrics.includes("pressure") && (
                        <Line type="monotone" yAxisId="pressure" dataKey="pressure" stroke="#FF0000" name="Давление" dot={false} />
                    )}
                    {selectedMetrics.includes("humidity") && (
                        <Line type="monotone" yAxisId="humidity" dataKey="humidity" stroke="#0000FF" name="Влажность" dot={false} />
                    )}
                    {selectedMetrics.includes("illuminance") && (
                        <Line type="monotone" yAxisId="illuminance" dataKey="illuminance" stroke="#f3b700" name="Освещенность" dot={false} />
                    )}
                    {selectedMetrics.includes("uv_index") && (
                        <Line type="monotone" yAxisId="uv_index" dataKey="uv_index" stroke="#FFA500" name="УФ индекс" dot={false} />
                    )}
                    {selectedMetrics.includes("ir_value") && (
                        <Line type="monotone" yAxisId="ir_value" dataKey="ir_value" stroke="#32cd32" name="ИК индекс" dot={false} />
                    )}
                </LineChart>
            </ResponsiveContainer>

            {/* Блок с фильтрами */}
            <div style={{ marginRight: "20px", display: "flex", flexDirection: "column" }}>
                <h3>Выберите показатели:</h3>
                {Object.keys(metrics).map((metric) => (
                    <label key={metric} style={{ marginBottom: "5px" }}>
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
                    <label key={source} style={{ marginBottom: "5px" }}>
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
                    <label>Начало периода:</label>
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <label>Конец периода:</label>
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default WeatherChart;
