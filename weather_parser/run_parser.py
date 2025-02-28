# run_parser.py

import time
from database import save_weather, save_forecast, create_tables
from parser_pro import fetch_weather_data
from parser_owm import fetch_openweather_data, fetch_forecast
from config import FETCH_INTERVAL

def parse(parser):
        try:
            weather_data_list = parser()
            if weather_data_list:
                save_weather(weather_data_list)  # Сохраняем каждую таблицу отдельно
        except Exception as e:
            print("round failed:", e)

if __name__ == "__main__":
    create_tables()  # Инициализация БД перед запуском
    while True:
        parse(fetch_weather_data)
        parse(fetch_openweather_data)
        # try:
        weather_data_list = fetch_forecast()
        if weather_data_list:
            save_forecast(weather_data_list)  # Сохраняем каждую таблицу отдельно
        # except Exception as e:
        #     print("forecast failed:", e)

        time.sleep(FETCH_INTERVAL)