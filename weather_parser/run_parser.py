# run_parser.py

import time
from parser import fetch_weather_data
from database import save_to_db, create_tables
from config import FETCH_INTERVAL

if __name__ == "__main__":
    create_tables()  # Инициализация БД перед запуском
    while True:
        weather_data_list = fetch_weather_data()
        if weather_data_list:
            for data in weather_data_list:
                print(data)
                save_to_db(data)  # Сохраняем каждую таблицу отдельно
        time.sleep(FETCH_INTERVAL)
