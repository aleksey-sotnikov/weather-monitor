import { WeatherData } from "../types";

const BASE_API_URL = process.env.REACT_APP_API_URL;

export const fetchWeatherData = async (sources?: string[], startDate?: string | null, endDate?: string | null, limit?: number, dir?: string): Promise<WeatherData[]> => {
   
    let url = `${BASE_API_URL}/weather`;

    const params = new URLSearchParams();
    if (sources && sources.length) sources.forEach(source => params.append("src", source)); 
    if (startDate) params.append("start_date", Math.floor(new Date(startDate).getTime() / 1000).toString());
    if (endDate) params.append("end_date", Math.floor(new Date(endDate).getTime() / 1000).toString());
    if (limit) params.append("limit", `${limit}`);
    if (dir) params.append("dir", `${dir}`);

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

export const fetchWeatherForecast = async (sources?: string[], startDate?: string | null, endDate?: string | null, limit?: number, dir?: string): Promise<WeatherData[]> => {
   
    let url = `${BASE_API_URL}/weather/forecast`;

    const params = new URLSearchParams();
    if (sources && sources.length) sources.forEach(source => params.append("src", source)); 
    if (startDate) params.append("start_date", Math.floor(new Date(startDate).getTime() / 1000).toString());
    if (endDate) params.append("end_date", Math.floor(new Date(endDate).getTime() / 1000).toString());
    if (limit) params.append("limit", `${limit}`);
    if (dir) params.append("dir", `${dir}`);

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