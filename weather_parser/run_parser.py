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
            import traceback
            print("round failed:", e)
            print(traceback.format_exc())

if __name__ == "__main__":
    # Инициализация БД перед запуском
    create_tables() 
    while True:
        # protvino realtime weather parser
        parse(fetch_weather_data)
        # open weather map realtime parser
        parse(fetch_openweather_data)
        # open weather map forecast parser
        try:
            weather_data_list = fetch_forecast()
            if weather_data_list:
                save_forecast(weather_data_list)
        except Exception as e:
             import traceback
             print("forecast failed:", e)
             print(traceback.format_exc())
        # wait 
        time.sleep(FETCH_INTERVAL)