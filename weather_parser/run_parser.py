# run_parser.py

import time
from random import random
from parser import fetch_weather_data
from database import save_to_db, create_tables
from config import FETCH_INTERVAL

if __name__ == "__main__":
    create_tables()  # Инициализация БД перед запуском
    fetchIntervalAmplifier = 1
    while True:
        try:
            weather_data_list = fetch_weather_data()
            if weather_data_list:
                for data in weather_data_list:
                    #print(data)
                    save_to_db(data)  # Сохраняем каждую таблицу отдельно
                fetchIntervalAmplifier = 1
        except Exception as e:
            if fetchIntervalAmplifier < 10:
                fetchIntervalAmplifier += 0.5 + random()
            print("round failed ", e, ". fetch interval =",FETCH_INTERVAL,", apm =", fetchIntervalAmplifier)
        finally:
            time.sleep(FETCH_INTERVAL * fetchIntervalAmplifier)
