import requests
import os

OWM_API_URL = "https://api.openweathermap.org/data/2.5/weather"
OWM_API_FORECAST_URL = f"https://api.openweathermap.org/data/2.5/forecast"
OWM_API_KEY = os.getenv("OWM_API_KEY")  # Читаем API-ключ из переменных окружения
CITY = "Protvino"

def fetch_openweather_data():
    """Запрашивает погоду из OpenWeatherMap API."""
    if not OWM_API_KEY:
        print("Ошибка: API-ключ не найден!")
        return None
    
    params = {
        "q": CITY,
        "appid": OWM_API_KEY,
        "units": "metric",  # Получаем температуру в градусах Цельсия
    }
    response = requests.get(OWM_API_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        return [{
            "source": 'owm_real',
            "timestamp": data["dt"],
            "temperature": data["main"]["temp"],
            "pressure": data["main"]["pressure"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
            "wind_dir": data["wind"]["deg"],  # Направление ветра в градусах
            "wind_gust": data["wind"].get("gust"), # Может отсутствовать
            "illuminance": None,
            "uv_index": None,
            "ir_value": None,
        }]
    else:
        print(f"Ошибка запроса OpenWeatherMap: {response.status_code}")
        return None

def fetch_forecast():
    if not OWM_API_KEY:
        print("Ошибка: API-ключ не найден!")
        return None
    
    params = {
        "q": CITY,
        "appid": OWM_API_KEY,
        "units": "metric",  # Получаем температуру в градусах Цельсия
    }
    response = requests.get(OWM_API_FORECAST_URL, params=params)
    if response.status_code == 200:
        resp = response.json()
        forecasts = resp["list"] 
        dataList = []
        for data in forecasts:
            dataList.append({
                "source": 'owm_fc',
                "timestamp": data["dt"],
                "temperature": data["main"]["temp"],
                "pressure": data["main"]["pressure"],
                "humidity": data["main"]["humidity"],
                "wind_speed": data["wind"]["speed"],
                "wind_dir": data["wind"]["deg"],  # Направление ветра в градусах
                "wind_gust": data["wind"].get("gust"), # Может отсутствовать
            })

        return dataList
    else:
        print(f"Ошибка запроса OpenWeatherMap: {response.status_code}")
        return None