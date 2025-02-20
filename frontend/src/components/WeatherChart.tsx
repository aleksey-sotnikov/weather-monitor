import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { WeatherData } from "../types";
import { fetchWeatherData } from "../services/weatherService";

const WeatherChart: React.FC = () => {
    const [data, setData] = useState<WeatherData[]>([]);
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["temperature", "pressure"]);
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();

    useEffect(() => {
        const loadData = async () => {
            const result = await fetchWeatherData('pro_main', startDate, endDate);
            setData(result);
        };
        loadData();
    }, [startDate, endDate]);


    const toggleMetric = (metric: string) => {
        setSelectedMetrics((prev) =>
            prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
        );
    };

    return (
        <div style={{ padding: "10px" }}>
            <h2>График погоды</h2>
            <div>
                {["temperature",  "pressure", "humidity", "illuminance", "uv_index", "ir_index"].map((metric) => (
                    <label key={metric} style={{ marginRight: "10px" }}>
                        <input
                            type="checkbox"
                            checked={selectedMetrics.includes(metric)}
                            onChange={() => toggleMetric(metric)}
                        />
                        {metric}
                    </label>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(tick) => {
                        const date = new Date(tick * 1000); // Преобразуем timestamp в миллисекунды
                        return date.toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        });
                    }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedMetrics.includes("temperature") && (
                        <Line type="monotone" dataKey="temperature" stroke="#FF0000" name="Температура" dot={false}/>
                    )}
                    {selectedMetrics.includes("humidity") && (
                        <Line type="monotone" dataKey="humidity" stroke="#0000FF" name="Влажность" dot={false}/>
                    )}
                    {selectedMetrics.includes("pressure") && (
                        <Line type="monotone" dataKey="pressure" stroke="#00FF00" name="Давление" dot={false}/>
                    )}
                    {selectedMetrics.includes("illuminance") && (
                        <Line type="monotone" dataKey="illuminance" stroke="#f3b700" name="Освещенность" dot={false}/>
                    )}
                    {selectedMetrics.includes("uv_index") && (
                        <Line type="monotone" dataKey="uv_index" stroke="#FFA500" name="УФ индекс" dot={false}/>
                    )}
                    {selectedMetrics.includes("ir_value") && (
                        <Line type="monotone" dataKey="ir_value" stroke="#32cd32" name="ИК индекс" dot={false}/>
                    )}
                </LineChart>
            </ResponsiveContainer>

            <div>
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
    );
};

export default WeatherChart;
