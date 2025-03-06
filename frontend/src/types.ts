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

export interface ForecastData {
  source: string,
  timestamp: number;
  temperature?: number;
  pressure?: number;
  humidity?: number;
  wind_speed?: number;
  wind_dir?: number;
  wind_gust?: number;
}