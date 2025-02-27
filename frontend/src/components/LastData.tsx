import React, { useEffect, useState } from "react";
import { WeatherData } from "../types";
import { fetchWeatherData } from "../services/weatherService";
import "../styles/LastData.css"

const metricLabels: Record<string, any> = {
    temperature: {l:"t",m:"°С"},
    pressure: {l:"ps", m:"мм"},
//    illuminance: "Освещенность",
//    humidity: "Влажность",
//    uv_index: "УФ индекс",
//    ir_index: "ИК индекс",
};

const tickFormatter = (tick: number) => {
    const date = new Date(tick * 1000);
    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        year: "2-digit",
    }).replace(",", "");
}


const LatestWeatherData: React.FC = () => {
    const [latestData, setLatestData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await fetchWeatherData(['pro_main'], null, null, 1, 'DESC');
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
        <>
                {latestData ? (
                    <>
                    <p className="last-time">{tickFormatter(latestData.timestamp)}</p>
                    <div className="latest-data">
                        <div className="widget">
                            <h3>Температура</h3>
                            <p>{latestData.temperature}°C</p>
                        </div>
                        {latestData.pressure && (<div className="widget">
                            <h3>Давление</h3>
                            <p>{Math.round(latestData.pressure)}</p>
                            <h3>мм рт. ст.</h3>
                        </div>)}
                    </div>
                    </>
                ) : (
                    <p>Данные загружаются...</p>
                )}
         </>   
    );
};

export default LatestWeatherData;
