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
    # Получаем текущее время в секундах с начала эпохи
    current_time = time.time()
    
    # Преобразуем текущее время в локальное время
    local_time = time.localtime(current_time)
    
    # Получаем текущие минуты и секунды
    current_minute = local_time.tm_min
    current_second = local_time.tm_sec
    
    # Вычисляем следующую минуту, кратную 4
    next_run_minute = (current_minute // 4 + 1) * 4
    if next_run_minute >= 60:  # Если вышли за пределы часа
        next_run_minute = 0  # Переходим к следующему часу
    
    # Вычисляем время ожидания до следующей минуты, кратной 4
    wait_time = (next_run_minute - current_minute) * 60 - current_second
    
    # Если wait_time отрицательное (например, сейчас 3:59:50), корректируем
    if wait_time < 0:
        wait_time += 240  # Добавляем 4 минуты (240 секунд)
    
    return wait_time + 20 # Добавляем 20 секунд

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