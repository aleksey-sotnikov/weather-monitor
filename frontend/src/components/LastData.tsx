import React, { useEffect, useState } from "react";
import { WeatherData } from "../types";
import { fetchWeatherData } from "../services/weatherService";

const metricLabels: Record<string, any> = {
    temperature: {l:"t",m:"°С"},
    pressure: {l:"ps", m:"мм"},
//    illuminance: "Освещенность",
//    humidity: "Влажность",
//    uv_index: "УФ индекс",
//    ir_index: "ИК индекс",
};

const LatestWeatherData: React.FC = () => {
    const [latestData, setLatestData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await fetchWeatherData(['pro_main'], null, null, 1);
                setLatestData(data[data.length - 1]);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            }
            setLoading(false);
        };

        loadData();
        const interval = setInterval(loadData, 30000); // Обновление каждые 30 секунд

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: "10px" }}>
            {loading && !latestData ? (
                <p>Загрузка...</p>
            ) : latestData ? (
                <div style={{ display: 'flex'}}>
                    {Object.keys(metricLabels).map((key) => (
                        latestData[key as keyof WeatherData] !== undefined && (
                            <span key={key} style={{paddingRight: "5px"}}>
                               {metricLabels[key].l}: <strong>{latestData[key as keyof WeatherData]}</strong>{metricLabels[key].m};
                            </span>
                        )
                    ))}
                </div>
            ) : (
                <p>Нет данных</p>
            )}
        </div>
    );
};

export default LatestWeatherData;
