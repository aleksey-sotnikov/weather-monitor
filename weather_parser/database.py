# database.py

import sqlite3
from config import DB_FILE
import time
from datetime import datetime

def get_db_connection():
    """Создает и возвращает соединение с БД"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    """Создает таблицу с показателями погоды"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_data (
            source TEXT,
            timestamp REAL,
            temperature REAL,
            humidity REAL,
            pressure REAL,
            illuminance REAL,
            uv_index REAL,
            ir_value REAL,
            PRIMARY KEY (source, timestamp)
        )
    """)
    conn.commit()
    conn.close()

def save_to_db(data):
    """Сохраняет данные в БД одной строкой"""
    if not data:
        print("Нет данных для сохранения")
        return
    
    # Конвертируем ts в timestamp
    ts = data["timestamp"]
    timestamp = convert_to_timestamp(ts)
    if timestamp is None:
        print(f"Ошибка конвертации ts: {ts}")
        return

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR IGNORE INTO weather_data (source, timestamp, temperature, humidity, pressure, illuminance, uv_index, ir_value)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["source"],
        timestamp,
        data.get("temperature"),
        data.get("humidity"),
        data.get("pressure"),
        data.get("illuminance"),
        data.get("uv_index"),
        data.get("ir_value")
    ))
    conn.commit()
    conn.close()
    print(f"Данные сохранены в БД: {data['source']} | {data['timestamp']}")

def convert_to_timestamp(date_str):
    """Преобразует строку формата 'DD-MMM-YYYY HH:MM' в timestamp (секунды)."""
    try:
        return int(time.mktime(datetime.strptime(date_str, "%d-%b-%Y %H:%M").timetuple()))
    except ValueError:
        return None  # Если формат неправильный

