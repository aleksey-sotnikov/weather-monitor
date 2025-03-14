import React, { useCallback, useEffect, useMemo, useState } from "react";
import Loader from './Loader';
import { WeatherData } from "../types";
import { fetchWeatherData } from "../services/weatherService";
import "../styles/LastData.css"
import { usePageVisibility } from "../hooks/usePageVisibility";

const dateFormatter = (tick: number) => {
    const date = new Date(tick * 1000);
    const dt = date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
       // year: "2-digit",
    }).replace(",", "");
    return dt;
}

function getWindDirection(degrees: number): string {
    const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ", "С"];
    const index = Math.round(degrees / 45);
    return directions[index];
}

function startTask(task: Function) {
    const now = new Date();
    const seconds = now.getSeconds();

    // Вычисляем, сколько миллисекунд осталось до следующей 30-й секунды
    let delay = (30 - (seconds % 30)) * 1000;
    if (delay < 0) delay += 30000; // Если уже прошло больше 30 секунд

    const randomOffset = (Math.random() * 10000) - 5000; // Разброс -5 до +5 секунд

    // Запускаем задачу через delay миллисекунд
    var cancel = setTimeout(() => {
        task(); // Выполняем задачу
        setInterval(task, 33000 + randomOffset); // Запускаем интервал
    }, delay);
    return cancel;
}


const LatestWeatherData: React.FC = () => {
    const [latestData, setLatestData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const lastUpdatedMins = useMemo(() => {
        return latestData? Math.trunc((new Date().getTime()/1000 - latestData?.timestamp) / 60) : null;
    }, [latestData])

    const loadData = useCallback(async () => {
        setLoading(true);
            try {
                const dataList = await fetchWeatherData(['pro_main'], null, null, 1, 'DESC');
                const data = dataList[dataList.length - 1];
                //enrich wind data
                const dataOWMList = await fetchWeatherData(['owm_real'], null, null, 1, 'DESC');
                if (dataOWMList.length > 0){
                    const owmData = dataOWMList[dataOWMList.length - 1];
                    if (owmData && data.timestamp - owmData.timestamp < 1800) {
                        data.wind_speed = owmData.wind_speed;
                        data.wind_dir = owmData.wind_dir;
                        data.wind_gust = owmData.wind_gust;    
                    }
                }
                setLatestData(data);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            }
            setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
        const interval = startTask(loadData); // Обновление в каждые 30 секунд
        return () => clearInterval(interval);
    }, []);

    usePageVisibility(loadData);

    return (
        <>
                {latestData ? (
                    <>
                        {lastUpdatedMins !== null && (<div className="last-time">
                            { lastUpdatedMins > 10 ? '' : lastUpdatedMins < 2 ? 'сейчас' : `${lastUpdatedMins} мин. назад` }
                            <span>{dateFormatter(latestData.timestamp)}</span>
                            { loading && (<Loader />) }
                        </div>)
                        }
                        
                        <div className="latest-data">
                            <div className="widget">
                                <h3>Температура</h3>
                                <p>
                                    {latestData.temperature && latestData.temperature > 0 && (<span>+</span>)}
                                    {latestData.temperature}
                                    <span>°C</span>
                                </p>
                                
                            </div>
                            {latestData.pressure && (<div className="widget">
                                <h3>Давление</h3>
                                <p className="pressure">
                                    {Math.round(latestData.pressure)}
                                    <span>мм рт. ст.</span>
                                </p>
                                
                            </div>)}
                            {latestData.wind_speed && (<div className="widget">
                                <h3>Ветер - {latestData.wind_dir && getWindDirection(latestData.wind_dir)}</h3>
                                <p>
                                    {Math.round(latestData.wind_speed)}
                                    <span>м/с</span>
                                </p>
                                {latestData.wind_gust && (<h3>до {Math.round(latestData.wind_gust)} м/с</h3>)}
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
