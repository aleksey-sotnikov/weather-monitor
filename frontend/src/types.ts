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