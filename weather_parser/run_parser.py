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

def get_sleep_interval():
    current_time = time.time()
    local_time = time.localtime(current_time)
    current_minute = local_time.tm_min
    current_second = local_time.tm_sec

    next_run_minute = (current_minute // 4 + 1) * 4
    if next_run_minute >= 60:
        next_run_minute = 0
        add_extra_hour = True  # Флаг, что переходим к следующему часу
    else:
        add_extra_hour = False

    wait_time = (next_run_minute - current_minute) * 60 - current_second

    if wait_time < 0:
        if add_extra_hour:
            wait_time += 3600  # Добавляем час, если перескочили на новый час
        else:
            wait_time += 240  # Добавляем 4 минуты в остальных случаях

    return wait_time + 20  # Добавляем 20 секунд

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
        time.sleep(get_sleep_interval())