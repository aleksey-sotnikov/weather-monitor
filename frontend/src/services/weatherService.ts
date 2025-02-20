import { WeatherData } from "../types";

const API_URL = "http://localhost:8000/api/v1/weather";

export const fetchWeatherData = async (source?: string, startDate?: string, endDate?: string): Promise<WeatherData[]> => {
   
    let url = API_URL;

    const params = new URLSearchParams();
    if (source) params.append("source", source);
    if (startDate) params.append("start_date", Math.floor(new Date(startDate).getTime() / 1000).toString());
    if (endDate) params.append("end_date", Math.floor(new Date(endDate).getTime() / 1000).toString());

    if (params.toString()) url += `?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Ошибка запроса: ${response.statusText}`);
        }
        const responseBody = await response.json();
        return responseBody.data;
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        return [];
    }
};
