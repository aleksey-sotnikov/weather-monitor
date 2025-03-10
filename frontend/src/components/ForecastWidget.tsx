import { WeatherData } from "../types";

function getWindDirection(degrees: number): string {
  const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ", "С"];
  const index = Math.round(degrees / 45);
  return directions[index];
}

const tickTimeFormatter = (tick: number) => {
    const date = new Date(tick * 1000);
    return date.toLocaleString("ru-RU", {
        // day: "2-digit",
        // month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).replace(",", "");
  }

  const tickDateFormatter = (tick: number) => {
    const date = new Date(tick * 1000);
    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
    });
  }
  

  interface ForecastWidgetProps {
    data: WeatherData;
  }

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ data }) => {
    return (
        <>
         {(new Date(data.timestamp * 1000).getHours() === 0) && (<span className="forecast-day">{tickDateFormatter(data.timestamp)}</span>)}
         <div className="forecast-card">
            <div className="forecast-date">
                {tickTimeFormatter(data.timestamp)}
            </div>
            <div className="forecast-temp">{data.temperature && Math.round(data.temperature)}°C</div>
            <div className="forecast-pressure">{data.pressure} mm</div>
            <div className="forecast-humidity">{data.humidity} %</div>
            <div className="forecast-wind">
                {data.wind_speed && Math.round(data.wind_speed)} м/с {data.wind_dir && getWindDirection(data.wind_dir)} {data.wind_gust && (<span>до {Math.round(data.wind_gust!)} м/с</span>)}
            </div>
        </div>
        </>
        
    )
}