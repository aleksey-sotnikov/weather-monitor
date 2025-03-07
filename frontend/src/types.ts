export interface WeatherData {
    timestamp: number; 
    source?: string;
    temperature?: number;
    humidity?: number;
    illuminance?: number;
    pressure?: number;
    uv_index?: number;
    ir_value?: number;
    wind_speed?: number;
    wind_dir?: number;
    wind_gust?: number;
}

export const Metrics: Record<keyof Omit<WeatherData, 'source' | 'timestamp'>, string> = {
  temperature: "Температура",
  pressure: "Давление",
  illuminance: "Освещенность",
  humidity: "Влажность",
  uv_index: "УФ индекс",
  ir_value: "ИК индекс",
  wind_speed: "Ветер",
  wind_dir: "Направление ветра",
  wind_gust: "Порывы ветра"
};
